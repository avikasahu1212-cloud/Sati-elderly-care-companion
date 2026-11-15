import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Keyboard,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  ShieldAlert,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { formatTemplate, getT } from '../i18n/translations';
import {
  askSatiCompanion,
  askSatiWithAudio,
  GeminiRequestError,
  SatiChatResponse,
} from '../services/geminiService';
import { CareCircleState } from '../types';
import { AudioCaptureController, isAudioRecorderSupported } from '../utils/audioRecorder';
import {
  BrowserSpeechRecognition,
  getSpeechLocale,
  getSpeechRecognitionCtor,
  hasMatchingSpeechVoice,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  MicPermissionState,
  queryMicPermission,
  requestMicPermissionDetailed,
  speakWarmly,
  stopSpeaking,
  usesCloudAudioVoicePath,
} from '../utils/speech';
import { SatiMicOrb } from './SatiMicOrb';

interface TalkToSatiPanelProps {
  state: CareCircleState;
  todayStr: string;
  onAppendMessage: (msg: {
    role: 'user' | 'assistant';
    text: string;
    triageLevel?: 'NONE' | 'MILD' | 'CONCERNING' | 'EMERGENCY';
  }) => void;
  onTriggerEmergency: (reason: string) => void;
  onAlertCaretaker: (reason: string) => void;
  onSendFamilyMessage?: (params: {
    targetHint: string;
    originalMessage: string;
    summary: string;
  }) => { recipientNames: string[] };
  largeTextClass?: string;
}

function stripWakePhrase(raw: string): string {
  const trimmed = raw.trim();
  const cleaned = trimmed.replace(/^(hey\s+sati|hey\s+sathi|hi\s+sati|हे\s+सती|सती|sati|sathi)[,\s]*/i, '').trim();
  return cleaned || trimmed;
}

function matchesWakePhrase(text: string): boolean {
  const norm = text.toLowerCase().trim();
  return /\b(hey\s*sati|hey\s*sathi|hi\s*sati|ok\s*sati|sati|sathi)\b/.test(norm);
}

export function TalkToSatiPanel({
  state,
  todayStr,
  onAppendMessage,
  onTriggerEmergency,
  onAlertCaretaker,
  onSendFamilyMessage,
  largeTextClass = 'text-xl',
}: TalkToSatiPanelProps) {
  const t = getT(state.language);
  const synthSupported = isSpeechSynthesisSupported();
  const isCloudAudioMode = usesCloudAudioVoicePath(state.language);

  const [inputText, setInputText] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [lastHeardTranscript, setLastHeardTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [voiceErrorDetail, setVoiceErrorDetail] = useState('');
  const [micPermission, setMicPermission] = useState<MicPermissionState>('prompt');
  const [checkingPermission, setCheckingPermission] = useState(false);
  const [highlightFallback, setHighlightFallback] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [usedFallbackVoice, setUsedFallbackVoice] = useState(() => !hasMatchingSpeechVoice(state.language));
  const [wakeListenerActive, setWakeListenerActive] = useState(false);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const wakeRecRef = useRef<BrowserSpeechRecognition | null>(null);
  const wakeEligibleRef = useRef(true);
  const recorderRef = useRef<AudioCaptureController | null>(null);
  const autoStopReasonRef = useRef<'silence' | 'max_duration' | null>(null);
  const finishingAudioRef = useRef(false);
  const startingAudioRef = useRef(false);
  const latestTranscriptRef = useRef('');
  const cancelledRef = useRef(false);
  const sentThisSessionRef = useRef(false);
  const isMountedRef = useRef(true);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const focusFallbackInput = useCallback(() => {
    setHighlightFallback(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 80);
  }, []);

  const stopWakeListener = useCallback(() => {
    const wake = wakeRecRef.current;
    wakeRecRef.current = null;
    if (isMountedRef.current) {
      setWakeListenerActive(false);
    }
    if (!wake) return;
    try {
      wake.onstart = null;
      wake.onresult = null;
      wake.onerror = null;
      wake.onend = null;
      wake.abort?.();
    } catch {
      try {
        wake.stop();
      } catch {
        // Ignore wake stop errors
      }
    }
  }, []);

  const stopActiveVoiceCapture = useCallback(() => {
    cancelledRef.current = true;
    startingAudioRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort?.();
      } catch {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore stop errors
        }
      }
      recognitionRef.current = null;
    }
    if (recorderRef.current) {
      try {
        recorderRef.current.cancel();
      } catch {
        // Ignore recorder cancel errors
      }
      recorderRef.current = null;
    }
    if (isMountedRef.current) {
      setIsListening(false);
      setLiveTranscript('');
      setAudioLevel(0);
      setRecordingSeconds(0);
    }
    latestTranscriptRef.current = '';
  }, []);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatHistory.length, isThinking, isProcessingAudio]);

  useEffect(() => {
    isMountedRef.current = true;
    let permStatus: PermissionStatus | null = null;
    const handlePermChange = () => {
      if (!isMountedRef.current || !permStatus) return;
      if (permStatus.state === 'granted' || permStatus.state === 'denied' || permStatus.state === 'prompt') {
        setMicPermission(permStatus.state);
        if (permStatus.state === 'granted') {
          setStatusNote('');
          setVoiceErrorDetail('');
          setHighlightFallback(false);
          wakeEligibleRef.current = true;
        }
      }
    };

    queryMicPermission(state.language).then((perm) => {
      if (!isMountedRef.current) return;
      setMicPermission(perm);
      if (perm === 'denied' || perm === 'unavailable') {
        setHighlightFallback(true);
      }
    });

    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((status) => {
          if (!isMountedRef.current) return;
          permStatus = status;
          status.addEventListener?.('change', handlePermChange);
        })
        .catch(() => {
          // Ignore browsers that do not support microphone permissions.query
        });
    }

    return () => {
      isMountedRef.current = false;
      stopWakeListener();
      stopActiveVoiceCapture();
      if (permStatus) {
        permStatus.removeEventListener?.('change', handlePermChange);
      }
      stopSpeaking();
    };
  }, [state.language, stopActiveVoiceCapture, stopWakeListener]);

  // Reset voice session & check native TTS voice when language changes
  useEffect(() => {
    stopWakeListener();
    stopActiveVoiceCapture();
    stopSpeaking();
    setIsSpeaking(false);
    setStatusNote('');
    setVoiceErrorDetail('');
    setLastHeardTranscript('');
    setUsedFallbackVoice(!hasMatchingSpeechVoice(state.language));
    queryMicPermission(state.language).then((perm) => {
      if (!isMountedRef.current) return;
      setMicPermission(perm);
    });
  }, [state.language, stopActiveVoiceCapture, stopWakeListener]);

  const applySatiResponse = useCallback(
    (userText: string, res: SatiChatResponse) => {
      let replyText = res.replyText;

      if (res.familyCommand?.detected && onSendFamilyMessage) {
        const result = onSendFamilyMessage({
          targetHint: res.familyCommand.targetHint,
          originalMessage: userText,
          summary: res.familyCommand.messageSummary || userText,
        });
        if (!replyText.trim()) {
          replyText = formatTemplate(t.familyMsgSentConfirm, {
            recipients: result.recipientNames.join(', '),
            summary: res.familyCommand.messageSummary || userText,
          });
        }
      }

      onAppendMessage({
        role: 'assistant',
        text: replyText,
        triageLevel: res.triageLevel,
      });

      if (!voiceMuted && synthSupported && replyText) {
        const speechResult = speakWarmly(
          replyText,
          state.language,
          () => {
            if (isMountedRef.current) setIsSpeaking(true);
          },
          () => {
            if (isMountedRef.current) setIsSpeaking(false);
          }
        );
        if (isMountedRef.current) {
          setUsedFallbackVoice(speechResult.usedFallbackVoice);
        }
      } else if (!synthSupported) {
        setUsedFallbackVoice(true);
      }

      if (res.shouldTriggerEmergency || res.triageLevel === 'EMERGENCY') {
        onTriggerEmergency(res.alertReason || userText);
      } else if (res.shouldAlertCaretaker || res.triageLevel === 'CONCERNING') {
        onAlertCaretaker(res.alertReason || `${state.elderly.honorificName} shared: "${userText}"`);
      }
    },
    [
      onAlertCaretaker,
      onAppendMessage,
      onSendFamilyMessage,
      onTriggerEmergency,
      state.elderly.honorificName,
      state.language,
      synthSupported,
      t.familyMsgSentConfirm,
      voiceMuted,
    ]
  );

  const handleSend = useCallback(
    async (rawText: string) => {
      const clean = rawText.trim();
      if (!clean || isThinking || isProcessingAudio) return;

      setInputText('');
      setStatusNote('');
      setVoiceErrorDetail('');
      setHighlightFallback(false);
      onAppendMessage({ role: 'user', text: clean });
      setIsThinking(true);

      try {
        const res = await askSatiCompanion(clean, state, todayStr);
        if (!isMountedRef.current) return;
        applySatiResponse(clean, res);
      } catch (err) {
        if (!isMountedRef.current) return;
        const detail =
          err instanceof GeminiRequestError
            ? err.detail || err.message
            : err instanceof Error
            ? `gemini-error: ${err.message}`
            : 'gemini-error: unknown';
        setStatusNote(t.geminiErrorChat);
        setVoiceErrorDetail(detail);
      } finally {
        if (isMountedRef.current) {
          setIsThinking(false);
        }
      }
    },
    [applySatiResponse, isProcessingAudio, isThinking, onAppendMessage, state, t.geminiErrorChat, todayStr]
  );

  const finishCloudAudioRecording = useCallback(
    async (controller: AudioCaptureController) => {
      if (finishingAudioRef.current) return;
      finishingAudioRef.current = true;
      if (recorderRef.current === controller) {
        recorderRef.current = null;
      }

      if (isMountedRef.current) {
        setIsListening(false);
        setAudioLevel(0);
        setRecordingSeconds(0);
        setIsProcessingAudio(true);
      }

      try {
        const wav = await controller.stop();
        if (!isMountedRef.current || cancelledRef.current) return;

        if (!wav) {
          setStatusNote((prev) => prev || t.micNoSpeechMsg);
          setVoiceErrorDetail((prev) => prev || 'no-speech');
          return;
        }

        if (!wav.hadSpeech && autoStopReasonRef.current === 'silence' && wav.durationMs >= 7500) {
          setStatusNote(t.micNoSpeechMsg);
          setVoiceErrorDetail('no-speech');
          return;
        }

        const res = await askSatiWithAudio(wav.base64Wav, wav.mimeType, state, todayStr);
        if (!isMountedRef.current) return;

        if (res.noSpeechDetected || !res.transcript.trim()) {
          setStatusNote(t.micNoSpeechMsg);
          setVoiceErrorDetail('no-speech');
          return;
        }

        const heard = res.transcript.trim();
        setLastHeardTranscript(heard);
        onAppendMessage({ role: 'user', text: heard });
        applySatiResponse(heard, res);
      } catch (err) {
        if (!isMountedRef.current) return;
        const detail =
          err instanceof GeminiRequestError
            ? err.detail || err.message
            : err instanceof Error
            ? `gemini-error: ${err.message}`
            : 'gemini-error: audio-request-failed';
        setStatusNote(t.geminiErrorChat);
        setVoiceErrorDetail(detail);
        focusFallbackInput();
      } finally {
        finishingAudioRef.current = false;
        autoStopReasonRef.current = null;
        if (isMountedRef.current) {
          setIsProcessingAudio(false);
        }
      }
    },
    [applySatiResponse, focusFallbackInput, onAppendMessage, state, t.geminiErrorChat, t.micNoSpeechMsg, todayStr]
  );

  const startCloudAudioRecording = useCallback(async () => {
    if (startingAudioRef.current || isListening || isThinking || isProcessingAudio) return;

    if (!isAudioRecorderSupported()) {
      setMicPermission('unavailable');
      setStatusNote(t.micUnavailableMsg);
      setVoiceErrorDetail('mediarecorder-unsupported');
      focusFallbackInput();
      return;
    }

    startingAudioRef.current = true;
    stopWakeListener();
    stopSpeaking();
    setIsSpeaking(false);
    setStatusNote('');
    setVoiceErrorDetail('');
    setAudioLevel(0);
    setRecordingSeconds(0);
    cancelledRef.current = false;
    autoStopReasonRef.current = null;
    finishingAudioRef.current = false;

    // Brief yield so passive wake SpeechRecognition releases audio hardware cleanly if it was active
    await new Promise((r) => setTimeout(r, 140));
    if (!isMountedRef.current || cancelledRef.current) {
      startingAudioRef.current = false;
      return;
    }

    const controller = new AudioCaptureController();
    recorderRef.current = controller;

    try {
      await controller.start(
        {
          onLevel: (level, elapsedMs) => {
            if (!isMountedRef.current) return;
            setAudioLevel(level);
            setRecordingSeconds(Math.min(20, Math.floor(elapsedMs / 1000)));
          },
          onAutoStop: (reason) => {
            if (!isMountedRef.current || cancelledRef.current) return;
            autoStopReasonRef.current = reason;
            finishCloudAudioRecording(controller);
          },
          onError: (reasonCode) => {
            if (!isMountedRef.current) return;
            recorderRef.current = null;
            setIsListening(false);
            setIsProcessingAudio(false);
            setStatusNote(t.micAudioErrorMsg);
            setVoiceErrorDetail(reasonCode);
            focusFallbackInput();
          },
        },
        {
          silenceDurationMs: 1500,
          maxDurationMs: 20000,
          noSpeechTimeoutMs: 8000,
        }
      );
      startingAudioRef.current = false;
      if (!isMountedRef.current) {
        controller.cancel();
        return;
      }
      setMicPermission('granted');
      setHighlightFallback(false);
      setIsListening(true);
    } catch (err) {
      startingAudioRef.current = false;
      recorderRef.current = null;
      setIsListening(false);
      const code = err instanceof Error ? err.message : 'audio-capture';
      setVoiceErrorDetail(code);
      if (code === 'not-allowed') {
        setMicPermission('denied');
        setStatusNote(t.micDeniedMsg);
      } else if (code === 'mediarecorder-unsupported') {
        setMicPermission('unavailable');
        setStatusNote(t.micUnavailableMsg);
      } else {
        setStatusNote(t.micAudioErrorMsg);
      }
      focusFallbackInput();
    }
  }, [
    finishCloudAudioRecording,
    focusFallbackInput,
    isListening,
    isProcessingAudio,
    isThinking,
    stopWakeListener,
    t.micAudioErrorMsg,
    t.micDeniedMsg,
    t.micUnavailableMsg,
  ]);

  const startEnglishSpeechRecognition = useCallback(() => {
    const RecognitionCtor = getSpeechRecognitionCtor();
    if (!RecognitionCtor) {
      setMicPermission('unavailable');
      setStatusNote(t.micUnavailableMsg);
      setVoiceErrorDetail('SpeechRecognition-unsupported');
      focusFallbackInput();
      return;
    }

    stopSpeaking();
    setIsSpeaking(false);
    setStatusNote('');
    setVoiceErrorDetail('');
    setLiveTranscript('');
    latestTranscriptRef.current = '';
    cancelledRef.current = false;
    sentThisSessionRef.current = false;

    try {
      const rec = new RecognitionCtor();
      rec.lang = getSpeechLocale(state.language);
      rec.interimResults = true;
      rec.continuous = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        if (!isMountedRef.current) return;
        setMicPermission('granted');
        setHighlightFallback(false);
        setIsListening(true);
      };

      rec.onresult = (event) => {
        if (!isMountedRef.current) return;
        let finalText = '';
        let interimText = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const segment = result?.[0]?.transcript || '';
          if (result?.isFinal) {
            finalText += `${segment} `;
          } else {
            interimText += segment;
          }
        }
        const combined = `${finalText}${interimText}`.trim();
        latestTranscriptRef.current = combined;
        setLiveTranscript(combined);
      };

      rec.onerror = (ev) => {
        if (!isMountedRef.current) return;
        const errCode = ev?.error || 'unknown-speech-error';
        const errMessage = ev?.message ? `: ${ev.message}` : '';
        recognitionRef.current = null;
        setIsListening(false);

        if (errCode === 'aborted' && cancelledRef.current) {
          return;
        }

        cancelledRef.current = true;
        setLiveTranscript('');
        latestTranscriptRef.current = '';
        setVoiceErrorDetail(`${errCode}${errMessage}`);

        if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
          setMicPermission('denied');
          setStatusNote(t.micDeniedMsg);
          focusFallbackInput();
        } else if (errCode === 'audio-capture') {
          setStatusNote(t.micAudioErrorMsg);
          focusFallbackInput();
        } else if (errCode === 'network') {
          setStatusNote(t.micNetworkErrorMsg);
          focusFallbackInput();
        } else if (errCode === 'language-not-supported') {
          setStatusNote(t.micUnavailableMsg);
          focusFallbackInput();
        } else if (errCode === 'no-speech') {
          setStatusNote(t.micNoSpeechMsg);
        } else {
          setStatusNote(t.micNoSpeechMsg);
          focusFallbackInput();
        }
      };

      rec.onend = () => {
        if (!isMountedRef.current) return;
        recognitionRef.current = null;
        setIsListening(false);

        const captured = latestTranscriptRef.current.trim();
        setLiveTranscript('');
        latestTranscriptRef.current = '';

        if (!cancelledRef.current && captured && !sentThisSessionRef.current) {
          sentThisSessionRef.current = true;
          const cleaned = stripWakePhrase(captured);
          setLastHeardTranscript(cleaned);
          handleSend(cleaned);
        }
      };

      recognitionRef.current = rec;
      setIsListening(true);
      rec.start();
    } catch (err) {
      recognitionRef.current = null;
      setIsListening(false);
      setStatusNote(t.micAudioErrorMsg);
      setVoiceErrorDetail(err instanceof Error ? err.message : 'speech-recognition-start-failed');
      focusFallbackInput();
    }
  }, [
    focusFallbackInput,
    handleSend,
    state.language,
    t.micAudioErrorMsg,
    t.micDeniedMsg,
    t.micNetworkErrorMsg,
    t.micNoSpeechMsg,
    t.micUnavailableMsg,
  ]);

  const startListening = useCallback(() => {
    if (isCloudAudioMode) {
      startCloudAudioRecording();
    } else {
      startEnglishSpeechRecognition();
    }
  }, [isCloudAudioMode, startCloudAudioRecording, startEnglishSpeechRecognition]);

  // Passive English "Hey Sati" wake-word listener for Hindi/Marathi when mic permission is already granted
  useEffect(() => {
    const canRunWake =
      isCloudAudioMode &&
      micPermission === 'granted' &&
      !isListening &&
      !isThinking &&
      !isProcessingAudio &&
      !isSpeaking &&
      !voiceMuted &&
      wakeEligibleRef.current &&
      isSpeechRecognitionSupported();

    if (!canRunWake) {
      stopWakeListener();
      return;
    }

    const RecognitionCtor = getSpeechRecognitionCtor();
    if (!RecognitionCtor) return;

    let cancelledWake = false;
    let startedOnce = false;
    let restartTimer: ReturnType<typeof setTimeout> | null = null;

    const launchWake = () => {
      if (cancelledWake || !isMountedRef.current) return;
      try {
        const wakeRec = new RecognitionCtor();
        wakeRec.lang = 'en-IN';
        wakeRec.interimResults = true;
        wakeRec.continuous = true;
        wakeRec.maxAlternatives = 1;

        wakeRec.onstart = () => {
          startedOnce = true;
          if (isMountedRef.current && !cancelledWake) {
            setWakeListenerActive(true);
          }
        };

        wakeRec.onresult = (event) => {
          if (cancelledWake || !isMountedRef.current) return;
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i]?.[0]?.transcript || '';
            if (matchesWakePhrase(transcript)) {
              cancelledWake = true;
              stopWakeListener();
              startCloudAudioRecording();
              return;
            }
          }
        };

        wakeRec.onerror = (ev) => {
          if (ev?.error === 'not-allowed' || ev?.error === 'service-not-allowed' || ev?.error === 'audio-capture') {
            wakeEligibleRef.current = false;
          }
          wakeRecRef.current = null;
          if (isMountedRef.current) setWakeListenerActive(false);
        };

        wakeRec.onend = () => {
          wakeRecRef.current = null;
          if (isMountedRef.current) setWakeListenerActive(false);
          if (!cancelledWake && startedOnce && wakeEligibleRef.current && isMountedRef.current) {
            restartTimer = setTimeout(launchWake, 450);
          }
        };

        wakeRecRef.current = wakeRec;
        wakeRec.start();
      } catch {
        wakeEligibleRef.current = false;
        if (isMountedRef.current) setWakeListenerActive(false);
      }
    };

    const initialTimer = setTimeout(launchWake, 250);

    return () => {
      cancelledWake = true;
      clearTimeout(initialTimer);
      if (restartTimer) clearTimeout(restartTimer);
      stopWakeListener();
    };
  }, [
    isCloudAudioMode,
    isListening,
    isProcessingAudio,
    isSpeaking,
    isThinking,
    micPermission,
    startCloudAudioRecording,
    stopWakeListener,
    voiceMuted,
  ]);

  const stopAndSendVoice = useCallback(() => {
    cancelledRef.current = false;

    if (isCloudAudioMode) {
      const controller = recorderRef.current;
      if (controller) {
        autoStopReasonRef.current = null;
        finishCloudAudioRecording(controller);
      }
      return;
    }

    const captured = latestTranscriptRef.current.trim();
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore stop errors
    }
    recognitionRef.current = null;
    setIsListening(false);
    setLiveTranscript('');
    latestTranscriptRef.current = '';

    if (captured && !sentThisSessionRef.current) {
      sentThisSessionRef.current = true;
      const cleaned = stripWakePhrase(captured);
      setLastHeardTranscript(cleaned);
      handleSend(cleaned);
    }
  }, [finishCloudAudioRecording, handleSend, isCloudAudioMode]);

  const cancelVoice = useCallback(() => {
    stopActiveVoiceCapture();
  }, [stopActiveVoiceCapture]);

  const handleAllowMic = async () => {
    setCheckingPermission(true);
    setStatusNote('');
    setVoiceErrorDetail('');
    const result = await requestMicPermissionDetailed(state.language);
    if (!isMountedRef.current) return;
    setCheckingPermission(false);
    setMicPermission(result.state);
    if (result.errorDetail) {
      setVoiceErrorDetail(result.errorDetail);
    }

    if (result.state === 'granted') {
      wakeEligibleRef.current = true;
      setHighlightFallback(false);
      startListening();
    } else if (result.state === 'denied') {
      setStatusNote(t.micDeniedMsg);
      focusFallbackInput();
    } else if (result.state === 'unavailable') {
      setStatusNote(t.micUnavailableMsg);
      focusFallbackInput();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopAndSendVoice();
      return;
    }
    if (isThinking || isProcessingAudio) return;
    if (micPermission === 'unavailable') {
      setStatusNote(t.micUnavailableMsg);
      if (!voiceErrorDetail) {
        setVoiceErrorDetail(isCloudAudioMode ? 'mediarecorder-unsupported' : 'SpeechRecognition-unsupported');
      }
      focusFallbackInput();
      return;
    }
    startListening();
  };

  const quickPrompts = [t.quickPrompt1, t.quickPrompt2, t.quickPrompt3, t.quickPrompt4];
  const latestAssistantMsg = [...state.chatHistory].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] shadow-sm flex flex-col overflow-hidden">
      {/* Header & Voice Control */}
      <div className="px-6 sm:px-8 py-6 bg-[#FAF7F2] border-b border-[#DFD5C5] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#131B19]">
            {t.talkToSatiTitle}
          </h1>
          <p className="sati-muted text-lg text-[#3E4C48]">
            {isListening
              ? t.listeningNow
              : isProcessingAudio
              ? t.processingVoiceLabel
              : isSpeaking
              ? t.satiSpeaking
              : t.tapMicHint}
          </p>
        </div>
        <button
          type="button"
          aria-pressed={voiceMuted}
          onClick={() => {
            if (!voiceMuted) {
              stopSpeaking();
              setIsSpeaking(false);
            }
            setVoiceMuted(!voiceMuted);
          }}
          className="min-h-[52px] px-5 rounded-2xl bg-white hover:bg-[#F2ECE1] border-2 border-[#DFD5C5] flex items-center gap-2.5 text-base font-bold text-[#131B19] cursor-pointer transition-colors"
        >
          {voiceMuted ? (
            <VolumeX aria-hidden="true" className="w-6 h-6 text-[#3E4C48]" />
          ) : (
            <Volume2 aria-hidden="true" className="w-6 h-6 text-[#0D5652]" />
          )}
          <span>{voiceMuted ? t.voiceOff : t.voiceOn}</span>
        </button>
      </div>

      {/* Clear Microphone Permission Prompt + Step-by-step Unblock Instructions */}
      {micPermission !== 'granted' && (
        <div
          className={`mx-5 sm:mx-8 mt-6 p-5 rounded-3xl border-2 space-y-4 ${
            micPermission === 'denied' || micPermission === 'unavailable'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-[#F2ECE1]/70 border-[#DFD5C5] text-[#131B19]'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  micPermission === 'denied' || micPermission === 'unavailable'
                    ? 'bg-amber-200/70 text-amber-900'
                    : 'bg-[#0D5652] text-white'
                }`}
              >
                {micPermission === 'denied' || micPermission === 'unavailable' ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1.5 min-w-0">
                <div className="font-display font-bold text-xl">
                  {micPermission === 'denied' ? t.micDeniedTitle : t.micPermissionTitle}
                </div>
                <p className="text-base leading-snug opacity-90">
                  {micPermission === 'denied'
                    ? t.micDeniedMsg
                    : micPermission === 'unavailable'
                    ? t.micUnavailableMsg
                    : t.micPermissionPromptDesc}
                </p>
                {micPermission === 'prompt' && (
                  <p className="text-sm leading-snug text-[#3E4C48]">{t.micWhyDetail}</p>
                )}
              </div>
            </div>

            {micPermission !== 'unavailable' && (
              <button
                type="button"
                disabled={checkingPermission}
                onClick={handleAllowMic}
                className="min-h-[54px] px-6 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] disabled:opacity-60 text-white font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 shrink-0 cursor-pointer transition-colors"
              >
                {checkingPermission ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
                <span>
                  {checkingPermission
                    ? t.checkingMicBtn
                    : micPermission === 'denied'
                    ? t.retryMicBtn
                    : t.allowMicBtn}
                </span>
              </button>
            )}
          </div>

          {micPermission === 'denied' && (
            <div className="rounded-2xl bg-white/80 border border-amber-200 p-4 space-y-1.5 text-sm sm:text-base text-amber-950">
              <div className="font-bold">{t.micBlockedStepsTitle}</div>
              <div>{t.micBlockedStep1}</div>
              <div>{t.micBlockedStep2}</div>
              <div>{t.micBlockedStep3}</div>
            </div>
          )}

          {voiceErrorDetail && (
            <p className="text-xs font-mono opacity-80 break-all">
              {t.voiceErrorReasonLabel} {voiceErrorDetail}
            </p>
          )}
        </div>
      )}

      {/* Voice playback fallback notice + Large Text Reply banner */}
      {(!synthSupported || usedFallbackVoice) && (
        <div className="mx-5 sm:mx-8 mt-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C5] space-y-2">
          <p className="text-sm sm:text-base text-[#3E4C48] font-medium">
            {!synthSupported ? t.speechSynthUnavailableMsg : t.fallbackVoiceLargeTextNote}
          </p>
          {latestAssistantMsg && (
            <div className="rounded-2xl bg-white border border-[#DFD5C5] px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-wide text-[#0D5652] mb-1">
                {t.latestReplyBannerLabel}
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[#131B19] leading-snug">
                {latestAssistantMsg.text}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Central Mic Orb Stage, Live Transcript / WAV Recorder & "Sati heard" */}
      <div className="py-8 px-5 bg-[#FAF7F2]/70 border-b border-[#DFD5C5] flex flex-col items-center gap-6">
        <SatiMicOrb
          isListening={isListening}
          isSpeaking={isSpeaking}
          isThinking={isThinking || isProcessingAudio}
          onClick={toggleListening}
          label={isListening ? t.stopAndSendBtn : isSpeaking ? t.satiSpeaking : t.talkToSatiTitle}
        />

        {isCloudAudioMode && wakeListenerActive && !isListening && !isThinking && !isProcessingAudio && (
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[#0D5652] bg-white px-4 py-1.5 rounded-full border border-[#DFD5C5]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803D] animate-pulse" />
            <span>{t.wakePhraseBadge}</span>
          </div>
        )}

        {/* Active Capture Card: English Live Transcript OR Hindi/Marathi Audio Recorder */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            aria-live="polite"
            role="status"
            className="w-full max-w-2xl rounded-3xl bg-white border-2 border-[#0D5652] shadow-sm p-5 sm:p-6 space-y-4"
          >
            {isCloudAudioMode ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 text-[#0D5652] font-bold text-base sm:text-lg">
                    <span className="w-3 h-3 rounded-full bg-[#B91C1C] animate-ping shrink-0" />
                    <span>{t.recordingWavLabel}</span>
                  </div>
                  <span className="text-sm font-bold text-[#3E4C48] tabular-nums">
                    0:{String(recordingSeconds).padStart(2, '0')} / 0:20
                  </span>
                </div>

                {/* Live Microphone Volume Meter */}
                <div className="w-full h-3 rounded-full bg-[#F2ECE1] overflow-hidden">
                  <div
                    className="h-full bg-[#0D5652] transition-all duration-100 rounded-full"
                    style={{ width: `${Math.max(8, Math.round(audioLevel * 100))}%` }}
                  />
                </div>

                <p className="text-base text-[#3E4C48]">{t.recordingAutoStopHint}</p>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 text-[#0D5652] font-bold text-base sm:text-lg">
                    <span className="w-3 h-3 rounded-full bg-[#15803D] animate-ping shrink-0" />
                    <span>{t.liveTranscriptLabel}</span>
                  </div>
                  <span className="text-sm font-bold text-[#3E4C48] tabular-nums">
                    {getSpeechLocale(state.language)}
                  </span>
                </div>

                <p className="text-xl sm:text-2xl font-semibold text-[#131B19] leading-relaxed min-h-[2.5rem]">
                  {liveTranscript || (
                    <span className="text-[#3E4C48] font-normal italic">{t.speakNowPlaceholder}</span>
                  )}
                </p>
              </>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={cancelVoice}
                className="min-h-[48px] px-5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] text-[#3E4C48] font-bold text-base flex items-center gap-2 cursor-pointer transition-colors"
              >
                <MicOff className="w-5 h-5" />
                <span>{t.cancelVoiceBtn}</span>
              </button>
              <button
                type="button"
                onClick={stopAndSendVoice}
                className="min-h-[48px] px-6 rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white font-bold text-base flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Send className="w-5 h-5" />
                <span>{t.stopAndSendBtn}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Processing WAV upload indicator */}
        {isProcessingAudio && (
          <div
            aria-live="polite"
            className="w-full max-w-2xl rounded-3xl bg-white border-2 border-[#0D5652]/60 p-5 flex items-center justify-center gap-3 text-lg font-bold text-[#0D5652]"
          >
            <Loader2 className="w-6 h-6 animate-spin shrink-0" />
            <span>{t.processingVoiceLabel}</span>
          </div>
        )}

        {/* "Sati heard:" Large Transcript Card + Big "Not what I said? Try again" Button */}
        {lastHeardTranscript && !isListening && !isProcessingAudio && (
          <div
            role="status"
            aria-live="polite"
            className="w-full max-w-2xl rounded-3xl bg-white border-2 border-[#DFD5C5] p-5 sm:p-6 space-y-4"
          >
            <div className="space-y-1.5">
              <div className="text-sm font-bold uppercase tracking-wide text-[#0D5652]">
                {t.satiHeardLabel}
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[#131B19] leading-snug">
                “{lastHeardTranscript}”
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setStatusNote('');
                setVoiceErrorDetail('');
                startListening();
              }}
              className="w-full sm:w-auto min-h-[56px] px-6 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 text-amber-950 font-extrabold text-lg flex items-center justify-center gap-2.5 cursor-pointer transition-colors"
            >
              <RotateCcw aria-hidden="true" className="w-5 h-5 shrink-0" />
              <span>{t.tryAgainVoiceBtn}</span>
            </button>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
          {quickPrompts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSend(q)}
              className="min-h-[50px] px-5 py-2.5 rounded-2xl bg-white hover:bg-[#F2ECE1] border-2 border-[#DFD5C5] text-base font-semibold text-[#0D5652] cursor-pointer transition-colors active:scale-[0.98]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Screen-reader live announcement for Sati's latest reply */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {latestAssistantMsg ? `${t.brandName}: ${latestAssistantMsg.text}` : ''}
      </div>

      {/* Conversation History */}
      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={t.talkToSatiTitle}
        className="p-6 sm:p-8 space-y-5 max-h-[420px] overflow-y-auto"
      >
        {state.chatHistory.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-3xl px-6 py-4 leading-relaxed ${
                msg.role === 'assistant' && usedFallbackVoice ? 'text-2xl font-semibold' : largeTextClass
              } ${
                msg.role === 'user'
                  ? 'bg-[#0D5652] text-white'
                  : 'bg-[#F2ECE1] text-[#131B19] border border-[#DFD5C5]'
              }`}
            >
              <p>{msg.text}</p>
              {msg.role === 'assistant' && synthSupported && (
                <button
                  type="button"
                  onClick={() => {
                    const speechRes = speakWarmly(
                      msg.text,
                      state.language,
                      () => {
                        if (isMountedRef.current) setIsSpeaking(true);
                      },
                      () => {
                        if (isMountedRef.current) setIsSpeaking(false);
                      }
                    );
                    if (isMountedRef.current) {
                      setUsedFallbackVoice(speechRes.usedFallbackVoice);
                    }
                  }}
                  className="mt-3 min-h-[48px] px-4 rounded-xl bg-white/80 hover:bg-white text-base font-bold text-[#0D5652] inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Volume2 aria-hidden="true" className="w-5 h-5" />
                  <span>{t.listenAgain}</span>
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {(isThinking || isProcessingAudio) && (
          <div className="flex justify-start">
            <div className="bg-[#F2ECE1] rounded-3xl px-6 py-4 flex items-center gap-3 text-lg text-[#3E4C48]">
              <Loader2 className="w-6 h-6 animate-spin text-[#0D5652]" />
              <span>{t.satiThinking}</span>
            </div>
          </div>
        )}
        <div ref={scrollEndRef} />
      </div>

      {((micPermission === 'granted' && (statusNote || voiceErrorDetail)) ||
        (micPermission !== 'granted' &&
          Boolean(statusNote) &&
          statusNote !== t.micDeniedMsg &&
          statusNote !== t.micUnavailableMsg)) && (
        <div
          role="alert"
          className="mx-6 mb-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-1.5"
        >
          {statusNote && <div className="text-base font-medium">{statusNote}</div>}
          {micPermission === 'granted' && voiceErrorDetail && (
            <div className="text-xs font-mono opacity-80 break-all">
              {t.voiceErrorReasonLabel} {voiceErrorDetail}
            </div>
          )}
        </div>
      )}

      {/* Always-Available Text Box Fallback */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className={`p-5 sm:p-6 bg-[#FAF7F2] border-t border-[#DFD5C5] space-y-2.5 transition-colors ${
          highlightFallback ? 'ring-2 ring-inset ring-[#0D5652]/40' : ''
        }`}
      >
        <label
          htmlFor="sati-text-fallback"
          className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#3E4C48]"
        >
          <Keyboard className="w-4 h-4 text-[#0D5652]" />
          <span>{t.textFallbackLabel}</span>
        </label>
        <div className="flex gap-3">
          <input
            id="sati-text-fallback"
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.askAnythingPlaceholder}
            className="flex-1 min-h-[60px] px-5 rounded-2xl border-2 border-[#DFD5C5] focus:border-[#0D5652] bg-white text-xl"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking || isProcessingAudio}
            className="min-h-[60px] px-7 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] disabled:opacity-50 text-white font-bold text-lg flex items-center gap-2.5 cursor-pointer transition-colors"
          >
            <Send className="w-6 h-6" />
            <span className="hidden sm:inline">{t.sendBtn}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
