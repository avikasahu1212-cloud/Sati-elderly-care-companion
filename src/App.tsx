import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertOctagon,
  Award,
  Bell,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  FastForward,
  HeartHandshake,
  Home,
  LayoutDashboard,
  Mail,
  MessageCircleHeart,
  Pill,
  RotateCcw,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { CalendarModal } from './components/CalendarModal';
import { CaretakerTab, CaretakerView } from './components/CaretakerView';
import { DemoControlsModal } from './components/DemoControlsModal';
import { ElderlyTab, ElderlyView } from './components/ElderlyView';
import { EmergencyOverlay, InactivityCheckModal } from './components/EmergencyOverlay';
import { FamilyTab, FamilyView } from './components/FamilyView';
import { MedicalIdModal } from './components/MedicalIdModal';
import { AppointmentModal, MedicationEditorModal, PhotoVerifyModal } from './components/MedicationModals';
import { SatiLogo } from './components/PillGraphic';
import { SatiMicOrb } from './components/SatiMicOrb';
import { WelcomeSetup } from './components/WelcomeSetup';
import { getLocalDateStr } from './data/seedData';
import { formatTemplate, getT, LANGUAGES } from './i18n/translations';
import { useCareStore } from './store/useCareStore';
import { LanguageCode, Medication, UserRole } from './types';
import { playGentleChime, speakWarmly, stopSpeaking } from './utils/speech';

interface ActiveReminder {
  doseId: string;
  medName: string;
  doseText: string;
  routineCue: string;
  stage: 0 | 1 | 2 | 3;
}

export default function App() {
  const {
    state,
    activeRole,
    setLanguage,
    loadDemoMode,
    resetToWelcome,
    completeFreshElderlySetup,
    joinCircleWithPasscode,
    switchRoleView,
    touchActivity,
    dispatchAlertAndEmails,
    logSimulatedEmail,
    confirmDoseTaken,
    undoDoseTaken,
    verifyDose,
    markDoseMissed,
    addMedication,
    updateMedication,
    deleteMedication,
    addAppointment,
    deleteAppointment,
    addDoctorNote,
    deleteDoctorNote,
    recordMood,
    acknowledgeAlert,
    updatePrivacy,
    updateAccessibility,
    updateElderlyProfile,
    sendVoiceFamilyMessage,
    requestPasscodeHelp,
    appendChatMessage,
    simulateMissedDose,
    simulateDoubleDoseAttempt,
    simulateSuspiciousPattern,
  } = useCareStore();

  const t = getT(state.language);
  const todayStr = getLocalDateStr(0);

  const [elderlyTab, setElderlyTab] = useState<ElderlyTab>('today');
  const [caretakerTab, setCaretakerTab] = useState<CaretakerTab>('dashboard');
  const [familyTab, setFamilyTab] = useState<FamilyTab>('overview');

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [medicalIdOpen, setMedicalIdOpen] = useState(false);
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [medModalScan, setMedModalScan] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [apptModalOpen, setApptModalOpen] = useState(false);
  const [photoVerifyDoseId, setPhotoVerifyDoseId] = useState<string | null>(null);

  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState<string>('');
  const [inactivityOpen, setInactivityOpen] = useState(false);
  const [activeReminder, setActiveReminder] = useState<ActiveReminder | null>(null);
  const [demoControlsOpen, setDemoControlsOpen] = useState(false);
  const [demoNotice, setDemoNotice] = useState('');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [externalDoubleDoseSignal, setExternalDoubleDoseSignal] = useState<{
    id: number;
    message: string;
  } | null>(null);
  const [externalConfirmedSignal, setExternalConfirmedSignal] = useState<{
    id: number;
    doseId: string;
    medName: string;
    message: string;
  } | null>(null);
  const brandTapCountRef = useRef(0);
  const brandTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const snoozeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.documentElement.lang = state.language;
  }, [state.language]);

  useEffect(() => {
    return () => {
      if (snoozeTimerRef.current) clearTimeout(snoozeTimerRef.current);
    };
  }, []);

  const triggerEmergencyFlow = useCallback(
    (reason: string) => {
      setEmergencyReason(reason);
      setEmergencyOpen(true);
      setInactivityOpen(false);
      if (state.accessibility.voiceRemindersEnabled) {
        speakWarmly(
          formatTemplate(t.emergencySpokenMsg, {
            name: state.elderly.honorificName || state.elderly.name || 'Friend',
          }),
          state.language
        );
      }
      const vars = { name: state.elderly.name, reason };
      const emailVars = {
        elder: state.elderly.name,
        reason,
        conditions: state.elderly.conditions.join(', ') || t.noneReported,
        allergies: state.elderly.allergies.join(', ') || t.noneReported,
        location: state.elderly.locationLabel,
      };
      dispatchAlertAndEmails(
        {
          type: 'emergency',
          severity: 'critical',
          title: formatTemplate(t.alertEmergencyTitle, vars),
          message: formatTemplate(t.alertEmergencyMsg, vars),
          titleKey: 'alertEmergencyTitle',
          messageKey: 'alertEmergencyMsg',
          vars,
          targetRoles: ['caretaker', 'family'],
        },
        formatTemplate(t.emailEmergencySubject, emailVars),
        formatTemplate(t.emailEmergencyBody, emailVars),
        {
          subjectKey: 'emailEmergencySubject',
          bodyKey: 'emailEmergencyBody',
          vars: emailVars,
        }
      );
    },
    [
      dispatchAlertAndEmails,
      state.accessibility.voiceRemindersEnabled,
      state.elderly,
      state.language,
      t.alertEmergencyMsg,
      t.alertEmergencyTitle,
      t.emailEmergencyBody,
      t.emailEmergencySubject,
      t.emergencySpokenMsg,
      t.noneReported,
    ]
  );

  const triggerCaretakerAlert = useCallback(
    (reason: string) => {
      const vars = { name: state.elderly.honorificName };
      const emailVars = {
        elder: state.elderly.honorificName || state.elderly.name,
        reason,
      };
      dispatchAlertAndEmails(
        {
          type: 'health_concern',
          severity: 'warning',
          title: formatTemplate(t.alertHealthTitle, vars),
          message: reason,
          titleKey: 'alertHealthTitle',
          vars,
          targetRoles: ['caretaker', 'family'],
        },
        formatTemplate(t.emailHealthSubject, emailVars),
        formatTemplate(t.emailHealthBody, { ...emailVars, recipient: '' }),
        {
          subjectKey: 'emailHealthSubject',
          bodyKey: 'emailHealthBody',
          vars: emailVars,
        }
      );
    },
    [
      dispatchAlertAndEmails,
      state.elderly,
      t.alertHealthTitle,
      t.emailHealthBody,
      t.emailHealthSubject,
    ]
  );

  const triggerDoseReminder = useCallback(() => {
    const todaysPending = state.doseLogs
      .filter((d) => d.date === todayStr && d.status === 'pending')
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    const targetLog = todaysPending[0];
    const med = targetLog
      ? state.medications.find((m) => m.id === targetLog.medicationId)
      : state.medications[0];
    if (!med) return;

    const doseId = targetLog ? targetLog.id : `sim-${med.id}`;
    const scheduledTime = targetLog ? targetLog.scheduledTime : med.times[0] || '08:00';
    setActiveReminder({
      doseId,
      medName: med.name,
      doseText: med.dose,
      routineCue: med.routineCue,
      stage: 0,
    });

    logSimulatedEmail({
      triggerType: 'dose_reminder',
      targetRoles: ['caretaker', 'family'],
      subjectKey: 'emailReminderSubject',
      bodyKey: 'emailReminderBody',
      vars: {
        elder: state.elderly.honorificName || state.elderly.name,
        med: `${med.name} ${med.dose}`,
        time: scheduledTime,
        cue: med.routineCue,
      },
    });

    playGentleChime();
    if (state.accessibility.dementiaFriendlyMode && state.accessibility.customVoiceMessageDataUrl) {
      new Audio(state.accessibility.customVoiceMessageDataUrl).play().catch(() => {});
    }
    if (state.accessibility.voiceRemindersEnabled) {
      speakWarmly(
        formatTemplate(t.spokenReminderTemplate, {
          name: state.elderly.honorificName,
          med: med.name,
          dose: med.dose,
          cue: med.routineCue,
        }),
        state.language
      );
    }
  }, [
    logSimulatedEmail,
    state.doseLogs,
    state.medications,
    state.accessibility,
    state.elderly.honorificName,
    state.elderly.name,
    state.language,
    t.spokenReminderTemplate,
    todayStr,
  ]);

  const advanceEscalation = useCallback(() => {
    setActiveReminder((prev) => {
      if (!prev) return null;
      const nextStage = Math.min(3, prev.stage + 1) as 0 | 1 | 2 | 3;
      const medLabel = `${prev.medName} (${prev.doseText})`;
      const vars = { med: medLabel, name: state.elderly.honorificName };
      const emailVars = {
        med: medLabel,
        elder: state.elderly.honorificName || state.elderly.name,
      };
      if (nextStage === 1) {
        playGentleChime();
        if (state.accessibility.voiceRemindersEnabled) {
          speakWarmly(
            formatTemplate(t.spokenRepeatTemplate, {
              name: state.elderly.honorificName,
              med: prev.medName,
              dose: prev.doseText,
            }),
            state.language
          );
        }
      } else if (nextStage === 2) {
        dispatchAlertAndEmails(
          {
            type: 'escalation',
            severity: 'warning',
            title: formatTemplate(t.alertEscalationCaretakerTitle, vars),
            message: formatTemplate(t.alertEscalationCaretakerMsg, vars),
            titleKey: 'alertEscalationCaretakerTitle',
            messageKey: 'alertEscalationCaretakerMsg',
            vars,
            targetRoles: ['caretaker'],
          },
          formatTemplate(t.emailEscalationCaretakerSubject, emailVars),
          formatTemplate(t.emailEscalationCaretakerBody, { ...emailVars, recipient: '' }),
          {
            subjectKey: 'emailEscalationCaretakerSubject',
            bodyKey: 'emailEscalationCaretakerBody',
            vars: emailVars,
          }
        );
      } else if (nextStage === 3) {
        dispatchAlertAndEmails(
          {
            type: 'escalation',
            severity: 'critical',
            title: formatTemplate(t.alertEscalationFamilyTitle, vars),
            message: formatTemplate(t.alertEscalationFamilyMsg, vars),
            titleKey: 'alertEscalationFamilyTitle',
            messageKey: 'alertEscalationFamilyMsg',
            vars,
            targetRoles: ['family', 'caretaker'],
          },
          formatTemplate(t.emailEscalationFamilySubject, emailVars),
          formatTemplate(t.emailEscalationFamilyBody, { ...emailVars, recipient: '' }),
          {
            subjectKey: 'emailEscalationFamilySubject',
            bodyKey: 'emailEscalationFamilyBody',
            vars: emailVars,
          }
        );
      }
      return { ...prev, stage: nextStage };
    });
  }, [
    dispatchAlertAndEmails,
    state.accessibility.voiceRemindersEnabled,
    state.elderly,
    state.language,
    t.alertEscalationCaretakerMsg,
    t.alertEscalationCaretakerTitle,
    t.alertEscalationFamilyMsg,
    t.alertEscalationFamilyTitle,
    t.emailEscalationCaretakerBody,
    t.emailEscalationCaretakerSubject,
    t.emailEscalationFamilyBody,
    t.emailEscalationFamilySubject,
    t.spokenRepeatTemplate,
  ]);

  useEffect(() => {
    if (!activeReminder || activeReminder.stage >= 3) return;
    const timer = setTimeout(() => {
      advanceEscalation();
    }, 10 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [activeReminder, advanceEscalation]);

  useEffect(() => {
    if (!inactivityOpen) return;
    const timer = setTimeout(() => {
      setInactivityOpen(false);
      const vars = { name: state.elderly.honorificName };
      const emailVars = { elder: state.elderly.honorificName || state.elderly.name };
      dispatchAlertAndEmails(
        {
          type: 'inactivity',
          severity: 'critical',
          title: t.alertInactivityTitle,
          message: formatTemplate(t.alertInactivityMsg, vars),
          titleKey: 'alertInactivityTitle',
          messageKey: 'alertInactivityMsg',
          vars,
          targetRoles: ['caretaker', 'family'],
        },
        formatTemplate(t.emailInactivitySubject, emailVars),
        formatTemplate(t.emailInactivityBody, { ...emailVars, recipient: '' }),
        {
          subjectKey: 'emailInactivitySubject',
          bodyKey: 'emailInactivityBody',
          vars: emailVars,
        }
      );
    }, 30000);
    return () => clearTimeout(timer);
  }, [
    inactivityOpen,
    dispatchAlertAndEmails,
    state.elderly,
    t.alertInactivityMsg,
    t.alertInactivityTitle,
    t.emailInactivityBody,
    t.emailInactivitySubject,
  ]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setDemoNotice('');
        setDemoControlsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (demoControlsOpen) setDemoControlsOpen(false);
        if (confirmResetOpen) setConfirmResetOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [demoControlsOpen, confirmResetOpen]);

  const handleBrandTap = useCallback(() => {
    brandTapCountRef.current += 1;
    if (brandTapTimerRef.current) clearTimeout(brandTapTimerRef.current);
    if (brandTapCountRef.current >= 3) {
      brandTapCountRef.current = 0;
      setDemoNotice('');
      setDemoControlsOpen((prev) => !prev);
      return;
    }
    brandTapTimerRef.current = setTimeout(() => {
      brandTapCountRef.current = 0;
    }, 1200);
  }, []);

  if (!state.isSetupComplete) {
    return (
      <WelcomeSetup
        language={state.language}
        hasExistingCircle={state.isSetupComplete}
        existingPasscode={state.isSetupComplete ? state.passcode : '482915'}
        onSelectLanguage={setLanguage}
        onStartDemo={() => loadDemoMode(state.language)}
        onCompleteElderlySetup={completeFreshElderlySetup}
        onJoinWithPasscode={joinCircleWithPasscode}
        onForgotPasscode={requestPasscodeHelp}
      />
    );
  }

  const photoModalDose = photoVerifyDoseId
    ? state.doseLogs.find((d) => d.id === photoVerifyDoseId)
    : undefined;
  const photoModalMed = photoModalDose
    ? state.medications.find((m) => m.id === photoModalDose.medicationId) || null
    : null;

  const unreadAlertCount = state.alerts.filter((a) => !a.acknowledged).length;
  const rootClass = state.accessibility.highContrast ? 'high-contrast' : '';

  return (
    <div className={`min-h-screen overflow-x-hidden bg-[#FAF7F2] text-[#131B19] flex flex-col ${rootClass}`}>
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-[#DFD5C5] px-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-1.5 sm:gap-4">
        <div
          onClick={handleBrandTap}
          className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink select-none"
        >
          <span className="shrink-0">
            <SatiLogo size={32} />
          </span>
          <span className="font-display text-lg sm:text-2xl font-extrabold text-[#0D5652] truncate">
            {t.brandName}
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-base font-bold text-[#3E4C48]">
          {activeRole === 'elderly' && (
            <>
              <button
                type="button"
                onClick={() => setElderlyTab('today')}
                className={`whitespace-nowrap py-2 cursor-pointer transition-colors ${
                  elderlyTab === 'today' ? 'text-[#0D5652] underline underline-offset-8 decoration-2' : 'hover:text-[#131B19]'
                }`}
              >
                {t.tabToday}
              </button>
              <button
                type="button"
                onClick={() => setElderlyTab('progress')}
                className={`whitespace-nowrap py-2 cursor-pointer transition-colors ${
                  elderlyTab === 'progress' ? 'text-[#0D5652] underline underline-offset-8 decoration-2' : 'hover:text-[#131B19]'
                }`}
              >
                {t.tabProgress}
              </button>
              <button
                type="button"
                onClick={() => setElderlyTab('appointments')}
                className={`whitespace-nowrap py-2 cursor-pointer transition-colors ${
                  elderlyTab === 'appointments' ? 'text-[#0D5652] underline underline-offset-8 decoration-2' : 'hover:text-[#131B19]'
                }`}
              >
                {t.tabAppointments}
              </button>
              <button
                type="button"
                onClick={() => setElderlyTab('talk')}
                className={`whitespace-nowrap py-2 cursor-pointer transition-colors ${
                  elderlyTab === 'talk' ? 'text-[#0D5652] underline underline-offset-8 decoration-2' : 'hover:text-[#131B19]'
                }`}
              >
                {t.tabTalk}
              </button>
              <button
                type="button"
                onClick={() => setElderlyTab('settings')}
                className={`whitespace-nowrap py-2 cursor-pointer transition-colors ${
                  elderlyTab === 'settings' ? 'text-[#0D5652] underline underline-offset-8 decoration-2' : 'hover:text-[#131B19]'
                }`}
              >
                {t.tabSettings}
              </button>
            </>
          )}

          {activeRole === 'caretaker' && (
            <>
              <button
                type="button"
                onClick={() => setCaretakerTab('dashboard')}
                className={`whitespace-nowrap py-2 cursor-pointer transition-colors ${
                  caretakerTab === 'dashboard' ? 'text-[#0D5652] underline underline-offset-8 decoration-2' : 'hover:text-[#131B19]'
                }`}
              >
                {t.tabDashboard}
              </button>
              <button
                type="button"
                onClick={() => setCaretakerTab('medications')}
                className={`whitespace-nowrap py-2 cursor-pointer transition-colors ${
                  caretakerTab === 'medications' ? 'text-[#0D5652] underline underline-offset-8 decoration-2' : 'hover:text-[#131B19]'
                }`}
              >
                {t.tabMedications}
              </button>
              <button
                type="button"
                onClick={() => setCaretakerTab('alerts')}
                className={`whitespace-nowrap py-2 cursor-pointer transition-colors ${
                  caretakerTab === 'alerts' ? 'text-[#0D5652] underline underline-offset-8 decoration-2' : 'hover:text-[#131B19]'
                }`}
              >
                {t.tabAlerts} ({state.alerts.filter((a) => !a.acknowledged).length})
              </button>
              <button
                type="button"
                onClick={() => setCaretakerTab('emails')}
                className={`whitespace-nowrap py-2 cursor-pointer transition-colors ${
                  caretakerTab === 'emails' ? 'text-[#0D5652] underline underline-offset-8 decoration-2' : 'hover:text-[#131B19]'
                }`}
              >
                {t.viewEmailLog}
              </button>
            </>
          )}

          {activeRole === 'family' && (
            <>
              <button
                type="button"
                onClick={() => setFamilyTab('overview')}
                className={`whitespace-nowrap py-2 cursor-pointer transition-colors ${
                  familyTab === 'overview' ? 'text-[#0D5652] underline underline-offset-8 decoration-2' : 'hover:text-[#131B19]'
                }`}
              >
                {t.tabOverview}
              </button>
              <button
                type="button"
                onClick={() => setFamilyTab('alerts')}
                className={`whitespace-nowrap py-2 cursor-pointer transition-colors ${
                  familyTab === 'alerts' ? 'text-[#0D5652] underline underline-offset-8 decoration-2' : 'hover:text-[#131B19]'
                }`}
              >
                {t.tabAlerts} ({unreadAlertCount})
              </button>
              <button
                type="button"
                onClick={() => setFamilyTab('emails')}
                className={`whitespace-nowrap py-2 cursor-pointer transition-colors ${
                  familyTab === 'emails' ? 'text-[#0D5652] underline underline-offset-8 decoration-2' : 'hover:text-[#131B19]'
                }`}
              >
                {t.viewEmailLog}
              </button>
            </>
          )}
        </nav>

        {/* Controls: Language, Role Switcher, Emergency, Demo Gear, Reset */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <select
            aria-label={t.chooseLanguage}
            value={state.language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="h-9 sm:h-11 max-w-[70px] sm:max-w-none px-1 sm:px-2.5 rounded-xl border border-[#DFD5C5] bg-[#FAF7F2] text-xs sm:text-sm font-bold cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName}
              </option>
            ))}
          </select>

          <select
            aria-label={t.switchRole}
            value={activeRole}
            onChange={(e) => switchRoleView(e.target.value as UserRole)}
            className="h-9 sm:h-11 max-w-[80px] sm:max-w-none px-1 sm:px-2.5 rounded-xl border border-[#DFD5C5] bg-[#FAF7F2] text-xs sm:text-sm font-bold cursor-pointer"
          >
            <option value="elderly">
              {t.roleElderShort} ({state.elderly.honorificName})
            </option>
            <option value="caretaker">{t.roleCaretakerShort}</option>
            <option value="family">{t.roleFamilyShort}</option>
          </select>

          <button
            type="button"
            onClick={() => triggerEmergencyFlow(t.tabEmergency)}
            aria-label={t.tabEmergency}
            className="h-9 sm:h-11 px-2 sm:px-3.5 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors"
          >
            <AlertOctagon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="hidden sm:inline">{t.tabEmergency}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDemoNotice('');
              setDemoControlsOpen(true);
            }}
            title={t.demoControlsTitle}
            aria-label={t.demoControlsTitle}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl border border-[#DFD5C5] hover:bg-[#F2ECE1] flex items-center justify-center text-[#3E4C48] hover:text-[#0D5652] cursor-pointer transition-colors"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            title={t.logoutReset}
            aria-label={t.logoutReset}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl border border-[#DFD5C5] hover:bg-[#F2ECE1] flex items-center justify-center text-[#3E4C48] hover:text-[#131B19] cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* Active Gentle Dose Reminder & Escalation Banner */}
      {activeReminder && (
        <div className="bg-[#0D5652] text-white px-4 sm:px-6 py-4 border-b border-teal-950">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Clock className="w-7 h-7 text-amber-300 shrink-0" />
              <div>
                <div className="font-display font-bold text-xl">
                  {t.reminderBannerTitle}: {activeReminder.medName} ({activeReminder.doseText})
                </div>
                <div className="text-base text-teal-100">
                  {activeReminder.routineCue} ·{' '}
                  {activeReminder.stage === 0 && t.reminderStage0}
                  {activeReminder.stage === 1 && t.reminderStage1}
                  {activeReminder.stage === 2 && t.reminderStage2}
                  {activeReminder.stage === 3 && t.reminderStage3}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {activeReminder.stage < 3 && (
                <button
                  type="button"
                  onClick={advanceEscalation}
                  className="min-h-[48px] px-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <FastForward className="w-4 h-4" />
                  <span>{t.fastForward10m}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const snapshot = activeReminder;
                  stopSpeaking();
                  if (snoozeTimerRef.current) clearTimeout(snoozeTimerRef.current);
                  setActiveReminder(null);
                  snoozeTimerRef.current = setTimeout(() => {
                    setActiveReminder(snapshot);
                  }, 10 * 60 * 1000);
                }}
                className="min-h-[48px] px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>{t.snoozeBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (snoozeTimerRef.current) clearTimeout(snoozeTimerRef.current);
                  const confirmedMsg = formatTemplate(t.doseConfirmedSpoken, {
                    name: state.elderly.honorificName,
                    med: activeReminder.medName,
                  });
                  if (!activeReminder.doseId.startsWith('sim-')) {
                    const res = confirmDoseTaken(activeReminder.doseId);
                    if (!res.ok && res.blockedReason === 'double_dose') {
                      const msg = formatTemplate(t.doubleDoseBlockedMsg, {
                        med: activeReminder.medName,
                        lastTime: res.lastTakenTime || '',
                        nextTime: res.nextDueTime || '',
                      });
                      setExternalDoubleDoseSignal({ id: Date.now(), message: msg });
                      if (state.accessibility.voiceRemindersEnabled) {
                        speakWarmly(msg, state.language);
                      }
                      setActiveReminder(null);
                      return;
                    }
                    setExternalConfirmedSignal({
                      id: Date.now(),
                      doseId: activeReminder.doseId,
                      medName: activeReminder.medName,
                      message: confirmedMsg,
                    });
                  }
                  if (state.accessibility.voiceRemindersEnabled) {
                    speakWarmly(confirmedMsg, state.language);
                  }
                  setActiveReminder(null);
                }}
                className="min-h-[48px] px-5 rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white text-base font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{t.iHaveTakenIt}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  if (snoozeTimerRef.current) clearTimeout(snoozeTimerRef.current);
                  setActiveReminder(null);
                }}
                aria-label={t.cancelBtn}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Canvas */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9 pb-32 lg:pb-16">
        {activeRole === 'elderly' && (
          <ElderlyView
            state={state}
            activeTab={elderlyTab}
            onChangeTab={setElderlyTab}
            onOpenMedicalId={() => setMedicalIdOpen(true)}
            onConfirmDose={confirmDoseTaken}
            onUndoDose={undoDoseTaken}
            onOpenPhotoVerify={(doseId) => setPhotoVerifyDoseId(doseId)}
            onOpenCalendar={() => setCalendarOpen(true)}
            onOpenAddAppt={() => setApptModalOpen(true)}
            onAddDoctorNote={addDoctorNote}
            onRecordMood={recordMood}
            onUpdatePrivacy={updatePrivacy}
            onUpdateAccessibility={updateAccessibility}
            onUpdateElderlyProfile={updateElderlyProfile}
            onAppendChatMessage={appendChatMessage}
            onTriggerEmergency={triggerEmergencyFlow}
            onAlertCaretaker={triggerCaretakerAlert}
            onSendFamilyMessage={sendVoiceFamilyMessage}
            onTestReminder={triggerDoseReminder}
            onTestInactivity={() => setInactivityOpen(true)}
            externalDoubleDoseSignal={externalDoubleDoseSignal}
            externalConfirmedSignal={externalConfirmedSignal}
          />
        )}

        {activeRole === 'caretaker' && (
          <CaretakerView
            state={state}
            activeTab={caretakerTab}
            onChangeTab={setCaretakerTab}
            onVerifyDose={(doseId, by, note) => verifyDose(doseId, by, note)}
            onMarkMissed={markDoseMissed}
            onOpenAddMed={(withScan = false) => {
              setEditingMed(null);
              setMedModalScan(withScan);
              setMedModalOpen(true);
            }}
            onOpenEditMed={(med) => {
              setEditingMed(med);
              setMedModalScan(false);
              setMedModalOpen(true);
            }}
            onDeleteMed={deleteMedication}
            onOpenAddAppt={() => setApptModalOpen(true)}
            onDeleteAppt={deleteAppointment}
            onDeleteDoctorNote={deleteDoctorNote}
            onOpenCalendar={() => setCalendarOpen(true)}
            onAcknowledgeAlert={acknowledgeAlert}
            onTestReminder={triggerDoseReminder}
          />
        )}

        {activeRole === 'family' && (
          <FamilyView
            state={state}
            activeTab={familyTab}
            onOpenCalendar={() => setCalendarOpen(true)}
            onOpenAddMed={() => {
              setEditingMed(null);
              setMedModalScan(false);
              setMedModalOpen(true);
            }}
            onOpenAddAppt={() => setApptModalOpen(true)}
            onUpdateAccessibility={updateAccessibility}
            onAcknowledgeAlert={acknowledgeAlert}
          />
        )}
      </main>

      {/* Floating Compact Mic Orb for Elderly View when not on Talk tab */}
      {activeRole === 'elderly' && elderlyTab !== 'talk' && (
        <div className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-30">
          <SatiMicOrb
            compact
            isListening={false}
            isSpeaking={false}
            isThinking={false}
            onClick={() => setElderlyTab('talk')}
            label={t.tabTalk}
          />
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[66px] bg-white/95 backdrop-blur-md border-t border-[#DFD5C5] px-1">
        {activeRole === 'elderly' && (
          <div className="grid grid-cols-5 h-full items-center">
            <button
              type="button"
              onClick={() => setElderlyTab('today')}
              className={`flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
                elderlyTab === 'today' ? 'text-[#0D5652] font-extrabold' : 'text-[#3E4C48] font-medium'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-[11px] mt-1 truncate max-w-full px-1">{t.tabToday}</span>
            </button>
            <button
              type="button"
              onClick={() => setElderlyTab('progress')}
              className={`flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
                elderlyTab === 'progress' ? 'text-[#0D5652] font-extrabold' : 'text-[#3E4C48] font-medium'
              }`}
            >
              <Award className="w-6 h-6" />
              <span className="text-[11px] mt-1 truncate max-w-full px-1">{t.tabProgress}</span>
            </button>
            <button
              type="button"
              onClick={() => setElderlyTab('appointments')}
              className={`flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
                elderlyTab === 'appointments' ? 'text-[#0D5652] font-extrabold' : 'text-[#3E4C48] font-medium'
              }`}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-[11px] mt-1 truncate max-w-full px-1">{t.tabAppointments}</span>
            </button>
            <button
              type="button"
              onClick={() => setElderlyTab('talk')}
              className={`flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
                elderlyTab === 'talk' ? 'text-[#0D5652] font-extrabold' : 'text-[#3E4C48] font-medium'
              }`}
            >
              <MessageCircleHeart className="w-6 h-6" />
              <span className="text-[11px] mt-1 truncate max-w-full px-1">{t.tabTalk}</span>
            </button>
            <button
              type="button"
              onClick={() => triggerEmergencyFlow(t.tabEmergency)}
              className="flex flex-col items-center justify-center h-full text-[#B91C1C] font-extrabold cursor-pointer"
            >
              <AlertOctagon className="w-6 h-6" />
              <span className="text-[11px] mt-1 truncate max-w-full px-1">{t.tabEmergency}</span>
            </button>
          </div>
        )}

        {activeRole === 'caretaker' && (
          <div className="grid grid-cols-4 h-full items-center">
            <button
              type="button"
              onClick={() => setCaretakerTab('dashboard')}
              className={`flex flex-col items-center justify-center h-full min-w-0 cursor-pointer ${
                caretakerTab === 'dashboard' ? 'text-[#0D5652] font-extrabold' : 'text-[#3E4C48]'
              }`}
            >
              <ClipboardList className="w-6 h-6" />
              <span className="text-[11px] mt-1 truncate max-w-full px-1">{t.tabDashboard}</span>
            </button>
            <button
              type="button"
              onClick={() => setCaretakerTab('medications')}
              className={`flex flex-col items-center justify-center h-full min-w-0 cursor-pointer ${
                caretakerTab === 'medications' ? 'text-[#0D5652] font-extrabold' : 'text-[#3E4C48]'
              }`}
            >
              <Pill className="w-6 h-6" />
              <span className="text-[11px] mt-1 truncate max-w-full px-1">{t.tabMedications}</span>
            </button>
            <button
              type="button"
              onClick={() => setCaretakerTab('alerts')}
              className={`relative flex flex-col items-center justify-center h-full min-w-0 cursor-pointer ${
                caretakerTab === 'alerts' ? 'text-[#0D5652] font-extrabold' : 'text-[#3E4C48]'
              }`}
            >
              <Bell className="w-6 h-6" />
              {unreadAlertCount > 0 && (
                <span className="absolute top-1.5 right-3 sm:right-6 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B91C1C] text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums">
                  {unreadAlertCount}
                </span>
              )}
              <span className="text-[11px] mt-1 truncate max-w-full px-1">{t.tabAlerts}</span>
            </button>
            <button
              type="button"
              onClick={() => setCaretakerTab('emails')}
              className={`flex flex-col items-center justify-center h-full min-w-0 cursor-pointer ${
                caretakerTab === 'emails' ? 'text-[#0D5652] font-extrabold' : 'text-[#3E4C48]'
              }`}
            >
              <Mail className="w-6 h-6" />
              <span className="text-[11px] mt-1 truncate max-w-full px-1">{t.viewEmailLog}</span>
            </button>
          </div>
        )}

        {activeRole === 'family' && (
          <div className="grid grid-cols-3 h-full items-center">
            <button
              type="button"
              onClick={() => setFamilyTab('overview')}
              className={`flex flex-col items-center justify-center h-full min-w-0 cursor-pointer ${
                familyTab === 'overview' ? 'text-[#0D5652] font-extrabold' : 'text-[#3E4C48]'
              }`}
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-[11px] mt-1 truncate max-w-full px-1">{t.tabOverview}</span>
            </button>
            <button
              type="button"
              onClick={() => setFamilyTab('alerts')}
              className={`relative flex flex-col items-center justify-center h-full min-w-0 cursor-pointer ${
                familyTab === 'alerts' ? 'text-[#0D5652] font-extrabold' : 'text-[#3E4C48]'
              }`}
            >
              <HeartHandshake className="w-6 h-6" />
              {unreadAlertCount > 0 && (
                <span className="absolute top-1.5 right-4 sm:right-8 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B91C1C] text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums">
                  {unreadAlertCount}
                </span>
              )}
              <span className="text-[11px] mt-1 truncate max-w-full px-1">{t.tabAlerts}</span>
            </button>
            <button
              type="button"
              onClick={() => setFamilyTab('emails')}
              className={`flex flex-col items-center justify-center h-full min-w-0 cursor-pointer ${
                familyTab === 'emails' ? 'text-[#0D5652] font-extrabold' : 'text-[#3E4C48]'
              }`}
            >
              <Users className="w-6 h-6" />
              <span className="text-[11px] mt-1 truncate max-w-full px-1">{t.viewEmailLog}</span>
            </button>
          </div>
        )}
      </nav>

      {/* Modals & Overlays */}
      <CalendarModal
        isOpen={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        language={state.language}
        medications={state.medications}
        doseLogs={state.doseLogs}
        appointments={state.appointments}
      />

      <MedicationEditorModal
        isOpen={medModalOpen}
        onClose={() => setMedModalOpen(false)}
        language={state.language}
        existingMedications={state.medications}
        allergies={state.elderly.allergies}
        conditions={state.elderly.conditions}
        initialMed={editingMed}
        openWithScan={medModalScan}
        onSave={(medData, existingId) => {
          if (existingId) {
            updateMedication({ ...medData, id: existingId });
          } else {
            addMedication(medData);
          }
        }}
      />

      <PhotoVerifyModal
        isOpen={Boolean(photoVerifyDoseId)}
        onClose={() => setPhotoVerifyDoseId(null)}
        language={state.language}
        medicine={photoModalMed}
        onVerified={(note) => {
          if (photoVerifyDoseId) {
            verifyDose(photoVerifyDoseId, 'photo', note);
          }
        }}
      />

      <AppointmentModal
        isOpen={apptModalOpen}
        onClose={() => setApptModalOpen(false)}
        language={state.language}
        onSave={addAppointment}
      />

      <InactivityCheckModal
        isOpen={inactivityOpen}
        language={state.language}
        honorificName={state.elderly.honorificName}
        onImOkay={() => {
          touchActivity();
          setInactivityOpen(false);
        }}
        onNeedHelp={() => triggerEmergencyFlow(t.iNeedHelpBtn)}
      />

      <EmergencyOverlay
        isOpen={emergencyOpen}
        onClose={() => {
          stopSpeaking();
          setEmergencyOpen(false);
        }}
        language={state.language}
        elderly={state.elderly}
        medications={state.medications}
        reason={emergencyReason}
      />

      <MedicalIdModal
        isOpen={medicalIdOpen}
        onClose={() => setMedicalIdOpen(false)}
        onGoToEdit={() => {
          switchRoleView('elderly');
          setElderlyTab('settings');
        }}
        language={state.language}
        elderly={state.elderly}
        medications={state.medications}
        voiceEnabled={state.accessibility.voiceRemindersEnabled}
      />

      <DemoControlsModal
        isOpen={demoControlsOpen}
        onClose={() => {
          setDemoNotice('');
          setDemoControlsOpen(false);
        }}
        language={state.language}
        activeRole={activeRole}
        notice={demoNotice}
        onSwitchRole={switchRoleView}
        onTriggerMissedDose={() => {
          const ok = simulateMissedDose();
          if (!ok) {
            setDemoNotice(t.demoAddMedFirstNotice);
            return;
          }
          setDemoNotice('');
          setDemoControlsOpen(false);
          if (activeRole === 'elderly') {
            switchRoleView('caretaker');
            setCaretakerTab('dashboard');
          }
        }}
        onTriggerDoubleDose={() => {
          const attempt = simulateDoubleDoseAttempt();
          if (!attempt) {
            setDemoNotice(t.demoAddMedFirstNotice);
            return;
          }
          setDemoNotice('');
          setDemoControlsOpen(false);
          switchRoleView('elderly');
          setElderlyTab('today');
          const msg = formatTemplate(t.doubleDoseBlockedMsg, {
            med: attempt.medName,
            lastTime: attempt.lastTime,
            nextTime: attempt.nextDueTime,
          });
          setExternalDoubleDoseSignal({ id: Date.now(), message: msg });
          if (state.accessibility.voiceRemindersEnabled) {
            speakWarmly(msg, state.language);
          }
        }}
        onTriggerSuspiciousPattern={() => {
          const ok = simulateSuspiciousPattern();
          if (!ok) {
            setDemoNotice(t.demoAddMedFirstNotice);
            return;
          }
          setDemoNotice('');
          setDemoControlsOpen(false);
          if (activeRole === 'elderly') {
            switchRoleView('caretaker');
            setCaretakerTab('alerts');
          }
        }}
        onTriggerEmergency={() => {
          setDemoNotice('');
          setDemoControlsOpen(false);
          triggerEmergencyFlow(t.demoEmergencyReason);
        }}
      />

      {confirmResetOpen && (
        <div
          onClick={() => setConfirmResetOpen(false)}
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.confirmResetTitle}
            onClick={(e) => e.stopPropagation()}
            className="sati-card bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-5 shadow-2xl"
          >
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-[#131B19]">
                {t.confirmResetTitle}
              </h2>
              <p className="text-base text-[#3E4C48] leading-relaxed">{t.confirmResetDesc}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="flex-1 min-h-[52px] px-5 rounded-2xl border-2 border-[#DFD5C5] bg-white font-bold text-base cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  if (snoozeTimerRef.current) {
                    clearTimeout(snoozeTimerRef.current);
                    snoozeTimerRef.current = null;
                  }
                  if (brandTapTimerRef.current) {
                    clearTimeout(brandTapTimerRef.current);
                    brandTapTimerRef.current = null;
                  }
                  setConfirmResetOpen(false);
                  setActiveReminder(null);
                  setEmergencyOpen(false);
                  setEmergencyReason('');
                  setInactivityOpen(false);
                  setCalendarOpen(false);
                  setMedicalIdOpen(false);
                  setMedModalOpen(false);
                  setEditingMed(null);
                  setApptModalOpen(false);
                  setPhotoVerifyDoseId(null);
                  setDemoControlsOpen(false);
                  setDemoNotice('');
                  setExternalDoubleDoseSignal(null);
                  setExternalConfirmedSignal(null);
                  setElderlyTab('today');
                  setCaretakerTab('dashboard');
                  setFamilyTab('overview');
                  resetToWelcome();
                }}
                className="flex-1 min-h-[52px] px-5 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white font-bold text-base cursor-pointer transition-colors"
              >
                {t.confirmResetBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
