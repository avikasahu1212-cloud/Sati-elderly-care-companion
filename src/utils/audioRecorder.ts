export interface RecordedWavResult {
  base64Wav: string;
  mimeType: 'audio/wav';
  durationMs: number;
  hadSpeech: boolean;
}

export interface RecorderCallbacks {
  onLevel?: (level: number, elapsedMs: number, speechDetected: boolean) => void;
  onAutoStop?: (reason: 'silence' | 'max_duration') => void;
  onError?: (reasonCode: string) => void;
}

export function isAudioRecorderSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(navigator?.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined' &&
    Boolean(
      window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    )
  );
}

function getSupportedRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

function encodeMono16BitWav(samples: Float32Array, sampleRate = 16000): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate (sampleRate * channels * bytesPerSample)
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

export async function convertAudioBlobTo16kMonoWavBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    throw new Error('audiocontext-unsupported');
  }

  const decodeCtx = new AudioCtx();
  let decoded: AudioBuffer;
  try {
    decoded = await decodeCtx.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    try {
      await decodeCtx.close();
    } catch {
      // Ignore close errors
    }
  }

  const targetSampleRate = 16000;
  const targetLength = Math.max(1, Math.ceil(decoded.duration * targetSampleRate));

  const OfflineCtx =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
      .webkitOfflineAudioContext;

  let monoSamples: Float32Array;
  if (OfflineCtx) {
    const offline = new OfflineCtx(1, targetLength, targetSampleRate);
    const source = offline.createBufferSource();
    // Mix down multi-channel input cleanly into mono before/during render
    const monoInput = offline.createBuffer(1, decoded.length, decoded.sampleRate);
    const monoChannel = monoInput.getChannelData(0);
    const numChannels = decoded.numberOfChannels;
    for (let ch = 0; ch < numChannels; ch++) {
      const data = decoded.getChannelData(ch);
      for (let i = 0; i < decoded.length; i++) {
        monoChannel[i] += data[i] / numChannels;
      }
    }
    source.buffer = monoInput;
    source.connect(offline.destination);
    source.start(0);
    const rendered = await offline.startRendering();
    monoSamples = rendered.getChannelData(0);
  } else {
    // Fallback linear downsampler if OfflineAudioContext is unavailable
    const ch0 = decoded.getChannelData(0);
    const ratio = decoded.sampleRate / targetSampleRate;
    const outLen = Math.max(1, Math.floor(ch0.length / ratio));
    monoSamples = new Float32Array(outLen);
    for (let i = 0; i < outLen; i++) {
      monoSamples[i] = ch0[Math.min(ch0.length - 1, Math.floor(i * ratio))];
    }
  }

  const wavBuffer = encodeMono16BitWav(monoSamples, targetSampleRate);
  return arrayBufferToBase64(wavBuffer);
}

export class AudioCaptureController {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private audioCtx: AudioContext | null = null;
  private monitorTimer: ReturnType<typeof setInterval> | null = null;
  private maxTimer: ReturnType<typeof setTimeout> | null = null;
  private chunks: BlobPart[] = [];
  private startedAt = 0;
  private lastSpeechAt = 0;
  private hadSpeech = false;
  private isStopping = false;
  private resolveStop: ((result: RecordedWavResult | null) => void) | null = null;
  private stopPromise: Promise<RecordedWavResult | null> | null = null;
  private cancelled = false;

  async start(
    callbacks: RecorderCallbacks = {},
    options: { silenceDurationMs?: number; maxDurationMs?: number; noSpeechTimeoutMs?: number } = {}
  ): Promise<void> {
    if (!isAudioRecorderSupported()) {
      throw new Error('mediarecorder-unsupported');
    }

    const silenceDurationMs = options.silenceDurationMs ?? 1500;
    const maxDurationMs = options.maxDurationMs ?? 20000;
    const noSpeechTimeoutMs = options.noSpeechTimeoutMs ?? 8000;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.name === 'SecurityError') {
          throw new Error('not-allowed');
        }
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          throw new Error('audio-capture');
        }
        throw new Error(`${err.name}: ${err.message}`);
      }
      throw new Error('audio-capture');
    }

    this.stream = stream;
    this.chunks = [];
    this.startedAt = Date.now();
    this.lastSpeechAt = this.startedAt;
    this.hadSpeech = false;
    this.isStopping = false;
    this.cancelled = false;

    const mimeType = getSupportedRecorderMimeType();
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    this.recorder = recorder;

    this.stopPromise = new Promise<RecordedWavResult | null>((resolve) => {
      this.resolveStop = resolve;
    });

    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) {
        this.chunks.push(ev.data);
      }
    };

    recorder.onerror = () => {
      callbacks.onError?.('mediarecorder-error');
      this.cleanupHardware();
      this.resolveStop?.(null);
    };

    recorder.onstop = async () => {
      const durationMs = Date.now() - this.startedAt;
      const hadSpeech = this.hadSpeech;
      const recordedChunks = [...this.chunks];
      const wasCancelled = this.cancelled;
      this.cleanupHardware();

      if (wasCancelled || recordedChunks.length === 0) {
        this.resolveStop?.(null);
        return;
      }

      try {
        const rawBlob = new Blob(recordedChunks, { type: recorder.mimeType || 'audio/webm' });
        if (rawBlob.size < 256) {
          this.resolveStop?.(null);
          return;
        }
        const base64Wav = await convertAudioBlobTo16kMonoWavBase64(rawBlob);
        this.resolveStop?.({
          base64Wav,
          mimeType: 'audio/wav',
          durationMs,
          hadSpeech,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'wav-conversion-failed';
        callbacks.onError?.(`wav-error: ${msg}`);
        this.resolveStop?.(null);
      }
    };

    // Real-time silence detector using Web Audio AnalyserNode
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
        this.audioCtx = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.fftSize);

        // Track speech after brief 300ms mic stabilization window
        const SPEECH_RMS_THRESHOLD = 0.022;
        this.monitorTimer = setInterval(() => {
          if (this.isStopping || this.cancelled) return;
          analyser.getByteTimeDomainData(dataArray);
          let sumSq = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const norm = (dataArray[i] - 128) / 128;
            sumSq += norm * norm;
          }
          const rms = Math.sqrt(sumSq / dataArray.length);
          const now = Date.now();
          const elapsed = now - this.startedAt;

          if (elapsed > 280 && rms >= SPEECH_RMS_THRESHOLD) {
            this.hadSpeech = true;
            this.lastSpeechAt = now;
          }

          callbacks.onLevel?.(Math.min(1, rms * 8), elapsed, this.hadSpeech);

          if (this.hadSpeech && now - this.lastSpeechAt >= silenceDurationMs) {
            callbacks.onAutoStop?.('silence');
            this.stop().catch(() => {});
          } else if (!this.hadSpeech && elapsed >= noSpeechTimeoutMs) {
            callbacks.onAutoStop?.('silence');
            this.stop().catch(() => {});
          }
        }, 80);
      }
    } catch {
      // If AnalyserNode setup fails on an unusual browser, timer below still caps recording cleanly
    }

    this.maxTimer = setTimeout(() => {
      if (!this.isStopping && !this.cancelled) {
        callbacks.onAutoStop?.('max_duration');
        this.stop().catch(() => {});
      }
    }, maxDurationMs);

    recorder.start(200);
  }

  async stop(): Promise<RecordedWavResult | null> {
    if (this.isStopping) {
      return this.stopPromise;
    }
    this.isStopping = true;
    this.clearTimers();

    if (this.recorder && this.recorder.state !== 'inactive') {
      try {
        this.recorder.stop();
      } catch {
        this.cleanupHardware();
        this.resolveStop?.(null);
      }
    } else {
      this.cleanupHardware();
      this.resolveStop?.(null);
    }

    return this.stopPromise;
  }

  cancel(): void {
    this.cancelled = true;
    this.isStopping = true;
    this.clearTimers();
    if (this.recorder && this.recorder.state !== 'inactive') {
      try {
        this.recorder.stop();
      } catch {
        this.cleanupHardware();
        this.resolveStop?.(null);
      }
    } else {
      this.cleanupHardware();
      this.resolveStop?.(null);
    }
  }

  private clearTimers(): void {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = null;
    }
    if (this.maxTimer) {
      clearTimeout(this.maxTimer);
      this.maxTimer = null;
    }
  }

  private cleanupHardware(): void {
    this.clearTimers();
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore track stop errors
        }
      });
      this.stream = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close().catch(() => {});
      } catch {
        // Ignore close errors
      }
      this.audioCtx = null;
    }
  }
}
