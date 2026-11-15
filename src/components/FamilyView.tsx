import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Calendar,
  CheckCircle2,
  Copy,
  FileText,
  Heart,
  Loader2,
  Lock,
  Mic,
  Play,
  Plus,
  Square,
  Trash2,
  Upload,
} from 'lucide-react';
import { getLocalDateStr } from '../data/seedData';
import { formatTemplate, getT, LANGUAGES } from '../i18n/translations';
import { generateWeeklyDoctorReport } from '../services/geminiService';
import { computeFamilyWellbeingStatus, resolveAlertText } from '../store/useCareStore';
import { AccessibilitySettings, CareCircleState } from '../types';
import {
  AdherenceTrendChart,
  AlertsTimelineCard,
  computeCareAnalytics,
  MonthlyAdherenceCalendar,
  MostMissedTimesCard,
  PerMedicineBreakdown,
  StreakKpiBadge,
  WeeklyBarChart,
} from './AnalyticsSuite';
import { AppointmentsSection, NextAppointmentSpotlight } from './AppointmentsSection';
import { DoctorNotesCard, getSymptomCategoryLabel } from './DoctorNotesSection';
import { EmailLogSection } from './EmailLogSection';
import { PillGraphic } from './PillGraphic';

export type FamilyTab = 'overview' | 'alerts' | 'emails';

interface FamilyViewProps {
  state: CareCircleState;
  activeTab: FamilyTab;
  onOpenCalendar: () => void;
  onOpenAddMed: () => void;
  onOpenAddAppt: () => void;
  onUpdateAccessibility: (patch: Partial<AccessibilitySettings>) => void;
  onAcknowledgeAlert: (alertId: string) => void;
}

export function FamilyView({
  state,
  activeTab,
  onOpenCalendar,
  onOpenAddMed,
  onOpenAddAppt,
  onUpdateAccessibility,
  onAcknowledgeAlert,
}: FamilyViewProps) {
  const t = getT(state.language);
  const speechLocale = LANGUAGES.find((l) => l.code === state.language)?.speechLocale || 'en-IN';
  const todayStr = getLocalDateStr(0);

  const [reportText, setReportText] = useState('');
  const [usedOfflineReport, setUsedOfflineReport] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [copied, setCopied] = useState(false);

  const [recording, setRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try {
          recorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
    };
  }, []);

  const analytics = useMemo(() => computeCareAnalytics(state), [state]);
  const wellbeing = useMemo(() => computeFamilyWellbeingStatus(state), [state]);

  const activeMedIds = useMemo(
    () => new Set(state.medications.map((m) => m.id)),
    [state.medications]
  );
  const todaysDoses = state.doseLogs.filter(
    (d) => d.date === todayStr && activeMedIds.has(d.medicationId)
  );
  const todayDone = todaysDoses.filter(
    (d) => d.status === 'verified_taken' || d.status === 'said_taken'
  ).length;

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    setUsedOfflineReport(false);
    const notesBlock =
      (state.doctorNotes || []).length > 0
        ? `\n\n${t.doctorNotesSectionTitle}:\n` +
          state.doctorNotes
            .slice(0, 6)
            .map(
              (n) =>
                `• ${n.date} ${n.time} (${getSymptomCategoryLabel(n.category, state.language)}): ${n.text}`
            )
            .join('\n')
        : '';

    try {
      const res = await generateWeeklyDoctorReport(state, todayStr);
      setReportText(`${res.report}${notesBlock}`);
    } catch {
      const fallback =
        state.language === 'hi'
          ? `${state.elderly.name} ने पिछले 7 दिनों में ${analytics.weeklyTotal} में से ${analytics.weeklyTaken} निर्धारित खुराक (${analytics.weeklyPct}%) लीं।`
          : state.language === 'mr'
          ? `${state.elderly.name} यांनी गेल्या 7 दिवसांत ${analytics.weeklyTotal} पैकी ${analytics.weeklyTaken} नियोजित डोस (${analytics.weeklyPct}%) घेतले.`
          : `${state.elderly.name} completed ${analytics.weeklyTaken} of ${analytics.weeklyTotal} scheduled doses (${analytics.weeklyPct}%) over the last 7 days.`;
      setReportText(`${fallback}${notesBlock}`);
      setUsedOfflineReport(true);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleCopyReport = async () => {
    if (!reportText) return;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(reportText).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const toggleRecordVoice = async () => {
    setVoiceError('');
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setVoiceError(t.voiceRecordError);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      mr.onerror = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        setRecording(false);
        setVoiceError(t.voiceRecordError);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const mimeType = mr.mimeType || chunksRef.current[0]?.type || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size > 2.5 * 1024 * 1024) {
          setVoiceError(t.voiceRecordError);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          onUpdateAccessibility({
            customVoiceMessageDataUrl: String(reader.result || ''),
            customVoiceSenderName:
              state.members.find((m) => m.id === state.activeUserId)?.name || 'Family',
          });
        };
        reader.onerror = () => {
          setVoiceError(t.voiceRecordError);
        };
        reader.readAsDataURL(blob);
      };
      recorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      setVoiceError(t.voiceRecordError);
    }
  };

  const handleUploadAudioFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setVoiceError('');
    if (file.size > 2.5 * 1024 * 1024) {
      setVoiceError(t.voiceRecordError);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateAccessibility({
        customVoiceMessageDataUrl: String(reader.result || ''),
        customVoiceSenderName:
          state.members.find((m) => m.id === state.activeUserId)?.name || 'Family',
      });
    };
    reader.onerror = () => {
      setVoiceError(t.voiceRecordError);
    };
    reader.readAsDataURL(file);
  };

  const handlePreviewVoice = () => {
    if (!state.accessibility.customVoiceMessageDataUrl) return;
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    const audio = new Audio(state.accessibility.customVoiceMessageDataUrl);
    previewAudioRef.current = audio;
    audio.play().catch(() => {});
  };

  const handleRemoveVoice = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    onUpdateAccessibility({
      customVoiceMessageDataUrl: undefined,
      customVoiceSenderName: undefined,
    });
  };

  const latestMood = state.moodLogs[0];

  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#131B19]">
            {t.familyOverviewHeading} · {state.elderly.honorificName}
          </h1>
          <p className="sati-muted text-base text-[#3E4C48]">
            {state.privacy.allowFamilyToEdit ? t.editingPermitted : t.viewOnlyPrivacy}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onOpenCalendar}
            className="min-h-[48px] px-5 rounded-2xl bg-white hover:bg-[#F2ECE1] border-2 border-[#DFD5C5] text-base font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Calendar className="w-5 h-5 text-[#0D5652]" />
            <span>{t.tabCalendar}</span>
          </button>
          {state.privacy.allowFamilyToEdit && (
            <>
              <button
                type="button"
                onClick={onOpenAddMed}
                className="min-h-[48px] px-5 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white text-base font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>{t.addMedication}</span>
              </button>
              <button
                type="button"
                onClick={onOpenAddAppt}
                className="min-h-[48px] px-5 rounded-2xl bg-[#F2ECE1] hover:bg-[#E7DFD1] text-[#131B19] text-base font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>{t.addAppointment}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-7">
          {/* Calm "All is well" Family Status Indicator */}
          <div
            role="status"
            aria-live="polite"
            className={`sati-card rounded-3xl border px-6 py-4 sm:py-5 flex items-center gap-4 ${
              wellbeing.tone === 'green'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : wellbeing.tone === 'amber'
                ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            <span
              aria-hidden="true"
              className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                wellbeing.tone === 'green'
                  ? 'bg-emerald-500 ring-4 ring-emerald-200/80'
                  : wellbeing.tone === 'amber'
                  ? 'bg-amber-500 ring-4 ring-amber-200/80'
                  : 'bg-rose-600 ring-4 ring-rose-200/80'
              }`}
            />
            <div className="min-w-0">
              <span className="font-display font-bold text-lg sm:text-xl mr-2">
                {wellbeing.title}
              </span>
              <span className="text-base sm:text-lg font-medium opacity-90">
                · {wellbeing.line}
              </span>
            </div>
          </div>

          {/* Top Analytical KPI Strip */}
          {!state.privacy.shareProgressWithFamily ? (
            <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 flex items-center gap-3 text-base text-[#3E4C48]">
              <Lock className="w-6 h-6 shrink-0" />
              <span>{t.privacyBlockedNotice}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-5">
                <div className="sati-muted text-sm font-semibold text-[#3E4C48]">
                  {t.weeklyAdherenceLabel}
                </div>
                <div className="font-display text-4xl font-extrabold text-[#0D5652] tabular-nums mt-1.5">
                  {analytics.weeklyPct}%
                </div>
                <div className="text-xs font-semibold text-[#3E4C48] mt-1 tabular-nums">
                  {formatTemplate(t.takenOfTotal, {
                    taken: analytics.weeklyTaken,
                    total: analytics.weeklyTotal,
                  })}
                </div>
              </div>

              <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-5">
                <div className="sati-muted text-sm font-semibold text-[#3E4C48]">
                  {t.thirtyDayAdherenceLabel}
                </div>
                <div className="font-display text-4xl font-extrabold text-emerald-800 tabular-nums mt-1.5">
                  {analytics.thirtyDayPct}%
                </div>
                <div className="text-xs font-semibold text-[#3E4C48] mt-1 tabular-nums">
                  {formatTemplate(t.verifiedShareLabel, { pct: analytics.verifiedRatePct })}
                </div>
              </div>

              <StreakKpiBadge
                currentStreak={analytics.currentStreak}
                bestStreak={analytics.bestStreak}
                language={state.language}
              />

              <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-5">
                <div className="sati-muted text-sm font-semibold text-[#3E4C48]">
                  {t.todayProgressLabel}
                </div>
                <div className="font-display text-4xl font-extrabold text-[#131B19] tabular-nums mt-1.5">
                  {todayDone}/{todaysDoses.length}
                </div>
                <div className="text-xs font-semibold text-[#3E4C48] mt-1">{t.dosesWord}</div>
              </div>
            </div>
          )}

          {/* Next Appointment Highlight on Family Dashboard */}
          {!state.privacy.shareAppointmentsWithFamily ? (
            <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 flex items-center gap-3 text-base text-[#3E4C48]">
              <Lock className="w-6 h-6 shrink-0" />
              <span>{t.privacyBlockedNotice}</span>
            </div>
          ) : (
            <NextAppointmentSpotlight
              state={state}
              onOpenAddAppt={onOpenAddAppt}
              canAdd={state.privacy.allowFamilyToEdit}
            />
          )}

          {/* Full Month Color-Coded Calendar + Selected Day Doses Inspector */}
          {!state.privacy.shareProgressWithFamily && !state.privacy.shareScheduleWithFamily ? (
            <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 flex items-center gap-3 text-base text-[#3E4C48]">
              <Lock className="w-6 h-6 shrink-0" />
              <span>{t.privacyBlockedNotice}</span>
            </div>
          ) : (
            <MonthlyAdherenceCalendar state={state} />
          )}

          {/* Adherence Trend Line Chart & Weekly Bar Chart */}
          {state.privacy.shareProgressWithFamily && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                <AdherenceTrendChart points={analytics.trendPoints} language={state.language} />
                <WeeklyBarChart bars={analytics.weeklyBars} language={state.language} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                <PerMedicineBreakdown items={analytics.perMedicine} language={state.language} />
                <MostMissedTimesCard analytics={analytics} language={state.language} />
              </div>
            </>
          )}

          {/* Doctor Report, Today's Schedule, Alerts Timeline, Mood, Visits & Family Voice */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            <div className="lg:col-span-7 space-y-7">
              {/* One-Tap Gemini Weekly Doctor Report */}
              <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-7 h-7 text-[#0D5652]" />
                    <h2 className="font-display text-2xl font-bold">{t.doctorReportCardTitle}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    className="min-h-[50px] px-5 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white text-base font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {generatingReport && <Loader2 className="w-5 h-5 animate-spin" />}
                    <span>{t.weeklyReportBtn}</span>
                  </button>
                </div>
                {reportText && (
                  <div
                    role="region"
                    aria-live="polite"
                    aria-label={t.doctorReportCardTitle}
                    className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C5] space-y-4"
                  >
                    {usedOfflineReport && (
                      <p className="text-sm font-medium text-amber-900 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
                        {t.offlineReportNote}
                      </p>
                    )}
                    <p className="text-base sm:text-lg leading-relaxed text-[#131B19] whitespace-pre-line">
                      {reportText}
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyReport}
                      className="min-h-[48px] px-4 rounded-2xl bg-white hover:bg-[#F2ECE1] border-2 border-[#DFD5C5] text-base font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                      <span>{copied ? t.copiedNotice : t.copyForDoctor}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Patient Symptom Notes for the Doctor */}
              <DoctorNotesCard notes={state.doctorNotes || []} language={state.language} />

              {/* Today's Schedule Respecting Privacy */}
              <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-5">
                <h2 className="font-display text-2xl font-bold">{t.todaysMedSchedule}</h2>
                {!state.privacy.shareScheduleWithFamily ? (
                  <div className="flex items-center gap-3 text-base text-[#3E4C48]">
                    <Lock className="w-6 h-6" />
                    <span>{t.privacyBlockedNotice}</span>
                  </div>
                ) : todaysDoses.length === 0 ? (
                  <p className="sati-muted text-base text-[#3E4C48]">{t.noDosesToday}</p>
                ) : (
                  <div className="divide-y divide-[#DFD5C5]">
                    {todaysDoses.map((log) => {
                      const med = state.medications.find((m) => m.id === log.medicationId);
                      if (!med) return null;
                      const statusLabel =
                        log.status === 'verified_taken'
                          ? t.statusVerifiedTaken
                          : log.status === 'said_taken'
                          ? t.statusSaidTaken
                          : log.status === 'missed'
                          ? t.statusMissed
                          : t.statusPending;
                      return (
                        <div key={log.id} className="py-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <PillGraphic
                              color={med.pillColor}
                              shape={med.pillShape}
                              size={50}
                              language={state.language}
                              medName={med.name}
                            />
                            <div>
                              <div className="font-bold text-lg">
                                {med.name} {med.dose}
                              </div>
                              <div className="sati-muted text-sm text-[#3E4C48] tabular-nums">
                                {log.scheduledTime}
                              </div>
                            </div>
                          </div>
                          <span className="text-base font-bold text-[#0D5652]">{statusLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 space-y-7">
              <AlertsTimelineCard
                alerts={state.alerts}
                language={state.language}
                onAcknowledgeAlert={onAcknowledgeAlert}
              />

              <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-4">
                <div className="flex items-center gap-2.5">
                  <Heart aria-hidden="true" className="w-6 h-6 text-[#A85208]" />
                  <h2 className="font-display text-2xl font-bold">{t.wellbeingMoodTitle}</h2>
                </div>
                {!state.privacy.shareMoodWithFamily ? (
                  <div className="flex items-center gap-2.5 text-base text-[#3E4C48]">
                    <Lock aria-hidden="true" className="w-5 h-5" />
                    <span>{t.privacyBlockedNotice}</span>
                  </div>
                ) : latestMood ? (
                  <p className="text-lg">
                    {t.latestCheckIn} ({latestMood.date}):{' '}
                    <strong className="text-[#0D5652]">
                      {latestMood.mood === 'happy'
                        ? t.moodHappy
                        : latestMood.mood === 'calm'
                        ? t.moodCalm
                        : latestMood.mood === 'tired'
                        ? t.moodTired
                        : latestMood.mood === 'sad'
                        ? t.moodSad
                        : t.moodUnwell}
                    </strong>
                  </p>
                ) : (
                  <p className="sati-muted text-base text-[#3E4C48]">{t.noMoodRecorded}</p>
                )}
              </div>

              <div className="sati-card bg-[#F2ECE1] rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-4">
                <h2 className="font-display text-2xl font-bold">{t.recordFamilyVoice}</h2>
                <p className="sati-muted text-base text-[#3E4C48] leading-relaxed">
                  {t.recordFamilyVoiceDesc}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    aria-pressed={recording}
                    onClick={toggleRecordVoice}
                    className={`min-h-[50px] px-5 rounded-2xl font-bold text-base flex items-center gap-2 cursor-pointer transition-colors ${
                      recording ? 'bg-rose-700 text-white' : 'bg-[#0D5652] hover:bg-[#09413E] text-white'
                    }`}
                  >
                    {recording ? <Square aria-hidden="true" className="w-5 h-5" /> : <Mic aria-hidden="true" className="w-5 h-5" />}
                    <span>{recording ? t.stopRecordingBtn : t.recordVoiceBtn}</span>
                  </button>
                  <label className="min-h-[50px] px-5 rounded-2xl bg-white hover:bg-[#FAF7F2] border-2 border-[#DFD5C5] focus-within:outline-3 focus-within:outline-[#D97706] focus-within:outline-offset-2 text-base font-bold flex items-center gap-2 cursor-pointer transition-colors">
                    <Upload aria-hidden="true" className="w-5 h-5" />
                    <span>{t.uploadAudioBtn}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="sr-only"
                      onChange={handleUploadAudioFile}
                    />
                  </label>
                </div>
                {voiceError && (
                  <p role="alert" className="text-sm font-semibold text-amber-950 bg-amber-50 border border-amber-300 px-4 py-2.5 rounded-2xl">
                    {voiceError}
                  </p>
                )}
                {state.accessibility.customVoiceMessageDataUrl && (
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={handlePreviewVoice}
                      className="min-h-[48px] px-4 rounded-2xl bg-white text-[#0D5652] text-base font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-5 h-5" />
                      <span>{t.previewVoiceBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveVoice}
                      className="min-h-[48px] px-4 rounded-2xl bg-white hover:bg-rose-50 text-rose-800 border border-[#DFD5C5] text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{t.removeVoiceBtn}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {state.privacy.shareAppointmentsWithFamily && (
            <AppointmentsSection
              state={state}
              onOpenAddAppt={onOpenAddAppt}
              onOpenCalendar={onOpenCalendar}
              canAdd={state.privacy.allowFamilyToEdit}
            />
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-5">
          <h2 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-[#A85208]" />
            <span>{t.alertsFeed}</span>
          </h2>
          {state.alerts.length === 0 ? (
            <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-9 text-center text-[#3E4C48]">
              {t.allClearAlerts}
            </div>
          ) : (
            <div className="space-y-4">
              {state.alerts.map((a) => {
                const localized = resolveAlertText(a, state.language);
                return (
                  <div
                    key={a.id}
                    className={`sati-card rounded-3xl border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      a.severity === 'critical'
                        ? 'bg-rose-50 border-rose-300'
                        : a.severity === 'warning'
                        ? 'bg-amber-50/80 border-amber-300'
                        : 'bg-white border-[#DFD5C5]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="font-display text-xl font-bold text-[#131B19]">{localized.title}</div>
                      <p className="text-base text-[#3E4C48]">{localized.message}</p>
                      <div className="text-sm text-[#3E4C48] tabular-nums">
                        {new Date(a.createdAt).toLocaleString(speechLocale)}
                      </div>
                    </div>
                    {!a.acknowledged ? (
                      <button
                        type="button"
                        onClick={() => onAcknowledgeAlert(a.id)}
                        className="min-h-[48px] px-5 rounded-2xl bg-white hover:bg-[#F2ECE1] border-2 border-[#DFD5C5] text-base font-bold cursor-pointer shrink-0 transition-colors"
                      >
                        {t.acknowledgeBtn}
                      </button>
                    ) : (
                      <span className="text-sm font-bold text-emerald-800 shrink-0">{t.acknowledgedWord}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'emails' && (
        <EmailLogSection emailLogs={state.emailLogs} language={state.language} />
      )}
    </motion.div>
  );
}
