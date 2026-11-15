import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, MicOff, ShieldAlert, Stethoscope, Trash2, X } from 'lucide-react';
import { getLocalDateStr } from '../data/seedData';
import { getT, LANGUAGES } from '../i18n/translations';
import {
  categorizeSymptomNote,
  GeminiRequestError,
  transcribeDoctorAudio,
} from '../services/geminiService';
import { DoctorNote, LanguageCode, SymptomCategory } from '../types';
import { AudioCaptureController, isAudioRecorderSupported } from '../utils/audioRecorder';
import {
  BrowserSpeechRecognition,
  getSpeechLocale,
  getSpeechRecognitionCtor,
  MicPermissionState,
  queryMicPermission,
  requestMicPermissionDetailed,
  usesCloudAudioVoicePath,
} from '../utils/speech';

export function getSymptomCategoryLabel(category: SymptomCategory, language: LanguageCode): string {
  const t = getT(language);
  const map: Record<SymptomCategory, string> = {
    pain: t.symptomCatPain,
    dizziness: t.symptomCatDizziness,
    fatigue: t.symptomCatFatigue,
    digestion: t.symptomCatDigestion,
    breathing: t.symptomCatBreathing,
    sleep: t.symptomCatSleep,
    other: t.symptomCatOther,
  };
  return map[category] || t.symptomCatOther;
}

interface TellDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onSaveNote: (note: Omit<DoctorNote, 'id' | 'createdAt'>) => void;
  onSavedSuccess: (categoryLabel: string) => void;
}

export function TellDoctorModal({
  isOpen,
  onClose,
  language,
  onSaveNote,
  onSavedSuccess,
}: TellDoctorModalProps) {
  const t = getT(language);
  const isCloudAudioMode = usesCloudAudioVoicePath(language);

  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcribingAudio, setTranscribingAudio] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [voiceErrorDetail, setVoiceErrorDetail] = useState('');
  const [micPermission, setMicPermission] = useState<MicPermissionState>('prompt');
  const [checkingPermission, setCheckingPermission] = useState(false);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const recorderRef = useRef<AudioCaptureController | null>(null);
  const detectedCategoryRef = useRef<SymptomCategory | null>(null);
  const baseTextRef = useRef('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const cancelledRef = useRef(false);

  const stopRecSafely = (abort = false) => {
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      try {
        if (abort && rec.abort) {
          rec.abort();
        } else {
          rec.stop();
        }
      } catch {
        // Ignore stop/abort exceptions
      }
    }
    const controller = recorderRef.current;
    if (abort && controller) {
      recorderRef.current = null;
      try {
        controller.cancel();
      } catch {
        // Ignore cancel errors
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      queryMicPermission(language).then((perm) => setMicPermission(perm));
    } else {
      cancelledRef.current = true;
      stopRecSafely(true);
      setIsListening(false);
      setTranscribingAudio(false);
      setText('');
      baseTextRef.current = '';
      detectedCategoryRef.current = null;
      setStatusNote('');
      setVoiceErrorDetail('');
      setSaving(false);
    }
  }, [isOpen, language]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      stopRecSafely(true);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const finishCloudRecording = async (controller: AudioCaptureController) => {
    recorderRef.current = null;
    setIsListening(false);
    setTranscribingAudio(true);
    try {
      const wav = await controller.stop();
      if (cancelledRef.current) return;
      if (!wav) {
        setStatusNote(t.micNoSpeechMsg);
        setVoiceErrorDetail((prev) => prev || 'no-speech');
        return;
      }
      const res = await transcribeDoctorAudio(wav.base64Wav, wav.mimeType, language);
      if (cancelledRef.current) return;
      if (res.noSpeechDetected || !res.transcript) {
        setStatusNote(t.micNoSpeechMsg);
        setVoiceErrorDetail('no-speech');
        return;
      }
      detectedCategoryRef.current = res.category;
      const prefix = baseTextRef.current;
      setText(`${prefix}${res.transcript}`.trim());
      setStatusNote('');
      setVoiceErrorDetail('');
    } catch (err) {
      const detail =
        err instanceof GeminiRequestError
          ? err.detail || err.message
          : err instanceof Error
          ? `gemini-error: ${err.message}`
          : 'gemini-error: transcribe-failed';
      setStatusNote(t.geminiErrorChat);
      setVoiceErrorDetail(detail);
      setTimeout(() => textareaRef.current?.focus(), 60);
    } finally {
      setTranscribingAudio(false);
    }
  };

  const startVoice = async () => {
    setStatusNote('');
    setVoiceErrorDetail('');
    cancelledRef.current = false;
    baseTextRef.current = text.trim() ? `${text.trim()} ` : '';

    if (isCloudAudioMode) {
      if (!isAudioRecorderSupported()) {
        setMicPermission('unavailable');
        setStatusNote(t.micUnavailableMsg);
        setVoiceErrorDetail('mediarecorder-unsupported');
        setTimeout(() => textareaRef.current?.focus(), 60);
        return;
      }
      const controller = new AudioCaptureController();
      recorderRef.current = controller;
      try {
        await controller.start(
          {
            onAutoStop: () => {
              if (!cancelledRef.current && recorderRef.current === controller) {
                finishCloudRecording(controller);
              }
            },
            onError: (reasonCode) => {
              recorderRef.current = null;
              setIsListening(false);
              setTranscribingAudio(false);
              setStatusNote(t.micAudioErrorMsg);
              setVoiceErrorDetail(reasonCode);
              setTimeout(() => textareaRef.current?.focus(), 60);
            },
          },
          { silenceDurationMs: 1500, maxDurationMs: 20000, noSpeechTimeoutMs: 8000 }
        );
        setMicPermission('granted');
        setIsListening(true);
      } catch (err) {
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
        setTimeout(() => textareaRef.current?.focus(), 60);
      }
      return;
    }

    const RecognitionCtor = getSpeechRecognitionCtor();
    if (!RecognitionCtor) {
      setMicPermission('unavailable');
      setStatusNote(t.micUnavailableMsg);
      setVoiceErrorDetail('SpeechRecognition-unsupported');
      setTimeout(() => textareaRef.current?.focus(), 60);
      return;
    }

    try {
      const rec = new RecognitionCtor();
      rec.lang = getSpeechLocale(language);
      rec.interimResults = true;
      rec.continuous = true;

      rec.onstart = () => {
        setMicPermission('granted');
        setIsListening(true);
      };

      rec.onresult = (event) => {
        let finalChunk = '';
        let interimChunk = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const seg = result?.[0]?.transcript || '';
          if (result?.isFinal) {
            finalChunk += `${seg} `;
          } else {
            interimChunk += seg;
          }
        }
        const combined = `${finalChunk}${interimChunk}`.trim();
        if (combined) {
          setText(`${baseTextRef.current}${combined}`);
        }
      };

      rec.onerror = (ev) => {
        const errCode = ev?.error || 'unknown-speech-error';
        const errMessage = ev?.message ? `: ${ev.message}` : '';
        recognitionRef.current = null;
        setIsListening(false);

        if (errCode === 'aborted' && cancelledRef.current) return;

        setVoiceErrorDetail(`${errCode}${errMessage}`);
        if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
          setMicPermission('denied');
          setStatusNote(t.micDeniedMsg);
          setTimeout(() => textareaRef.current?.focus(), 60);
        } else if (errCode === 'audio-capture') {
          setStatusNote(t.micAudioErrorMsg);
          setTimeout(() => textareaRef.current?.focus(), 60);
        } else if (errCode === 'network') {
          setStatusNote(t.micNetworkErrorMsg);
          setTimeout(() => textareaRef.current?.focus(), 60);
        } else if (errCode === 'language-not-supported') {
          setStatusNote(t.micUnavailableMsg);
          setTimeout(() => textareaRef.current?.focus(), 60);
        } else {
          setStatusNote(t.micNoSpeechMsg);
        }
      };

      rec.onend = () => {
        recognitionRef.current = null;
        setIsListening(false);
      };

      recognitionRef.current = rec;
      setIsListening(true);
      rec.start();
    } catch (err) {
      recognitionRef.current = null;
      setIsListening(false);
      setStatusNote(t.micAudioErrorMsg);
      setVoiceErrorDetail(err instanceof Error ? err.message : 'speech-recognition-start-failed');
      setTimeout(() => textareaRef.current?.focus(), 60);
    }
  };

  const toggleVoice = () => {
    if (transcribingAudio) return;
    if (isListening) {
      cancelledRef.current = false;
      if (isCloudAudioMode && recorderRef.current) {
        finishCloudRecording(recorderRef.current);
      } else {
        stopRecSafely(false);
        setIsListening(false);
      }
      return;
    }
    startVoice();
  };

  const handleAllowMic = async () => {
    setCheckingPermission(true);
    setStatusNote('');
    setVoiceErrorDetail('');
    const res = await requestMicPermissionDetailed(language);
    setCheckingPermission(false);
    setMicPermission(res.state);
    if (res.errorDetail) {
      setVoiceErrorDetail(res.errorDetail);
    }
    if (res.state === 'granted') {
      startVoice();
    } else if (res.state === 'denied') {
      setStatusNote(t.micDeniedMsg);
      setTimeout(() => textareaRef.current?.focus(), 60);
    } else {
      setStatusNote(t.micUnavailableMsg);
      setTimeout(() => textareaRef.current?.focus(), 60);
    }
  };

  const handleSave = async () => {
    const clean = text.trim();
    if (!clean || saving) return;

    if (isListening) {
      cancelledRef.current = true;
      stopRecSafely(true);
      setIsListening(false);
    }

    setSaving(true);
    try {
      const category = detectedCategoryRef.current || (await categorizeSymptomNote(clean));
      const now = new Date();
      const date = getLocalDateStr(0);
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      onSaveNote({
        date,
        time,
        category,
        text: clean,
      });
      const label = getSymptomCategoryLabel(category, language);
      onSavedSuccess(label);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tell-doctor-title"
        className="sati-card bg-white rounded-3xl border border-[#DFD5C5] shadow-xl w-full max-w-xl p-6 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F2ECE1] text-[#0D5652] flex items-center justify-center shrink-0">
              <Stethoscope className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="tell-doctor-title"
                className="font-display text-2xl sm:text-3xl font-extrabold text-[#131B19]"
              >
                {t.tellDoctorModalTitle}
              </h2>
              <p className="sati-muted text-base text-[#3E4C48] mt-0.5">
                {t.tellDoctorListeningHint}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className="w-12 h-12 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] flex items-center justify-center text-[#131B19] shrink-0 cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {micPermission !== 'granted' && (
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C5] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 text-sm sm:text-base text-[#3E4C48] font-medium min-w-0">
                <ShieldAlert className="w-5 h-5 text-[#A85208] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div>
                    {micPermission === 'denied'
                      ? t.micDeniedTitle
                      : micPermission === 'unavailable'
                      ? t.micUnavailableMsg
                      : t.micPermissionTitle}
                  </div>
                  {micPermission === 'prompt' && (
                    <div className="text-xs sm:text-sm text-[#3E4C48]">{t.micWhyDetail}</div>
                  )}
                </div>
              </div>
              {micPermission !== 'unavailable' && (
                <button
                  type="button"
                  disabled={checkingPermission}
                  onClick={handleAllowMic}
                  className="min-h-[48px] px-4 rounded-xl bg-[#0D5652] hover:bg-[#09413E] text-white text-sm sm:text-base font-bold cursor-pointer transition-colors"
                >
                  {checkingPermission ? t.checkingMicBtn : micPermission === 'denied' ? t.retryMicBtn : t.allowMicBtn}
                </button>
              )}
            </div>
            {micPermission === 'denied' && (
              <div className="rounded-xl bg-white border border-amber-200 p-3 text-xs sm:text-sm text-amber-950 space-y-1">
                <div className="font-bold">{t.micBlockedStepsTitle}</div>
                <div>{t.micBlockedStep1}</div>
                <div>{t.micBlockedStep2}</div>
                <div>{t.micBlockedStep3}</div>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={toggleVoice}
          disabled={transcribingAudio}
          className={`w-full min-h-[68px] px-6 rounded-2xl font-display text-xl sm:text-2xl font-bold flex items-center justify-center gap-3 cursor-pointer transition-all disabled:opacity-60 ${
            isListening
              ? 'bg-[#B91C1C] hover:bg-[#991B1B] text-white shadow-md'
              : 'bg-[#0D5652] hover:bg-[#09413E] text-white shadow-sm'
          }`}
        >
          {transcribingAudio ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-7 h-7" />
          ) : (
            <Mic className="w-7 h-7" />
          )}
          <span>
            {transcribingAudio
              ? t.processingVoiceLabel
              : isListening
              ? t.tellDoctorStopListening
              : t.tellDoctorTapToSpeak}
          </span>
        </button>

        {isListening && (
          <div
            aria-live="polite"
            className="flex items-center justify-center gap-2.5 text-lg font-bold text-[#0D5652]"
          >
            <span className="w-3 h-3 rounded-full bg-[#15803D] animate-ping" />
            <span>{isCloudAudioMode ? t.recordingWavLabel : t.liveTranscriptLabel}</span>
          </div>
        )}

        <label htmlFor="tell-doctor-textarea" className="sr-only">
          {t.tellDoctorPlaceholder}
        </label>
        <textarea
          id="tell-doctor-textarea"
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            detectedCategoryRef.current = null;
            setText(e.target.value);
          }}
          placeholder={t.tellDoctorPlaceholder}
          rows={4}
          className="w-full p-5 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] text-xl leading-relaxed text-[#131B19] focus:border-[#0D5652]"
        />

        {(statusNote || voiceErrorDetail) && (
          <div
            role="alert"
            aria-live="assertive"
            className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1"
          >
            {statusNote && <div className="text-base font-medium">{statusNote}</div>}
            {voiceErrorDetail && (
              <div className="text-xs font-mono text-amber-950 break-all">
                {t.voiceErrorReasonLabel} {voiceErrorDetail}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[56px] px-6 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border-2 border-[#DFD5C5] text-lg font-bold text-[#131B19] cursor-pointer transition-colors"
          >
            {t.cancelBtn}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!text.trim() || saving || transcribingAudio}
            className="min-h-[56px] px-7 rounded-2xl bg-[#15803D] hover:bg-[#166534] disabled:opacity-50 text-white text-lg font-extrabold flex items-center gap-2.5 cursor-pointer transition-colors"
          >
            {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{saving ? t.tellDoctorSaving : t.tellDoctorSaveBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface DoctorNotesCardProps {
  notes: DoctorNote[];
  language: LanguageCode;
  canDelete?: boolean;
  onDeleteNote?: (noteId: string) => void;
}

export function DoctorNotesCard({
  notes,
  language,
  canDelete = false,
  onDeleteNote,
}: DoctorNotesCardProps) {
  const t = getT(language);
  const speechLocale = LANGUAGES.find((l) => l.code === language)?.speechLocale || 'en-IN';

  return (
    <section className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F2ECE1] text-[#0D5652] flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h2 className="font-display text-2xl font-bold text-[#131B19]">
            {t.doctorNotesSectionTitle}
          </h2>
        </div>
        <span className="sati-muted text-sm font-bold tabular-nums text-[#3E4C48]">
          {notes.length}
        </span>
      </div>

      {notes.length === 0 ? (
        <p className="sati-muted text-base text-[#3E4C48]">{t.noDoctorNotesYet}</p>
      ) : (
        <div className="divide-y divide-[#DFD5C5]">
          {notes.map((note) => {
            const parsedDate = new Date(note.date + 'T00:00:00');
            const dateLabel = Number.isNaN(parsedDate.getTime())
              ? note.date
              : parsedDate.toLocaleDateString(speechLocale, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
            return (
              <div key={note.id} className="py-4 first:pt-1 last:pb-1 flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-bold text-[#0D5652]">
                      {getSymptomCategoryLabel(note.category, language)}
                    </span>
                    <span className="sati-muted text-[#3E4C48] tabular-nums">
                      {dateLabel} · {note.time}
                    </span>
                  </div>
                  <p className="text-base text-[#131B19] leading-relaxed">{note.text}</p>
                </div>

                {canDelete && onDeleteNote && (
                  <button
                    type="button"
                    onClick={() => onDeleteNote(note.id)}
                    aria-label={`${t.deleteBtn}: ${getSymptomCategoryLabel(note.category, language)}`}
                    className="w-12 h-12 rounded-xl hover:bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-5 h-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
