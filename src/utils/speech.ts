import { LANGUAGES } from '../i18n/translations';
import { LanguageCode } from '../types';

export type MicPermissionState = 'prompt' | 'granted' | 'denied' | 'unavailable';

export interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence?: number;
}

export interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

export interface SpeechRecognitionResultEvent {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

export interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

export interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives?: number;
  onstart: (() => void) | null;
  onresult: ((ev: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let activeUtterance: SpeechSynthesisUtterance | null = null;
let speakDelayTimer: ReturnType<typeof setTimeout> | null = null;
let speakWatchdogTimer: ReturnType<typeof setTimeout> | null = null;
let sharedAudioCtx: AudioContext | null = null;

function refreshVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  try {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
    }
  } catch {
    // Ignore browser speechSynthesis voice list exceptions
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refreshVoices();
  try {
    window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
  } catch {
    // Ignore listener errors in restricted environments
  }
}

export function getSpeechRecognitionCtor(): (new () => BrowserSpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported(): boolean {
  return Boolean(getSpeechRecognitionCtor());
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

export function isMicHardwareApiAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean(navigator?.mediaDevices?.getUserMedia);
}

export function usesCloudAudioVoicePath(lang: LanguageCode): boolean {
  return lang === 'hi' || lang === 'mr';
}

export async function queryMicPermission(lang: LanguageCode = 'en'): Promise<MicPermissionState> {
  if (typeof window === 'undefined' || !isMicHardwareApiAvailable()) {
    return 'unavailable';
  }
  if (!usesCloudAudioVoicePath(lang) && !isSpeechRecognitionSupported()) {
    return 'unavailable';
  }
  try {
    if (navigator.permissions?.query) {
      const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (status.state === 'granted' || status.state === 'denied' || status.state === 'prompt') {
        return status.state;
      }
    }
  } catch {
    // Safari / Firefox may throw for 'microphone' permission query — fall back cleanly to 'prompt'
  }
  return 'prompt';
}

export interface MicRequestResult {
  state: MicPermissionState;
  errorDetail?: string;
}

export async function requestMicPermission(lang: LanguageCode = 'en'): Promise<MicPermissionState> {
  const detailed = await requestMicPermissionDetailed(lang);
  return detailed.state;
}

export async function requestMicPermissionDetailed(lang: LanguageCode = 'en'): Promise<MicRequestResult> {
  if (typeof window === 'undefined') {
    return { state: 'unavailable', errorDetail: 'window-unavailable' };
  }
  if (!isMicHardwareApiAvailable()) {
    return { state: 'unavailable', errorDetail: 'mediaDevices.getUserMedia-unsupported' };
  }
  if (!usesCloudAudioVoicePath(lang) && !isSpeechRecognitionSupported()) {
    return { state: 'unavailable', errorDetail: 'SpeechRecognition-unsupported' };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Release stream immediately so SpeechRecognition / MediaRecorder has exclusive microphone access
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        // Ignore track stop errors
      }
    });
    return { state: 'granted' };
  } catch (err) {
    const name = err instanceof DOMException ? err.name : err instanceof Error ? err.name : 'UnknownError';
    const message = err instanceof Error ? err.message : String(err);
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
      return { state: 'denied', errorDetail: `not-allowed (${name}: ${message})` };
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'NotSupportedError') {
      return { state: 'unavailable', errorDetail: `audio-capture (${name}: ${message})` };
    }
    return { state: 'denied', errorDetail: `${name}: ${message}` };
  }
}

export function getSpeechLocale(lang: LanguageCode): string {
  return LANGUAGES.find((l) => l.code === lang)?.speechLocale || 'en-IN';
}

function findBestVoice(
  lang: LanguageCode,
  voices: SpeechSynthesisVoice[]
): { voice?: SpeechSynthesisVoice; langCode: string; exactOrFamilyMatched: boolean } {
  const targetLocale = getSpeechLocale(lang).toLowerCase();
  const baseLang = lang.toLowerCase();
  const langName = (LANGUAGES.find((l) => l.code === lang)?.name || '').toLowerCase();

  // 1. Exact locale match (e.g. hi-IN, mr-IN, en-IN)
  const exact = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === targetLocale);
  if (exact) return { voice: exact, langCode: exact.lang, exactOrFamilyMatched: true };

  // 2. Base language prefix match (e.g. mr, hi, en)
  const prefix = voices.find(
    (v) => v.lang.toLowerCase().startsWith(`${baseLang}-`) || v.lang.toLowerCase() === baseLang
  );
  if (prefix) return { voice: prefix, langCode: prefix.lang, exactOrFamilyMatched: true };

  // 3. Name match (e.g. "Google हिन्दी", "Microsoft Aarav", "Marathi", "Swara")
  const byName = voices.find((v) => langName && v.name.toLowerCase().includes(langName));
  if (byName) return { voice: byName, langCode: byName.lang, exactOrFamilyMatched: true };

  // 4. Devanagari fallback for Marathi if mr-IN isn't installed on this OS
  if (lang === 'mr') {
    const hiVoice =
      voices.find((v) => v.lang.toLowerCase().replace('_', '-') === 'hi-in') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('hi'));
    if (hiVoice) return { voice: hiVoice, langCode: hiVoice.lang, exactOrFamilyMatched: false };
  }

  // 5. Fallback to default or en-IN / en voice so spoken output never silently fails
  const fallbackVoice =
    voices.find((v) => v.default) ||
    voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
    voices[0];

  return {
    voice: fallbackVoice,
    langCode: getSpeechLocale(lang),
    exactOrFamilyMatched: false,
  };
}

export function hasMatchingSpeechVoice(lang: LanguageCode): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  const voices = refreshVoices();
  if (voices.length === 0) return true; // Voices may still be hydrating asynchronously
  return findBestVoice(lang, voices).exactOrFamilyMatched;
}

function clearSpeechTimers() {
  if (speakDelayTimer) {
    clearTimeout(speakDelayTimer);
    speakDelayTimer = null;
  }
  if (speakWatchdogTimer) {
    clearTimeout(speakWatchdogTimer);
    speakWatchdogTimer = null;
  }
}

export function speakWarmly(
  text: string,
  lang: LanguageCode,
  onStart?: () => void,
  onEnd?: () => void
): { usedFallbackVoice: boolean } {
  const cleanText = text.trim();
  if (!cleanText || !isSpeechSynthesisSupported()) {
    onEnd?.();
    return { usedFallbackVoice: true };
  }

  const preVoices = refreshVoices();
  const usedFallbackVoice =
    preVoices.length > 0 ? !findBestVoice(lang, preVoices).exactOrFamilyMatched : false;

  clearSpeechTimers();

  const synth = window.speechSynthesis;
  let wasBusy = false;
  try {
    wasBusy = synth.speaking || synth.pending;
    if (wasBusy) {
      synth.cancel();
    }
  } catch {
    // Ignore cancel errors
  }

  const startUtterance = () => {
    try {
      const voices = refreshVoices();
      const { voice, langCode } = findBestVoice(lang, voices);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = langCode;
      utterance.rate = 0.92;
      utterance.pitch = 1.02;
      if (voice) {
        utterance.voice = voice;
      }

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        clearSpeechTimers();
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        onEnd?.();
      };

      utterance.onstart = () => {
        onStart?.();
      };
      utterance.onend = finish;
      utterance.onerror = finish;

      // Retain strong reference so Chrome does not garbage-collect utterance mid-speech
      activeUtterance = utterance;

      // Safety watchdog in case browser speech engine stalls without emitting onend
      const maxDurationMs = Math.min(40000, Math.max(9000, cleanText.length * 140));
      speakWatchdogTimer = setTimeout(finish, maxDurationMs);

      try {
        if (synth.paused) {
          synth.resume();
        }
      } catch {
        // Ignore resume errors
      }
      synth.speak(utterance);
    } catch {
      activeUtterance = null;
      clearSpeechTimers();
      onEnd?.();
    }
  };

  // Defer slightly when cancelling an active utterance or waiting for initial voice list (prevents Chrome cancel+speak drop)
  const needsVoiceTick = refreshVoices().length === 0;
  const delayMs = wasBusy ? 75 : needsVoiceTick ? 110 : 0;

  if (delayMs > 0) {
    speakDelayTimer = setTimeout(startUtterance, delayMs);
  } else {
    startUtterance();
  }
  return { usedFallbackVoice };
}

export function stopSpeaking(): void {
  clearSpeechTimers();
  activeUtterance = null;
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore cancel errors
    }
  }
}

export function playGentleChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx();
    }
    const ctx = sharedAudioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);
      gain.gain.setValueAtTime(0.001, now + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.18 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.18 + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 0.75);
    });
  } catch {
    // Ignore audio context restriction before user gesture
  }
}

export function playPinClickSound(digitIndex = 1): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx();
    }
    const ctx = sharedAudioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    // Soft tactile wooden click + gentle rising confirmation pip
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    const baseFreq = 420 + Math.min(digitIndex, 6) * 32;
    clickOsc.frequency.setValueAtTime(baseFreq, now);
    clickOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, now + 0.055);
    clickGain.gain.setValueAtTime(0.001, now);
    clickGain.gain.exponentialRampToValueAtTime(0.22, now + 0.008);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.07);
  } catch {
    // Ignore Web Audio errors
  }
}

let digitSpeechTimer: ReturnType<typeof setTimeout> | null = null;

export function playDigitEnteredAudio(spokenPhrase: string, lang: LanguageCode): void {
  if (typeof window === 'undefined' || !isSpeechSynthesisSupported()) return;
  if (digitSpeechTimer) {
    clearTimeout(digitSpeechTimer);
    digitSpeechTimer = null;
  }
  const clean = spokenPhrase.trim();
  if (!clean) return;
  digitSpeechTimer = setTimeout(() => {
    try {
      const synth = window.speechSynthesis;
      if (synth.speaking || synth.pending) {
        synth.cancel();
      }
      const voices = refreshVoices();
      const { voice, langCode } = findBestVoice(lang, voices);
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = langCode;
      utterance.rate = 1.05;
      utterance.pitch = 1.04;
      utterance.volume = 0.85;
      if (voice) utterance.voice = voice;
      activeUtterance = utterance;
      utterance.onend = () => {
        if (activeUtterance === utterance) activeUtterance = null;
      };
      utterance.onerror = () => {
        if (activeUtterance === utterance) activeUtterance = null;
      };
      synth.speak(utterance);
    } catch {
      // Ignore synthesis restrictions before browser gesture
    }
  }, 45);
}

