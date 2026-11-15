import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Copy,
  Eye,
  Heart,
  HeartPulse,
  Lock,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import { getLocalDateStr } from '../data/seedData';
import { formatTemplate, getGreeting, getT, LANGUAGES } from '../i18n/translations';
import { fetchDailyHealthTip } from '../services/geminiService';
import { ConfirmDoseResult } from '../store/useCareStore';
import {
  AccessibilitySettings,
  CareCircleState,
  DoctorNote,
  ElderlyProfile,
  FamilyContact,
  MoodValue,
  PrivacySettings,
} from '../types';
import { getPlainMedicineTags } from '../utils/plainLanguage';
import { speakWarmly } from '../utils/speech';
import { AppointmentsSection } from './AppointmentsSection';
import { TellDoctorModal } from './DoctorNotesSection';
import { PillGraphic } from './PillGraphic';
import { TalkToSatiPanel } from './TalkToSatiPanel';

export type ElderlyTab = 'today' | 'progress' | 'appointments' | 'talk' | 'settings';

interface ElderlyViewProps {
  state: CareCircleState;
  activeTab: ElderlyTab;
  onChangeTab: (tab: ElderlyTab) => void;
  onOpenMedicalId: () => void;
  onConfirmDose: (doseId: string) => ConfirmDoseResult;
  onUndoDose: (doseId: string) => { ok: boolean; medName?: string };
  onOpenPhotoVerify: (doseId: string) => void;
  onOpenCalendar: () => void;
  onOpenAddAppt: () => void;
  onAddDoctorNote: (note: Omit<DoctorNote, 'id' | 'createdAt'>) => void;
  onRecordMood: (mood: MoodValue) => void;
  onUpdatePrivacy: (patch: Partial<PrivacySettings>) => void;
  onUpdateAccessibility: (patch: Partial<AccessibilitySettings>) => void;
  onUpdateElderlyProfile: (patch: Partial<ElderlyProfile>) => void;
  onAppendChatMessage: (msg: {
    role: 'user' | 'assistant';
    text: string;
    triageLevel?: 'NONE' | 'MILD' | 'CONCERNING' | 'EMERGENCY';
  }) => void;
  onTriggerEmergency: (reason: string) => void;
  onAlertCaretaker: (reason: string) => void;
  onSendFamilyMessage: (params: {
    targetHint: string;
    originalMessage: string;
    summary: string;
  }) => { recipientNames: string[] };
  onTestReminder: () => void;
  onTestInactivity: () => void;
  externalDoubleDoseSignal?: { id: number; message: string } | null;
  externalConfirmedSignal?: { id: number; doseId: string; medName: string; message: string } | null;
}

const MOODS: Array<{ value: MoodValue; emoji: string; key: keyof ReturnType<typeof getT> }> = [
  { value: 'happy', emoji: '😊', key: 'moodHappy' },
  { value: 'calm', emoji: '😌', key: 'moodCalm' },
  { value: 'tired', emoji: '😴', key: 'moodTired' },
  { value: 'sad', emoji: '😔', key: 'moodSad' },
  { value: 'unwell', emoji: '🤒', key: 'moodUnwell' },
];

function TactileSwitch({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 flex items-center shrink-0 ${
        checked ? 'bg-[#0D5652] justify-end' : 'bg-[#CFC5B4] justify-start'
      }`}
    >
      <span className="w-6 h-6 rounded-full bg-white shadow-sm" />
    </span>
  );
}

export function ElderlyView({
  state,
  activeTab,
  onChangeTab,
  onOpenMedicalId,
  onConfirmDose,
  onUndoDose,
  onOpenPhotoVerify,
  onOpenCalendar,
  onOpenAddAppt,
  onAddDoctorNote,
  onRecordMood,
  onUpdatePrivacy,
  onUpdateAccessibility,
  onUpdateElderlyProfile,
  onAppendChatMessage,
  onTriggerEmergency,
  onAlertCaretaker,
  onSendFamilyMessage,
  onTestReminder,
  onTestInactivity,
  externalDoubleDoseSignal,
  externalConfirmedSignal,
}: ElderlyViewProps) {
  const t = getT(state.language);
  const speechLocale = LANGUAGES.find((l) => l.code === state.language)?.speechLocale || 'en-IN';
  const todayStr = getLocalDateStr(0);
  const { textScale, dementiaFriendlyMode, highContrast, voiceRemindersEnabled } = state.accessibility;

  const bodySizeClass =
    textScale === 'xlarge' ? 'text-[26px]' : textScale === 'large' ? 'text-[23px]' : 'text-[20px]';
  const headingSizeClass =
    textScale === 'xlarge' ? 'text-4xl sm:text-5xl' : textScale === 'large' ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl';

  const getDefaultTip = (lang: string) => {
    const fallbackTips: Record<string, string> = {
      hi: 'सुबह की दवाइयों के साथ एक गिलास गुनगुना पानी पिएं और कुछ मिनट हल्की धूप का आनंद लें।',
      mr: 'सकाळच्या औषधांसोबत एक ग्लास कोमट पाणी प्या आणि काही मिनिटे कोवळ्या उन्हात बसा.',
    };
    return (
      fallbackTips[lang] ||
      'Drink a glass of warm water with your morning medicines and enjoy a few minutes of gentle sunlight.'
    );
  };

  const [doubleDoseMsg, setDoubleDoseMsg] = useState<string | null>(null);
  const [doseConfirmBanner, setDoseConfirmBanner] = useState<{
    doseId: string;
    medName: string;
    message: string;
  } | null>(null);
  const [infoBanner, setInfoBanner] = useState<string | null>(null);
  const [tellDoctorOpen, setTellDoctorOpen] = useState(false);
  const [dailyTip, setDailyTip] = useState<string>(() => getDefaultTip(state.language));
  const [loadingTip] = useState(false);
  const [copiedPasscode, setCopiedPasscode] = useState(false);
  const customVoiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // Medical ID Editor state in Elderly Settings
  const [medIdName, setMedIdName] = useState(state.elderly.name);
  const [medIdAge, setMedIdAge] = useState(String(state.elderly.age));
  const [medIdBloodGroup, setMedIdBloodGroup] = useState(state.elderly.bloodGroup || '');
  const [medIdEmergencyPhone, setMedIdEmergencyPhone] = useState(state.elderly.emergencyPhone || '108');
  const [medIdDoctorName, setMedIdDoctorName] = useState(state.elderly.doctorName || '');
  const [medIdDoctorPhone, setMedIdDoctorPhone] = useState(state.elderly.doctorPhone || '');
  const [medIdConditions, setMedIdConditions] = useState(state.elderly.conditions.join(', '));
  const [medIdAllergies, setMedIdAllergies] = useState(state.elderly.allergies.join(', '));
  const [medIdContacts, setMedIdContacts] = useState<FamilyContact[]>(state.elderly.familyContacts || []);
  const [medIdSavedToast, setMedIdSavedToast] = useState(false);

  useEffect(() => {
    setMedIdName(state.elderly.name);
    setMedIdAge(String(state.elderly.age));
    setMedIdBloodGroup(state.elderly.bloodGroup || '');
    setMedIdEmergencyPhone(state.elderly.emergencyPhone || '108');
    setMedIdDoctorName(state.elderly.doctorName || '');
    setMedIdDoctorPhone(state.elderly.doctorPhone || '');
    setMedIdConditions(state.elderly.conditions.join(', '));
    setMedIdAllergies(state.elderly.allergies.join(', '));
    setMedIdContacts(state.elderly.familyContacts || []);
  }, [state.elderly]);

  useEffect(() => {
    return () => {
      if (customVoiceAudioRef.current) {
        customVoiceAudioRef.current.pause();
        customVoiceAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (externalDoubleDoseSignal) {
      setDoubleDoseMsg(externalDoubleDoseSignal.message);
      setDoseConfirmBanner(null);
      setInfoBanner(null);
    }
  }, [externalDoubleDoseSignal]);

  useEffect(() => {
    if (externalConfirmedSignal) {
      setDoseConfirmBanner({
        doseId: externalConfirmedSignal.doseId,
        medName: externalConfirmedSignal.medName,
        message: externalConfirmedSignal.message,
      });
      setDoubleDoseMsg(null);
      setInfoBanner(null);
    }
  }, [externalConfirmedSignal]);

  useEffect(() => {
    let active = true;
    const defaultTip = getDefaultTip(state.language);
    const cacheKey = `sati_daily_tip_${todayStr}_${state.language}_${state.elderly.name}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setDailyTip(cached);
        return () => {
          active = false;
        };
      }
    } catch {
      // Ignore sessionStorage errors
    }

    setDailyTip(defaultTip);
    const loadTip = async () => {
      try {
        const res = await fetchDailyHealthTip(state);
        if (active && res.tip) {
          setDailyTip(res.tip);
          try {
            sessionStorage.setItem(cacheKey, res.tip);
          } catch {
            // Ignore sessionStorage errors
          }
        }
      } catch {
        // Keep instant localized tip silently
      }
    };
    loadTip();
    return () => {
      active = false;
    };
  }, [state.language, state.elderly.name, todayStr]);

  const todaysLogs = useMemo(() => {
    const activeMedIds = new Set(state.medications.map((m) => m.id));
    return state.doseLogs
      .filter((d) => d.date === todayStr && activeMedIds.has(d.medicationId))
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [state.doseLogs, state.medications, todayStr]);

  const nextPendingLog = todaysLogs.find((d) => d.status === 'pending');
  const nextMed = nextPendingLog
    ? state.medications.find((m) => m.id === nextPendingLog.medicationId)
    : undefined;

  const todayMood = state.moodLogs.find((m) => m.date === todayStr)?.mood;

  const weeklyStats = useMemo(() => {
    const activeMedIds = new Set(state.medications.map((m) => m.id));
    const days: Array<{ dateStr: string; label: string; taken: number; total: number }> = [];
    let totalTaken = 0;
    let totalScheduled = 0;
    for (let offset = -6; offset <= 0; offset++) {
      const dateStr = getLocalDateStr(offset);
      const logs = state.doseLogs.filter(
        (d) => d.date === dateStr && d.status !== 'pending' && activeMedIds.has(d.medicationId)
      );
      const taken = logs.filter((d) => d.status === 'verified_taken' || d.status === 'said_taken').length;
      totalTaken += taken;
      totalScheduled += logs.length;
      const label = new Date(dateStr + 'T00:00:00').toLocaleDateString(speechLocale, { weekday: 'short' });
      days.push({ dateStr, label, taken, total: logs.length });
    }
    const streakDays = days.filter((d) => d.total > 0 && d.taken === d.total).length;
    return { days, totalTaken, totalScheduled, streakDays };
  }, [state.doseLogs, state.medications, speechLocale]);

  const takenTodayLogs = useMemo(
    () => todaysLogs.filter((d) => d.status === 'said_taken' || d.status === 'verified_taken'),
    [todaysLogs]
  );

  const handleConfirmNext = () => {
    if (!nextPendingLog || !nextMed) return;
    const res = onConfirmDose(nextPendingLog.id);
    if (!res.ok && res.blockedReason === 'double_dose') {
      const msg = formatTemplate(t.doubleDoseBlockedMsg, {
        med: nextMed.name,
        lastTime: res.lastTakenTime || '',
        nextTime: res.nextDueTime || '',
      });
      setDoubleDoseMsg(msg);
      if (voiceRemindersEnabled) {
        speakWarmly(msg, state.language);
      }
      return;
    }
    const thankMsg = formatTemplate(t.doseConfirmedSpoken, {
      name: state.elderly.honorificName,
      med: nextMed.name,
    });
    setDoseConfirmBanner({
      doseId: nextPendingLog.id,
      medName: nextMed.name,
      message: thankMsg,
    });
    setInfoBanner(null);
    setDoubleDoseMsg(null);
    if (voiceRemindersEnabled) {
      speakWarmly(thankMsg, state.language);
    }
  };

  const handleUndoDose = (doseId: string, medName?: string) => {
    const res = onUndoDose(doseId);
    if (!res.ok) return;
    const finalMedName = medName || res.medName || '';
    const undoneMsg = formatTemplate(t.doseUndoneBanner, { med: finalMedName });
    setDoseConfirmBanner(null);
    setDoubleDoseMsg(null);
    setInfoBanner(undoneMsg);
    if (voiceRemindersEnabled) {
      speakWarmly(undoneMsg, state.language);
    }
  };

  const handlePlayCustomVoice = () => {
    if (!state.accessibility.customVoiceMessageDataUrl) return;
    if (customVoiceAudioRef.current) {
      customVoiceAudioRef.current.pause();
    }
    const audio = new Audio(state.accessibility.customVoiceMessageDataUrl);
    customVoiceAudioRef.current = audio;
    audio.play().catch(() => {});
  };

  const handleCopyPasscode = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(state.passcode).catch(() => {});
    }
    setCopiedPasscode(true);
    setTimeout(() => setCopiedPasscode(false), 2500);
  };

  const handleSaveMedicalId = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateElderlyProfile({
      name: medIdName.trim() || state.elderly.name,
      age: Number(medIdAge) || state.elderly.age,
      bloodGroup: medIdBloodGroup.trim(),
      emergencyPhone: medIdEmergencyPhone.trim() || '108',
      doctorName: medIdDoctorName.trim(),
      doctorPhone: medIdDoctorPhone.trim(),
      conditions: medIdConditions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      allergies: medIdAllergies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      familyContacts: medIdContacts.filter((c) => c.name.trim() || c.phone.trim()),
    });
    setMedIdSavedToast(true);
    setTimeout(() => setMedIdSavedToast(false), 3000);
  };

  const nextMedTags = nextMed ? getPlainMedicineTags(nextMed, state.language) : null;

  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`space-y-6 ${bodySizeClass}`}
    >
      {/* Persistent Top-Corner Emergency Medical ID Button on EVERY Elderly Screen */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm sm:text-base font-bold text-[#3E4C48] tabular-nums">
          {state.elderly.bloodGroup ? `${t.bloodGroupLabel}: ${state.elderly.bloodGroup}` : ''}
        </div>
        <button
          type="button"
          onClick={onOpenMedicalId}
          className="ml-auto min-h-[54px] px-5 sm:px-6 rounded-2xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-display text-lg sm:text-xl font-extrabold shadow-md flex items-center gap-2.5 cursor-pointer transition-colors active:scale-[0.98]"
        >
          <HeartPulse className="w-6 h-6 shrink-0" />
          <span>{t.medicalIdBtn}</span>
        </button>
      </div>

      {/* TODAY TAB */}
      {activeTab === 'today' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Primary Calm Focus Column */}
          <div className="lg:col-span-7 space-y-7">
            <div className="space-y-2 pt-1">
              <h1 className={`font-display font-extrabold text-[#131B19] leading-tight ${headingSizeClass}`}>
                {getGreeting(state.language, state.elderly.honorificName)}
              </h1>
              <p className="sati-muted text-[#3E4C48] font-medium">
                {new Date().toLocaleDateString(speechLocale, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Persistent Confirmation Banner (stays on screen until dismissed) */}
            {doseConfirmBanner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                role="status"
                aria-live="polite"
                className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-700 text-emerald-950 space-y-4 shadow-sm"
              >
                <div className="flex items-start gap-4 font-bold">
                  <CheckCircle2 className="w-9 h-9 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="leading-snug">{doseConfirmBanner.message}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleUndoDose(doseConfirmBanner.doseId, doseConfirmBanner.medName)}
                    className="min-h-[54px] px-5 py-3 rounded-2xl bg-white hover:bg-amber-50 border-2 border-amber-700 text-amber-950 font-bold text-base sm:text-lg flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-5 h-5 shrink-0" />
                    <span>{t.undoDoseBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoseConfirmBanner(null)}
                    className="min-h-[54px] px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5 shrink-0" />
                    <span>{t.dismissBtn}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {infoBanner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                role="status"
                aria-live="polite"
                className="p-5 sm:p-6 rounded-3xl bg-[#FAF7F2] border-2 border-[#0D5652] text-[#131B19] flex flex-wrap items-center justify-between gap-4 font-bold"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <CheckCircle2 aria-hidden="true" className="w-8 h-8 text-[#0D5652] shrink-0" />
                  <span>{infoBanner}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoBanner(null)}
                  className="min-h-[48px] px-4 rounded-2xl bg-white hover:bg-[#F2ECE1] border border-[#DFD5C5] text-base font-bold cursor-pointer"
                >
                  {t.dismissBtn}
                </button>
              </motion.div>
            )}

            {doubleDoseMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                role="alert"
                aria-live="assertive"
                className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-600 text-amber-950 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-display font-bold text-2xl">{t.doubleDoseWarningTitle}</div>
                  <button
                    type="button"
                    onClick={() => setDoubleDoseMsg(null)}
                    className="min-h-[48px] px-4 rounded-xl bg-white/80 text-sm font-bold cursor-pointer"
                  >
                    {t.dismissBtn}
                  </button>
                </div>
                <p className="leading-relaxed">{doubleDoseMsg}</p>
              </motion.div>
            )}

            {/* Single Dominant Focal Action Card */}
            {nextPendingLog && nextMed && nextMedTags ? (
              <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] shadow-sm p-7 sm:p-9 space-y-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-[#0D5652]">{t.nextMedicineLabel}</span>
                  <span className="font-display font-extrabold text-2xl sm:text-3xl tabular-nums text-[#A85208]">
                    {nextPendingLog.scheduledTime}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
                  <PillGraphic
                    color={nextMed.pillColor}
                    shape={nextMed.pillShape}
                    size={104}
                    language={state.language}
                    medName={nextMed.name}
                  />
                  <div className="space-y-2.5 min-w-0">
                    <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#131B19] leading-tight">
                      {nextMed.name}
                    </h2>
                    <div className="font-extrabold text-2xl text-[#0D5652]">{nextMed.dose}</div>
                    {/* Plain-Language Tags + Visual Pill Look */}
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-[#0D5652] text-base font-bold">
                        {nextMedTags.purposeTag}
                      </span>
                      <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-[#A85208] text-base font-bold">
                        {nextMedTags.timingTag}
                      </span>
                      <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#DFD5C5] text-[#3E4C48] text-sm sm:text-base font-semibold">
                        {nextMedTags.pillLookTag}
                      </span>
                    </div>
                  </div>
                </div>

                {dementiaFriendlyMode && state.accessibility.customVoiceMessageDataUrl && (
                  <button
                    type="button"
                    onClick={handlePlayCustomVoice}
                    className="w-full min-h-[60px] px-6 rounded-2xl bg-[#F2ECE1] hover:bg-[#E7DFD1] text-[#0D5652] font-bold flex items-center justify-center gap-3 cursor-pointer transition-colors"
                  >
                    <Play className="w-6 h-6" />
                    <span>
                      {t.playVoiceReminder}{' '}
                      {state.accessibility.customVoiceSenderName
                        ? `(${state.accessibility.customVoiceSenderName})`
                        : ''}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleConfirmNext}
                  className="w-full min-h-[76px] px-6 py-5 rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white font-display text-2xl sm:text-3xl font-extrabold shadow-md active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-3.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-8 h-8 shrink-0" />
                  <span>{t.iHaveTakenIt}</span>
                </button>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  {!dementiaFriendlyMode && (
                    <button
                      type="button"
                      onClick={() => onOpenPhotoVerify(nextPendingLog.id)}
                      className="min-h-[52px] px-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#0D5652] font-bold flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <Camera className="w-6 h-6" />
                      <span>{t.verifyWithPhoto}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      speakWarmly(
                        `${nextMed.name}, ${nextMed.dose}. ${nextMedTags.purposeTag}, ${nextMedTags.timingTag}.`,
                        state.language
                      )
                    }
                    className="min-h-[52px] px-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#3E4C48] hover:text-[#131B19] font-bold flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <Volume2 className="w-6 h-6" />
                    <span>{t.readAloud}</span>
                  </button>
                </div>
              </div>
            ) : state.medications.length === 0 ? (
              <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] shadow-sm p-9 text-center space-y-5">
                <div className="w-20 h-20 rounded-full bg-[#F2ECE1] text-[#0D5652] mx-auto flex items-center justify-center">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#131B19]">
                  {t.noMedicinesYetTitle}
                </h2>
                <p className="sati-muted text-[#3E4C48] max-w-md mx-auto leading-relaxed">
                  {t.noMedicinesYetDesc}
                </p>
              </div>
            ) : (
              <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] shadow-sm p-9 text-center space-y-5">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-11 h-11" />
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#131B19]">
                  {t.allDoneToday}
                </h2>
                <p className="sati-muted text-[#3E4C48] max-w-md mx-auto leading-relaxed">
                  {t.allDoneSubtitle}
                </p>
              </div>
            )}

            {/* Tell the Doctor Voice Symptom Button */}
            <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <h2 className="font-display text-2xl font-bold text-[#131B19]">
                  {t.tellDoctorBtn}
                </h2>
                <p className="sati-muted text-base sm:text-lg text-[#3E4C48] leading-snug">
                  {t.tellDoctorDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTellDoctorOpen(true)}
                className="min-h-[64px] px-7 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white font-display text-xl font-bold shadow-sm flex items-center justify-center gap-3 shrink-0 cursor-pointer transition-colors"
              >
                <Stethoscope aria-hidden="true" className="w-7 h-7 shrink-0" />
                <span>{t.tellDoctorBtn}</span>
              </button>
            </div>

            {/* Today's Schedule (with Plain-Language Tags + Big Undo button beside every logged dose) */}
            {((!dementiaFriendlyMode && todaysLogs.length > 0) ||
              (dementiaFriendlyMode && takenTodayLogs.length > 0)) && (
              <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-8 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="font-display text-2xl font-bold">
                    {dementiaFriendlyMode ? t.takenTodayHeading : t.todaysSchedule}
                  </h2>
                  <button
                    type="button"
                    onClick={onOpenCalendar}
                    className="min-h-[48px] px-5 rounded-2xl bg-[#F2ECE1] hover:bg-[#E7DFD1] text-[#0D5652] text-base font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Calendar aria-hidden="true" className="w-5 h-5" />
                    <span>{t.tabCalendar}</span>
                  </button>
                </div>
                <div className="divide-y divide-[#DFD5C5]">
                  {(dementiaFriendlyMode ? takenTodayLogs : todaysLogs).map((log) => {
                    const med = state.medications.find((m) => m.id === log.medicationId);
                    if (!med) return null;
                    const done = log.status === 'verified_taken' || log.status === 'said_taken';
                    const tags = getPlainMedicineTags(med, state.language);
                    return (
                      <div key={log.id} className="py-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0">
                            <PillGraphic
                              color={med.pillColor}
                              shape={med.pillShape}
                              size={56}
                              language={state.language}
                              medName={med.name}
                            />
                            <div className="min-w-0 space-y-1.5">
                              <div className="font-bold text-lg sm:text-xl text-[#131B19]">
                                {med.name} {med.dose}{' '}
                                <span className="text-[#3E4C48] font-semibold text-base tabular-nums">
                                  · {log.scheduledTime}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 text-sm font-bold">
                                <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-[#0D5652] border border-teal-200">
                                  {tags.purposeTag}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-[#A85208] border border-amber-200">
                                  {tags.timingTag}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-base font-bold shrink-0 ${
                              done
                                ? 'text-emerald-800'
                                : log.status === 'missed'
                                ? 'text-[#3E4C48]'
                                : 'text-[#A85208]'
                            }`}
                          >
                            {log.status === 'verified_taken'
                              ? t.statusVerifiedTaken
                              : log.status === 'said_taken'
                              ? t.statusSaidTaken
                              : log.status === 'missed'
                              ? t.statusMissed
                              : t.statusPending}
                          </span>
                        </div>

                        {done && (
                          <button
                            type="button"
                            onClick={() => handleUndoDose(log.id, med.name)}
                            className="w-full sm:w-auto min-h-[52px] px-5 py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-amber-50 border-2 border-amber-600 text-amber-950 font-bold text-base flex items-center justify-center gap-2.5 cursor-pointer transition-colors"
                          >
                            <RotateCcw className="w-5 h-5 shrink-0" />
                            <span>{t.undoDoseBtn}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Secondary Delight Column: Mood Check-in + Daily Health Tip + Comfort Link */}
          <div className="lg:col-span-5 space-y-7">
            <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-5">
              <div className="flex items-center gap-3">
                <Heart aria-hidden="true" className="w-7 h-7 text-[#A85208]" />
                <h2 className="font-display text-2xl font-bold">{t.moodTitle}</h2>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5" role="group" aria-label={t.moodTitle}>
                {MOODS.map((m) => {
                  const selected = todayMood === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onRecordMood(m.value)}
                      className={`min-h-[82px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-95 ${
                        selected
                          ? 'bg-[#0D5652] text-white border-[#0D5652] shadow-sm'
                          : 'bg-[#FAF7F2] hover:bg-[#F2ECE1] border-[#DFD5C5]'
                      }`}
                    >
                      <span aria-hidden="true" className="text-3xl leading-none">{m.emoji}</span>
                      <span className="text-xs sm:text-sm font-bold leading-tight w-full text-center">
                        {t[m.key]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sati-card bg-[#F2ECE1] rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Sun aria-hidden="true" className="w-7 h-7 text-[#A85208]" />
                  <h2 className="font-display text-2xl font-bold">{t.dailyTipTitle}</h2>
                </div>
                {dailyTip && (
                  <button
                    type="button"
                    onClick={() => speakWarmly(dailyTip, state.language)}
                    aria-label={t.readAloud}
                    className="w-12 h-12 rounded-2xl bg-white hover:bg-[#FAF7F2] flex items-center justify-center text-[#0D5652] cursor-pointer transition-colors shrink-0"
                  >
                    <Volume2 aria-hidden="true" className="w-6 h-6" />
                  </button>
                )}
              </div>
              <p className="leading-relaxed text-[#131B19]">
                {loadingTip ? t.preparingTip : dailyTip}
              </p>
            </div>

            <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-5 sm:p-6">
              <button
                type="button"
                onClick={() => onChangeTab('settings')}
                className="w-full min-h-[56px] px-2 flex items-center justify-between font-bold text-[#0D5652] cursor-pointer"
              >
                <span className="flex items-center gap-3 text-left">
                  <Lock className="w-6 h-6 shrink-0" />
                  <span>{t.privacyTitle} &amp; {t.accessibilityTitle}</span>
                </span>
                <ChevronRight className="w-6 h-6 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MY PROGRESS TAB */}
      {activeTab === 'progress' && (
        <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-7 sm:p-10 space-y-7">
          <div className="flex items-center gap-3.5 text-[#0D5652]">
            <Sparkles aria-hidden="true" className="w-8 h-8 text-[#A85208]" />
            <h1 className={`font-display font-extrabold ${headingSizeClass}`}>
              {t.tabProgress}
            </h1>
          </div>

          <p className="font-display text-2xl sm:text-3xl font-bold text-[#131B19] leading-snug">
            {weeklyStats.totalScheduled > 0
              ? formatTemplate(t.progressBestWeek, {
                  taken: weeklyStats.totalTaken,
                  total: weeklyStats.totalScheduled,
                })
              : t.noProgressYet}
          </p>
          <p className="sati-muted text-[#3E4C48]">{t.gentleEncouragement}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#DFD5C5]">
              <div className="sati-muted text-base font-medium text-[#3E4C48]">{t.dosesTakenLabel}</div>
              <div className="font-display text-5xl font-extrabold text-[#0D5652] tabular-nums mt-2">
                {weeklyStats.totalScheduled > 0
                  ? Math.round((weeklyStats.totalTaken / weeklyStats.totalScheduled) * 100)
                  : 0}
                %
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#DFD5C5]">
              <div className="sati-muted text-base font-medium text-[#3E4C48]">{t.streakLabel}</div>
              <div className="font-display text-5xl font-extrabold text-[#A85208] tabular-nums mt-2">
                {weeklyStats.streakDays} {t.daysWord}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-3 items-end h-48 pt-4">
              {weeklyStats.days.map((d) => {
                const pct = d.total > 0 ? Math.round((d.taken / d.total) * 100) : 0;
                return (
                  <div key={d.dateStr} className="flex flex-col items-center gap-2.5 h-full justify-end">
                    <span className="sati-muted text-sm font-bold tabular-nums text-[#3E4C48]">
                      {d.taken}/{d.total || 0}
                    </span>
                    <div className="w-full max-w-[48px] h-32 bg-[#F2ECE1] rounded-2xl overflow-hidden flex items-end">
                      <div
                        className={`w-full rounded-2xl transition-all duration-300 ${
                          d.total === 0 ? 'bg-[#CFC5B4]' : 'bg-[#0D5652]'
                        }`}
                        style={{ height: `${d.total > 0 ? Math.max(16, pct) : 8}%` }}
                      />
                    </div>
                    <span className="text-base font-bold text-[#131B19]">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <AppointmentsSection
          state={state}
          onOpenAddAppt={onOpenAddAppt}
          onOpenCalendar={onOpenCalendar}
          canAdd
          elderlyLargeMode
          headingLevel="h1"
        />
      )}

      {/* TALK TO SATI TAB */}
      {activeTab === 'talk' && (
        <TalkToSatiPanel
          state={state}
          todayStr={todayStr}
          onAppendMessage={onAppendChatMessage}
          onTriggerEmergency={onTriggerEmergency}
          onAlertCaretaker={onAlertCaretaker}
          onSendFamilyMessage={onSendFamilyMessage}
          largeTextClass={bodySizeClass}
        />
      )}

      {/* PRIVACY & ACCESSIBILITY SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          <div className="lg:col-span-2 flex flex-wrap items-center justify-between gap-3">
            <h1 className={`font-display font-extrabold text-[#131B19] ${headingSizeClass}`}>
              {t.tabSettings}
            </h1>
            <button
              type="button"
              onClick={() => onChangeTab('today')}
              className="min-h-[48px] px-5 rounded-2xl bg-white hover:bg-[#F2ECE1] border-2 border-[#DFD5C5] text-[#0D5652] font-bold text-base inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>← {t.tabToday}</span>
            </button>
          </div>
          {/* Privacy & Dignity Controls */}
          <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-7 space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[#0D5652]" />
              <h2 className="font-display text-2xl sm:text-3xl font-bold">{t.privacyTitle}</h2>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C5] flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="sati-muted text-sm font-medium text-[#3E4C48]">{t.yourCirclePasscode}</div>
                <div className="font-display text-3xl sm:text-4xl font-extrabold tracking-[0.2em] text-[#0D5652] tabular-nums">
                  {state.passcode}
                </div>
                <span className="sati-muted block text-sm text-[#3E4C48] mt-1">
                  {t.sharePasscodeHint}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyPasscode}
                className="min-h-[48px] px-4 rounded-2xl bg-white hover:bg-[#F2ECE1] border border-[#DFD5C5] text-[#0D5652] text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors shrink-0"
              >
                {copiedPasscode ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPasscode ? t.copiedPasscodeWord : t.copyPasscodeBtn}</span>
              </button>
            </div>

            <div className="space-y-3">
              {(
                [
                  ['shareScheduleWithFamily', t.shareSchedule],
                  ['shareProgressWithFamily', t.shareProgress],
                  ['shareMoodWithFamily', t.shareMood],
                  ['shareAppointmentsWithFamily', t.shareAppointments],
                  ['askBeforeMinorAlerts', t.askBeforeMinorAlerts],
                  ['allowFamilyToEdit', t.allowFamilyEdit],
                ] as Array<[keyof PrivacySettings, string]>
              ).map(([key, label]) => {
                const enabled = state.privacy[key];
                return (
                  <button
                    key={key}
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => onUpdatePrivacy({ [key]: !enabled })}
                    className="w-full min-h-[64px] flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] text-left cursor-pointer transition-colors"
                  >
                    <span className="text-base sm:text-lg font-semibold leading-snug">{label}</span>
                    <TactileSwitch checked={enabled} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display, Low-Vision & Dementia-Friendly Controls */}
          <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-7 space-y-6">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-[#A85208]" />
              <h2 className="font-display text-2xl sm:text-3xl font-bold">{t.accessibilityTitle}</h2>
            </div>

            <div className="space-y-3">
              <span id="text-size-group-label" className="block font-bold text-lg">{t.textSizeLabel}</span>
              <div className="grid grid-cols-3 gap-3" role="group" aria-labelledby="text-size-group-label">
                {(
                  [
                    ['normal', t.textNormal],
                    ['large', t.textLarge],
                    ['xlarge', t.textXLarge],
                  ] as const
                ).map(([scale, label]) => (
                  <button
                    key={scale}
                    type="button"
                    aria-pressed={textScale === scale}
                    onClick={() => onUpdateAccessibility({ textScale: scale })}
                    className={`min-h-[58px] px-3 rounded-2xl font-bold text-sm sm:text-base border-2 cursor-pointer transition-colors ${
                      textScale === scale
                        ? 'bg-[#0D5652] text-white border-[#0D5652]'
                        : 'bg-[#FAF7F2] hover:bg-[#F2ECE1] border-[#DFD5C5] text-[#131B19]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={voiceRemindersEnabled}
              onClick={() => onUpdateAccessibility({ voiceRemindersEnabled: !voiceRemindersEnabled })}
              className="w-full min-h-[68px] flex items-center justify-between gap-4 p-5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] text-left cursor-pointer transition-colors"
            >
              <span className="font-bold text-lg">{t.voiceRemindersLabel}</span>
              <TactileSwitch checked={voiceRemindersEnabled} />
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={highContrast}
              onClick={() => onUpdateAccessibility({ highContrast: !highContrast })}
              className="w-full min-h-[68px] flex items-center justify-between gap-4 p-5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] text-left cursor-pointer transition-colors"
            >
              <span className="font-bold text-lg">{t.highContrastLabel}</span>
              <TactileSwitch checked={highContrast} />
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={dementiaFriendlyMode}
              onClick={() => onUpdateAccessibility({ dementiaFriendlyMode: !dementiaFriendlyMode })}
              className="w-full min-h-[84px] flex items-start justify-between gap-4 p-5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] text-left cursor-pointer transition-colors"
            >
              <div className="space-y-1">
                <div className="font-bold text-lg">{t.dementiaModeLabel}</div>
                <p className="sati-muted text-sm sm:text-base text-[#3E4C48]">{t.dementiaModeDesc}</p>
              </div>
              <TactileSwitch checked={dementiaFriendlyMode} />
            </button>

            {/* Preview Tools neatly placed in Settings */}
            <div className="pt-4 border-t border-[#DFD5C5] space-y-3">
              <div className="sati-muted text-sm font-bold text-[#3E4C48]">
                {t.reminderPreviewsTitle}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onTestReminder}
                  className="min-h-[50px] px-5 rounded-2xl bg-[#F2ECE1] hover:bg-[#E7DFD1] text-[#131B19] text-base font-semibold cursor-pointer transition-colors"
                >
                  {t.testReminderBtn}
                </button>
                <button
                  type="button"
                  onClick={onTestInactivity}
                  className="min-h-[50px] px-5 rounded-2xl bg-[#F2ECE1] hover:bg-[#E7DFD1] text-[#131B19] text-base font-semibold cursor-pointer transition-colors"
                >
                  {t.testInactivityBtn}
                </button>
              </div>
            </div>
          </div>

          {/* Editable Medical ID Profile Section */}
          <form
            onSubmit={handleSaveMedicalId}
            className="lg:col-span-2 sati-card bg-white rounded-3xl border border-[#DFD5C5] p-7 space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <HeartPulse className="w-8 h-8 text-[#991B1B]" />
                  <h2 className="font-display text-2xl sm:text-3xl font-bold">{t.medicalIdEditTitle}</h2>
                </div>
                <p className="sati-muted text-base text-[#3E4C48]">{t.medicalIdEditDesc}</p>
              </div>
              <button
                type="button"
                onClick={onOpenMedicalId}
                className="min-h-[48px] px-5 rounded-2xl bg-[#FEF2F2] hover:bg-red-100 border border-red-300 text-[#991B1B] text-base font-bold flex items-center gap-2 cursor-pointer"
              >
                <HeartPulse className="w-5 h-5" />
                <span>{t.medicalIdBtn}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-base font-semibold mb-1.5">{t.nameLabel}</label>
                <input
                  type="text"
                  value={medIdName}
                  onChange={(e) => setMedIdName(e.target.value)}
                  className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] text-base font-medium"
                />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1.5">{t.ageLabel}</label>
                <input
                  type="number"
                  min={40}
                  max={120}
                  value={medIdAge}
                  onChange={(e) => setMedIdAge(e.target.value)}
                  className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] text-base font-medium tabular-nums"
                />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1.5">{t.bloodGroupLabel}</label>
                <input
                  type="text"
                  value={medIdBloodGroup}
                  onChange={(e) => setMedIdBloodGroup(e.target.value)}
                  placeholder="O+"
                  className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] text-base font-bold uppercase"
                />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1.5">{t.emergencyPhoneLabel}</label>
                <input
                  type="text"
                  value={medIdEmergencyPhone}
                  onChange={(e) => setMedIdEmergencyPhone(e.target.value)}
                  placeholder="108"
                  className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] text-base font-medium tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-semibold mb-1.5">{t.doctorContactLabel}</label>
                <input
                  type="text"
                  value={medIdDoctorName}
                  onChange={(e) => setMedIdDoctorName(e.target.value)}
                  placeholder={t.apptDoctorPlaceholder}
                  className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] text-base"
                />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1.5">{t.doctorPhoneLabel}</label>
                <input
                  type="tel"
                  value={medIdDoctorPhone}
                  onChange={(e) => setMedIdDoctorPhone(e.target.value)}
                  placeholder="+91 98450 22190"
                  className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] text-base tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-semibold mb-1.5">{t.conditionsCommaHint}</label>
                <input
                  type="text"
                  value={medIdConditions}
                  onChange={(e) => setMedIdConditions(e.target.value)}
                  placeholder={t.conditionsPlaceholder}
                  className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] text-base"
                />
              </div>
              <div>
                <label className="block text-base font-semibold mb-1.5">{t.allergiesCommaHint}</label>
                <input
                  type="text"
                  value={medIdAllergies}
                  onChange={(e) => setMedIdAllergies(e.target.value)}
                  placeholder={t.allergiesPlaceholder}
                  className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] text-base"
                />
              </div>
            </div>

            {/* Editable Family Contacts */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-lg font-bold text-[#131B19]">{t.familyContactsLabel}</label>
                <button
                  type="button"
                  onClick={() =>
                    setMedIdContacts((prev) => [
                      ...prev,
                      { id: `fc-${Date.now()}`, name: '', relation: '', phone: '' },
                    ])
                  }
                  className="min-h-[48px] px-4 rounded-2xl bg-[#F2ECE1] hover:bg-[#E7DFD1] text-[#0D5652] text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Plus aria-hidden="true" className="w-4 h-4" />
                  <span>{t.addContactBtn}</span>
                </button>
              </div>
              <div className="space-y-3">
                {medIdContacts.map((contact, idx) => (
                  <div
                    key={contact.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C5] items-center"
                  >
                    <input
                      type="text"
                      aria-label={t.contactNamePlaceholder}
                      value={contact.name}
                      onChange={(e) =>
                        setMedIdContacts((prev) =>
                          prev.map((c, i) => (i === idx ? { ...c, name: e.target.value } : c))
                        )
                      }
                      placeholder={t.contactNamePlaceholder}
                      className="sm:col-span-4 min-h-[48px] px-3.5 rounded-xl border border-[#DFD5C5] bg-white text-base"
                    />
                    <input
                      type="text"
                      aria-label={t.contactRelationPlaceholder}
                      value={contact.relation}
                      onChange={(e) =>
                        setMedIdContacts((prev) =>
                          prev.map((c, i) => (i === idx ? { ...c, relation: e.target.value } : c))
                        )
                      }
                      placeholder={t.contactRelationPlaceholder}
                      className="sm:col-span-3 min-h-[48px] px-3.5 rounded-xl border border-[#DFD5C5] bg-white text-base"
                    />
                    <input
                      type="tel"
                      aria-label={t.contactPhonePlaceholder}
                      value={contact.phone}
                      onChange={(e) =>
                        setMedIdContacts((prev) =>
                          prev.map((c, i) => (i === idx ? { ...c, phone: e.target.value } : c))
                        )
                      }
                      placeholder={t.contactPhonePlaceholder}
                      className="sm:col-span-4 min-h-[48px] px-3.5 rounded-xl border border-[#DFD5C5] bg-white text-base tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setMedIdContacts((prev) => prev.filter((_, i) => i !== idx))
                      }
                      aria-label={contact.name ? `${t.deleteBtn}: ${contact.name}` : t.deleteBtn}
                      className="sm:col-span-1 min-w-[48px] min-h-[48px] rounded-xl bg-white hover:bg-red-50 border border-[#DFD5C5] text-[#991B1B] flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 aria-hidden="true" className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                type="submit"
                className="min-h-[56px] px-8 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white font-display text-lg font-bold shadow-sm cursor-pointer transition-colors"
              >
                {t.saveBtn}
              </button>
              {medIdSavedToast && (
                <span className="inline-flex items-center gap-2 text-emerald-800 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t.medicalIdSavedToast}</span>
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      <TellDoctorModal
        isOpen={tellDoctorOpen}
        onClose={() => setTellDoctorOpen(false)}
        language={state.language}
        onSaveNote={onAddDoctorNote}
        onSavedSuccess={(categoryLabel) => {
          const toastMsg = formatTemplate(t.tellDoctorSavedToast, { category: categoryLabel });
          setInfoBanner(toastMsg);
          if (state.accessibility.voiceRemindersEnabled) {
            speakWarmly(
              formatTemplate(t.tellDoctorSpokenConfirm, { name: state.elderly.honorificName }),
              state.language
            );
          }
        }}
      />
    </motion.div>
  );
}
