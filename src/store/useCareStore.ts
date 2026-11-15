import { useCallback, useEffect, useState } from 'react';
import { createDemoState, createEmptyState, generatePasscode, getLocalDateStr } from '../data/seedData';
import { formatTemplate, getLocalizedHonorificName, getT, TranslationDict } from '../i18n/translations';
import {
  AccessibilitySettings,
  Appointment,
  CareAlert,
  CareCircleState,
  CareMember,
  DoctorNote,
  DoseLog,
  ElderlyProfile,
  EmailLogEntry,
  LanguageCode,
  Medication,
  MoodValue,
  PrivacySettings,
  UserRole,
} from '../types';

export function resolveAlertText(alert: CareAlert, lang: LanguageCode): { title: string; message: string } {
  const t = getT(lang);
  const vars = alert.vars || {};
  const titleTemplate = alert.titleKey ? (t[alert.titleKey as keyof TranslationDict] as string) : '';
  const msgTemplate = alert.messageKey ? (t[alert.messageKey as keyof TranslationDict] as string) : '';
  return {
    title: titleTemplate ? formatTemplate(titleTemplate, vars) : alert.title,
    message: msgTemplate ? formatTemplate(msgTemplate, vars) : alert.message,
  };
}

export function resolveEmailText(
  email: EmailLogEntry,
  lang: LanguageCode
): { subject: string; bodyPreview: string } {
  const t = getT(lang);
  const vars = email.vars || {};
  const subjectTemplate = email.subjectKey
    ? (t[email.subjectKey as keyof TranslationDict] as string)
    : '';
  const bodyTemplate = email.bodyKey
    ? (t[email.bodyKey as keyof TranslationDict] as string)
    : '';
  return {
    subject: subjectTemplate ? formatTemplate(subjectTemplate, vars) : email.subject,
    bodyPreview: bodyTemplate ? formatTemplate(bodyTemplate, vars) : email.bodyPreview,
  };
}

const STORAGE_KEY = 'sati_care_circle_v1';
const PENDING_PASSCODE_HELP_KEY = 'sati_pending_passcode_help_v1';

interface PendingPasscodeHelp {
  requesterName: string;
  requesterEmail: string;
  role: 'caretaker' | 'family';
  requestedAt: string;
}

function readPendingPasscodeHelps(): PendingPasscodeHelp[] {
  try {
    const raw = localStorage.getItem(PENDING_PASSCODE_HELP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // Ignore storage read issues
  }
  return [];
}

function mergePendingPasscodeHelps(circle: CareCircleState): CareCircleState {
  const pending = readPendingPasscodeHelps();
  if (pending.length === 0) return circle;
  try {
    localStorage.removeItem(PENDING_PASSCODE_HELP_KEY);
  } catch {
    // Ignore removal error
  }
  const t = getT(circle.language);
  const elderName = circle.elderly.honorificName || circle.elderly.name || 'Elder';
  const recipients = circle.members.filter((m) => m.role === 'caretaker' || m.role === 'family');
  const addedAlerts: CareAlert[] = [];
  const addedEmails: EmailLogEntry[] = [];

  pending.forEach((req, idx) => {
    const roleLabel = req.role === 'caretaker' ? t.roleCaretakerShort : t.roleFamilyShort;
    const vars = {
      name: req.requesterName || roleLabel,
      role: roleLabel,
      email: req.requesterEmail || 'member@example.com',
      elder: elderName,
    };
    addedAlerts.push({
      id: `alert-passcode-help-${Date.now()}-${idx}`,
      type: 'passcode_help',
      severity: 'info',
      title: formatTemplate(t.passcodeHelpAlertTitle, vars),
      message: formatTemplate(t.passcodeHelpAlertMsg, vars),
      titleKey: 'passcodeHelpAlertTitle',
      messageKey: 'passcodeHelpAlertMsg',
      vars,
      createdAt: req.requestedAt,
      acknowledged: false,
      targetRoles: ['caretaker', 'family'],
    });
    recipients.forEach((r) => {
      const emailVars = { ...vars, recipient: r.name };
      addedEmails.push({
        id: `email-passcode-help-${Date.now()}-${idx}-${r.id}`,
        toEmail: r.email,
        toName: r.name,
        recipientRole: r.role,
        subject: formatTemplate(t.passcodeHelpEmailSubject, emailVars),
        bodyPreview: formatTemplate(t.passcodeHelpEmailBody, emailVars),
        subjectKey: 'passcodeHelpEmailSubject',
        bodyKey: 'passcodeHelpEmailBody',
        vars: emailVars,
        sentAt: req.requestedAt,
        triggerType: 'passcode_help',
      });
    });
  });

  return {
    ...circle,
    alerts: [...addedAlerts, ...circle.alerts],
    emailLogs: [...addedEmails, ...circle.emailLogs],
  };
}

function loadInitialState(): CareCircleState {
  const base = createEmptyState('en');
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CareCircleState>;
      if (parsed && typeof parsed === 'object' && parsed.elderly) {
        return {
          ...base,
          ...parsed,
          elderly: { ...base.elderly, ...parsed.elderly },
          privacy: { ...base.privacy, ...(parsed.privacy || {}) },
          accessibility: { ...base.accessibility, ...(parsed.accessibility || {}) },
          members: Array.isArray(parsed.members) ? parsed.members : [],
          medications: Array.isArray(parsed.medications) ? parsed.medications : [],
          doseLogs: Array.isArray(parsed.doseLogs) ? parsed.doseLogs : [],
          appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
          alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
          emailLogs: Array.isArray(parsed.emailLogs) ? parsed.emailLogs : [],
          moodLogs: Array.isArray(parsed.moodLogs) ? parsed.moodLogs : [],
          doctorNotes: Array.isArray(parsed.doctorNotes) ? parsed.doctorNotes : [],
          chatHistory: Array.isArray(parsed.chatHistory) ? parsed.chatHistory : [],
        };
      }
    }
  } catch {
    // Ignore corrupt localStorage
  }
  return base;
}

export interface FamilyWellbeingStatus {
  tone: 'green' | 'amber' | 'red';
  title: string;
  line: string;
}

export function hasTwoConsecutiveRecentMissedDoses(
  doseLogs: DoseLog[],
  todayStr: string
): DoseLog[] {
  const yesterdayStr = getLocalDateStr(-1);
  const recent = doseLogs
    .filter((d) => d.date === yesterdayStr || d.date === todayStr)
    .sort((a, b) => `${a.date}T${a.scheduledTime}`.localeCompare(`${b.date}T${b.scheduledTime}`));

  for (let i = 1; i < recent.length; i++) {
    if (recent[i - 1].status === 'missed' && recent[i].status === 'missed') {
      return [recent[i - 1], recent[i]];
    }
  }
  return [];
}

export function computeFamilyWellbeingStatus(
  state: CareCircleState,
  now: Date = new Date()
): FamilyWellbeingStatus {
  const t = getT(state.language);
  const todayStr = getLocalDateStr(0);
  const firstName = state.elderly.name.trim().split(/\s+/)[0] || state.elderly.honorificName || 'Elder';
  const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const consecutiveMissed = hasTwoConsecutiveRecentMissedDoses(state.doseLogs, todayStr);
  if (consecutiveMissed.length >= 2) {
    return {
      tone: 'red',
      title: t.escalatedConsecutiveTitle,
      line: formatTemplate(t.escalatedConsecutiveMsg, { name: firstName }),
    };
  }

  const activeMedIds = new Set(state.medications.map((m) => m.id));
  const todaysDoses = state.doseLogs
    .filter((d) => d.date === todayStr && activeMedIds.has(d.medicationId))
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const lateOrMissedToday = todaysDoses.filter((d) => {
    if (d.status === 'missed') return true;
    if (d.status === 'pending' && d.scheduledTime < nowHHMM) {
      const [sh, sm] = d.scheduledTime.split(':').map(Number);
      if (!Number.isFinite(sh) || !Number.isFinite(sm)) return false;
      const schedMins = sh * 60 + sm;
      const nowMins = now.getHours() * 60 + now.getMinutes();
      return nowMins - schedMins > 15;
    }
    return false;
  });

  if (lateOrMissedToday.length >= 2) {
    return {
      tone: 'red',
      title: t.escalatedConsecutiveTitle,
      line: formatTemplate(t.escalatedConsecutiveMsg, { name: firstName }),
    };
  }

  if (lateOrMissedToday.length === 1) {
    const lateDose = lateOrMissedToday[0];
    const med = state.medications.find((m) => m.id === lateDose.medicationId);
    const medLabel = med ? `${med.name} (${lateDose.scheduledTime})` : lateDose.scheduledTime;
    return {
      tone: 'amber',
      title: t.oneDoseLateTitle,
      line: formatTemplate(t.oneDoseLateMsg, { name: firstName, med: medLabel }),
    };
  }

  const morningDoses = todaysDoses.filter((d) => d.scheduledTime < '12:00');
  const allMorningDone =
    morningDoses.length > 0 &&
    morningDoses.every((d) => d.status === 'verified_taken' || d.status === 'said_taken');

  const dueSoFar = todaysDoses.filter((d) => d.scheduledTime <= nowHHMM);
  if (todaysDoses.length === 0) {
    return {
      tone: 'green',
      title: t.allIsWellTitle,
      line: formatTemplate(t.allIsWellNoDosesYet, { name: firstName }),
    };
  }

  if (allMorningDone && (dueSoFar.length === morningDoses.length || now.getHours() < 14)) {
    return {
      tone: 'green',
      title: t.allIsWellTitle,
      line: formatTemplate(t.allIsWellMorningDone, { name: firstName }),
    };
  }

  return {
    tone: 'green',
    title: t.allIsWellTitle,
    line: formatTemplate(t.allIsWellSoFarDone, { name: firstName }),
  };
}

export interface ConfirmDoseResult {
  ok: boolean;
  blockedReason?: 'double_dose';
  lastTakenTime?: string;
  nextDueTime?: string;
  suspiciousFlag?: string;
}

export function useCareStore() {
  const [state, setState] = useState<CareCircleState>(loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota issues
    }
  }, [state]);

  // Ensure today's scheduled dose logs exist for all active medications
  useEffect(() => {
    if (!state.isSetupComplete) return;
    const today = getLocalDateStr(0);
    setState((prev) => {
      let changed = false;
      const nextLogs = [...prev.doseLogs];
      for (const med of prev.medications) {
        if (med.startDate && med.startDate > today) continue;
        if (med.endDate && med.endDate < today) continue;
        for (const time of med.times) {
          const exists = nextLogs.some(
            (l) => l.medicationId === med.id && l.date === today && l.scheduledTime === time
          );
          if (!exists) {
            changed = true;
            nextLogs.push({
              id: `dose-${today}-${med.id}-${time}`,
              medicationId: med.id,
              date: today,
              scheduledTime: time,
              status: 'pending',
            });
          }
        }
      }
      return changed ? { ...prev, doseLogs: nextLogs } : prev;
    });
  }, [state.isSetupComplete, state.medications]);

  const activeMember: CareMember | undefined =
    state.members.find((m) => m.id === state.activeUserId) || state.members[0];

  const activeRole: UserRole = activeMember?.role || 'elderly';

  const setLanguage = useCallback((language: LanguageCode) => {
    setState((prev) => {
      const prevHonorific = prev.elderly.honorificName;
      const nextHonorific = prev.elderly.name
        ? getLocalizedHonorificName(language, prev.elderly.name)
        : prev.elderly.honorificName;
      const t = getT(language);
      const syncVars = (vars?: Record<string, string | number>) => {
        if (!vars) return vars;
        const next = { ...vars };
        if (next.elder === prevHonorific) next.elder = nextHonorific;
        if (next.name === prevHonorific) next.name = nextHonorific;
        return next;
      };
      return {
        ...prev,
        language,
        elderly: {
          ...prev.elderly,
          honorificName: nextHonorific,
        },
        alerts: prev.alerts.map((a) => (a.vars ? { ...a, vars: syncVars(a.vars) } : a)),
        emailLogs: prev.emailLogs.map((e) => (e.vars ? { ...e, vars: syncVars(e.vars) } : e)),
        chatHistory: prev.chatHistory.map((msg) =>
          msg.id === 'chat-welcome'
            ? { ...msg, text: formatTemplate(t.initialChatWelcome, { name: nextHonorific }) }
            : msg
        ),
      };
    });
  }, []);

  const loadDemoMode = useCallback((lang?: LanguageCode) => {
    setState((prev) => mergePendingPasscodeHelps(createDemoState(lang || prev.language)));
  }, []);

  const resetToWelcome = useCallback(() => {
    setState((prev) => createEmptyState(prev.language));
  }, []);

  const completeFreshElderlySetup = useCallback(
    (payload: {
      name: string;
      email: string;
      age: number;
      conditions: string[];
      allergies: string[];
      language: LanguageCode;
    }) => {
      const passcode = generatePasscode();
      const memberId = `user-${Date.now()}`;
      const honorificName = getLocalizedHonorificName(payload.language, payload.name);
      const t = getT(payload.language);
      setState({
        ...createEmptyState(payload.language),
        isSetupComplete: true,
        isDemoMode: false,
        passcode,
        language: payload.language,
        activeUserId: memberId,
        elderly: {
          name: payload.name.trim(),
          honorificName,
          age: payload.age || 70,
          conditions: payload.conditions,
          allergies: payload.allergies,
          emergencyPhone: '108',
          locationLabel: 'Home Address (Live GPS Ready)',
        },
        members: [
          {
            id: memberId,
            name: payload.name.trim(),
            email: payload.email.trim(),
            role: 'elderly',
            joinedAt: getLocalDateStr(0),
          },
        ],
        chatHistory: [
          {
            id: 'chat-welcome',
            role: 'assistant',
            text: formatTemplate(t.initialChatWelcome, { name: honorificName }),
            timestamp: new Date().toISOString(),
            triageLevel: 'NONE',
          },
        ],
      });
    },
    []
  );

  const joinCircleWithPasscode = useCallback(
    (payload: {
      name: string;
      email: string;
      role: 'caretaker' | 'family';
      passcode: string;
      relation?: string;
    }): { ok: boolean; error?: string } => {
      const cleanCode = payload.passcode.trim();
      const tCur = getT(state.language);
      const defaultRelation =
        payload.role === 'caretaker' ? tCur.roleCaretakerShort : tCur.roleFamilyShort;
      // If user already has an elderly profile matching passcode OR if fresh setup joins demo passcode 482915
      if (state.isSetupComplete && cleanCode === state.passcode) {
        const newId = `user-${Date.now()}`;
        setState((prev) => ({
          ...prev,
          activeUserId: newId,
          members: [
            ...prev.members,
            {
              id: newId,
              name: payload.name.trim(),
              email: payload.email.trim(),
              role: payload.role,
              relation: payload.relation || defaultRelation,
              joinedAt: getLocalDateStr(0),
            },
          ],
        }));
        return { ok: true };
      }

      if (!state.isSetupComplete && cleanCode === '482915') {
        const demo = mergePendingPasscodeHelps(createDemoState(state.language));
        const newId = `user-${Date.now()}`;
        setState({
          ...demo,
          activeUserId: newId,
          members: [
            ...demo.members,
            {
              id: newId,
              name: payload.name.trim(),
              email: payload.email.trim(),
              role: payload.role,
              relation: payload.relation || defaultRelation,
              joinedAt: getLocalDateStr(0),
            },
          ],
        });
        return { ok: true };
      }

      return {
        ok: false,
        error:
          state.language === 'hi'
            ? state.isSetupComplete
              ? `यह पासकोड इस केयर सर्कल (${state.passcode}) से मेल नहीं खाता।`
              : 'कोई केयर सर्कल नहीं मिला। पहले बुज़ुर्ग प्रोफ़ाइल बनाएं या डेमो कोड 482915 डालें।'
            : state.language === 'mr'
            ? state.isSetupComplete
              ? `हा पासकोड या केअर सर्कलशी (${state.passcode}) जुळत नाही.`
              : 'केअर सर्कल सापडला नाही. आधी ज्येष्ठ प्रोफाइल तयार करा किंवा डेमो कोड 482915 टाका.'
            : state.isSetupComplete
            ? `That passcode did not match this circle (${state.passcode}).`
            : 'No local care circle found for that passcode. Create an elderly profile first, or enter Demo passcode 482915.',
      };
    },
    [state.isSetupComplete, state.passcode, state.language]
  );

  const switchRoleView = useCallback((role: UserRole) => {
    setState((prev) => {
      const existing = prev.members.find((m) => m.role === role);
      if (existing) {
        return { ...prev, activeUserId: existing.id };
      }
      const tCur = getT(prev.language);
      const newMember: CareMember = {
        id: `user-${role}-${Date.now()}`,
        name:
          role === 'elderly'
            ? prev.elderly.name || tCur.roleElderShort
            : role === 'caretaker'
            ? tCur.roleCaretakerShort
            : tCur.roleFamilyShort,
        email: `${role}@saticare.example.com`,
        role,
        joinedAt: getLocalDateStr(0),
      };
      return {
        ...prev,
        activeUserId: newMember.id,
        members: [...prev.members, newMember],
      };
    });
  }, []);

  const touchActivity = useCallback(() => {
    setState((prev) => ({ ...prev, lastActivityAt: new Date().toISOString() }));
  }, []);

  const dispatchAlertAndEmails = useCallback(
    (
      alertInput: Omit<CareAlert, 'id' | 'createdAt' | 'acknowledged'>,
      emailSubject: string,
      emailBody: string,
      emailI18n?: {
        subjectKey: string;
        bodyKey: string;
        vars: Record<string, string | number>;
      }
    ) => {
      setState((prev) => {
        const nowIso = new Date().toISOString();
        const newAlert: CareAlert = {
          ...alertInput,
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: nowIso,
          acknowledged: false,
        };
        const recipients = prev.members.filter((m) => alertInput.targetRoles.includes(m.role));
        const newEmails: EmailLogEntry[] = recipients.map((r) => {
          const emailVars = { ...(emailI18n?.vars || {}), recipient: r.name };
          const t = getT(prev.language);
          const subjTmpl = emailI18n?.subjectKey
            ? (t[emailI18n.subjectKey as keyof TranslationDict] as string)
            : '';
          const bodyTmpl = emailI18n?.bodyKey
            ? (t[emailI18n.bodyKey as keyof TranslationDict] as string)
            : '';
          return {
            id: `email-${Date.now()}-${r.id}`,
            toEmail: r.email,
            toName: r.name,
            recipientRole: r.role,
            subject: subjTmpl ? formatTemplate(subjTmpl, emailVars) : emailSubject,
            bodyPreview: bodyTmpl ? formatTemplate(bodyTmpl, emailVars) : emailBody,
            subjectKey: emailI18n?.subjectKey,
            bodyKey: emailI18n?.bodyKey,
            vars: emailI18n ? emailVars : undefined,
            sentAt: nowIso,
            triggerType: alertInput.type,
          };
        });
        return {
          ...prev,
          alerts: [newAlert, ...prev.alerts],
          emailLogs: [...newEmails, ...prev.emailLogs],
        };
      });
    },
    []
  );

  const logSimulatedEmail = useCallback(
    (params: {
      triggerType: string;
      targetRoles: UserRole[];
      subjectKey: keyof TranslationDict;
      bodyKey: keyof TranslationDict;
      vars: Record<string, string | number>;
    }) => {
      setState((prev) => {
        const nowIso = new Date().toISOString();
        const t = getT(prev.language);
        const recipients = prev.members.filter((m) => params.targetRoles.includes(m.role));
        if (recipients.length === 0) return prev;
        const newEmails: EmailLogEntry[] = recipients.map((r) => {
          const emailVars = { ...params.vars, recipient: r.name };
          return {
            id: `email-${params.triggerType}-${Date.now()}-${r.id}`,
            toEmail: r.email,
            toName: r.name,
            recipientRole: r.role,
            subject: formatTemplate(t[params.subjectKey] as string, emailVars),
            bodyPreview: formatTemplate(t[params.bodyKey] as string, emailVars),
            subjectKey: params.subjectKey,
            bodyKey: params.bodyKey,
            vars: emailVars,
            sentAt: nowIso,
            triggerType: params.triggerType,
          };
        });
        return {
          ...prev,
          emailLogs: [...newEmails, ...prev.emailLogs],
        };
      });
    },
    []
  );

  const confirmDoseTaken = useCallback(
    (doseId: string, options?: { bypassDoubleDoseCheck?: boolean }): ConfirmDoseResult => {
      const targetLog = state.doseLogs.find((d) => d.id === doseId);
      if (!targetLog) return { ok: false };
      const med = state.medications.find((m) => m.id === targetLog.medicationId);
      if (!med) return { ok: false };

      const now = new Date();
      // Double-dose protection: check if another dose of this medication was confirmed within safeWindowHours
      if (!options?.bypassDoubleDoseCheck) {
        const recentTaken = state.doseLogs.find((d) => {
          if (d.medicationId !== med.id) return false;
          if (d.status !== 'said_taken' && d.status !== 'verified_taken') return false;
          if (!d.confirmedAt) return false;
          const hoursSince = (now.getTime() - new Date(d.confirmedAt).getTime()) / (1000 * 60 * 60);
          return hoursSince >= 0 && hoursSince < med.safeWindowHours;
        });

        if (recentTaken && recentTaken.confirmedAt) {
          const lastTime = new Date(recentTaken.confirmedAt).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          });
          const nextTimeDate = new Date(
            new Date(recentTaken.confirmedAt).getTime() + med.safeWindowHours * 3600 * 1000
          );
          const nextDueTime = nextTimeDate.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          });
          return {
            ok: false,
            blockedReason: 'double_dose',
            lastTakenTime: lastTime,
            nextDueTime,
          };
        }
      }

      // Pattern detection: check odd hours (1am-4:30am) or confirming >90m early
      let suspiciousFlag: string | undefined;
      const tNow = getT(state.language);
      const hour = now.getHours();
      if (hour >= 1 && hour <= 4) {
        suspiciousFlag = formatTemplate(tNow.suspiciousLateNightFlag, {
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      } else {
        const [sh, sm] = targetLog.scheduledTime.split(':').map(Number);
        const scheduledDate = new Date();
        scheduledDate.setHours(sh, sm, 0, 0);
        const minsEarly = (scheduledDate.getTime() - now.getTime()) / 60000;
        if (minsEarly > 90) {
          suspiciousFlag = formatTemplate(tNow.suspiciousEarlyFlag, {
            mins: Math.round(minsEarly),
          });
        }
      }

      setState((prev) => {
        const nowIso = new Date().toISOString();
        const updatedLogs: DoseLog[] = prev.doseLogs.map((d) =>
          d.id === doseId
            ? {
                ...d,
                status: 'said_taken',
                confirmedAt: nowIso,
                suspiciousFlag,
              }
            : d
        );

        const updatedMeds = prev.medications.map((m) =>
          m.id === med.id ? { ...m, stockCount: Math.max(0, m.stockCount - 1) } : m
        );

        const nextAlerts = [...prev.alerts];
        const nextEmails = [...prev.emailLogs];

        // Low stock check
        const updatedMed = updatedMeds.find((m) => m.id === med.id);
        const t = getT(prev.language);
        if (updatedMed && updatedMed.stockCount <= updatedMed.lowStockThreshold) {
          const alreadyAlerted = prev.alerts.some(
            (a) => a.type === 'low_stock' && (a.vars?.med === `${updatedMed.name} ${updatedMed.dose}` || a.title.includes(updatedMed.name)) && !a.acknowledged
          );
          if (!alreadyAlerted) {
            const medLabel = `${updatedMed.name} ${updatedMed.dose}`;
            nextAlerts.unshift({
              id: `alert-stock-${Date.now()}`,
              type: 'low_stock',
              severity: 'warning',
              title: formatTemplate(t.alertRefillTitle, { med: medLabel }),
              message: formatTemplate(t.alertRefillMsg, { count: updatedMed.stockCount }),
              titleKey: 'alertRefillTitle',
              messageKey: 'alertRefillMsg',
              vars: { med: medLabel, count: updatedMed.stockCount },
              createdAt: nowIso,
              acknowledged: false,
              targetRoles: ['caretaker', 'family'],
            });
            prev.members
              .filter((m) => m.role === 'caretaker' || m.role === 'family')
              .forEach((r) => {
                nextEmails.unshift({
                  id: `email-stock-${Date.now()}-${r.id}`,
                  toEmail: r.email,
                  toName: r.name,
                  recipientRole: r.role,
                  subject: formatTemplate(t.alertRefillTitle, { med: medLabel }),
                  bodyPreview: formatTemplate(t.alertRefillMsg, { count: updatedMed.stockCount }),
                  subjectKey: 'alertRefillTitle',
                  bodyKey: 'alertRefillMsg',
                  vars: { med: medLabel, count: updatedMed.stockCount },
                  sentAt: nowIso,
                  triggerType: 'low_stock',
                });
              });
          }
        }

        // Suspicious pattern alert
        if (suspiciousFlag) {
          const suspVars = {
            med: med.name,
            flag: suspiciousFlag,
            elder: prev.elderly.honorificName || prev.elderly.name,
          };
          nextAlerts.unshift({
            id: `alert-susp-${Date.now()}`,
            type: 'suspicious_pattern',
            severity: 'warning',
            title: formatTemplate(t.alertSuspiciousTitle, { med: med.name }),
            message: formatTemplate(t.alertSuspiciousMsg, { flag: suspiciousFlag }),
            titleKey: 'alertSuspiciousTitle',
            messageKey: 'alertSuspiciousMsg',
            vars: { med: med.name, flag: suspiciousFlag },
            createdAt: nowIso,
            acknowledged: false,
            targetRoles: ['caretaker', 'family'],
          });
          prev.members
            .filter((m) => m.role === 'caretaker')
            .forEach((r) => {
              const emailVars = { ...suspVars, recipient: r.name };
              nextEmails.unshift({
                id: `email-susp-${Date.now()}-${r.id}`,
                toEmail: r.email,
                toName: r.name,
                recipientRole: r.role,
                subject: formatTemplate(t.emailSuspiciousSubject, emailVars),
                bodyPreview: formatTemplate(t.emailSuspiciousBody, emailVars),
                subjectKey: 'emailSuspiciousSubject',
                bodyKey: 'emailSuspiciousBody',
                vars: emailVars,
                sentAt: nowIso,
                triggerType: 'suspicious_pattern',
              });
            });
        }

        return {
          ...prev,
          doseLogs: updatedLogs,
          medications: updatedMeds,
          alerts: nextAlerts,
          emailLogs: nextEmails,
          lastActivityAt: nowIso,
        };
      });

      return { ok: true, suspiciousFlag };
    },
    [state.doseLogs, state.medications, state.language]
  );

  const verifyDose = useCallback(
    (doseId: string, verifiedBy: 'caretaker' | 'photo' | 'pillbox_sensor', note?: string) => {
      setState((prev) => {
        const nowIso = new Date().toISOString();
        const target = prev.doseLogs.find((d) => d.id === doseId);
        const wasPending = target?.status === 'pending' || target?.status === 'missed';

        const updatedLogs = prev.doseLogs.map((d) =>
          d.id === doseId
            ? {
                ...d,
                status: 'verified_taken' as const,
                confirmedAt: d.confirmedAt || nowIso,
                verifiedAt: nowIso,
                verifiedBy,
                verificationNote: note,
              }
            : d
        );

        const updatedMeds =
          wasPending && target
            ? prev.medications.map((m) =>
                m.id === target.medicationId ? { ...m, stockCount: Math.max(0, m.stockCount - 1) } : m
              )
            : prev.medications;

        return {
          ...prev,
          doseLogs: updatedLogs,
          medications: updatedMeds,
          lastActivityAt: nowIso,
        };
      });
    },
    []
  );

  const undoDoseTaken = useCallback((doseId: string): { ok: boolean; medName?: string } => {
    const target = state.doseLogs.find((d) => d.id === doseId);
    if (!target || (target.status !== 'said_taken' && target.status !== 'verified_taken')) {
      return { ok: false };
    }
    const med = state.medications.find((m) => m.id === target.medicationId);

    setState((prev) => {
      const nowIso = new Date().toISOString();
      const updatedLogs = prev.doseLogs.map((d) =>
        d.id === doseId
          ? {
              ...d,
              status: 'pending' as const,
              confirmedAt: undefined,
              verifiedAt: undefined,
              verifiedBy: undefined,
              verificationNote: undefined,
              suspiciousFlag: undefined,
            }
          : d
      );

      const updatedMeds = prev.medications.map((m) =>
        m.id === target.medicationId ? { ...m, stockCount: m.stockCount + 1 } : m
      );

      return {
        ...prev,
        doseLogs: updatedLogs,
        medications: updatedMeds,
        lastActivityAt: nowIso,
      };
    });

    return { ok: true, medName: med?.name || '' };
  }, [state.doseLogs, state.medications]);

  const markDoseMissed = useCallback((doseId: string) => {
    const todayStr = getLocalDateStr(0);
    setState((prev) => {
      const updatedLogs = prev.doseLogs.map((d) =>
        d.id === doseId ? { ...d, status: 'missed' as const } : d
      );
      const consecutivePair = hasTwoConsecutiveRecentMissedDoses(updatedLogs, todayStr);
      if (consecutivePair.length < 2) {
        return {
          ...prev,
          doseLogs: updatedLogs,
        };
      }

      const nowIso = new Date().toISOString();
      const t = getT(prev.language);
      const pairMeds = consecutivePair
        .map((d) => {
          const med = prev.medications.find((m) => m.id === d.medicationId);
          return med ? `${med.name} (${d.scheduledTime})` : d.scheduledTime;
        })
        .join(' & ');
      const vars = {
        name: prev.elderly.honorificName || prev.elderly.name || 'Elder',
        med: pairMeds,
      };
      const alreadyEscalated = prev.alerts.some(
        (a) =>
          a.type === 'missed_dose' &&
          a.severity === 'critical' &&
          a.createdAt.startsWith(todayStr) &&
          a.vars?.med === pairMeds
      );
      if (alreadyEscalated) {
        return { ...prev, doseLogs: updatedLogs };
      }

      const newAlert: CareAlert = {
        id: `alert-consec-missed-${Date.now()}`,
        type: 'missed_dose',
        severity: 'critical',
        title: formatTemplate(t.alertConsecutiveMissedTitle, vars),
        message: formatTemplate(t.alertConsecutiveMissedMsg, vars),
        titleKey: 'alertConsecutiveMissedTitle',
        messageKey: 'alertConsecutiveMissedMsg',
        vars,
        createdAt: nowIso,
        acknowledged: false,
        targetRoles: ['caretaker', 'family'],
      };

      const newEmails: EmailLogEntry[] = prev.members
        .filter((m) => m.role === 'caretaker' || m.role === 'family')
        .map((r) => ({
          id: `email-consec-${Date.now()}-${r.id}`,
          toEmail: r.email,
          toName: r.name,
          recipientRole: r.role,
          subject: formatTemplate(t.alertConsecutiveMissedTitle, vars),
          bodyPreview: formatTemplate(t.alertConsecutiveMissedMsg, vars),
          subjectKey: 'alertConsecutiveMissedTitle',
          bodyKey: 'alertConsecutiveMissedMsg',
          vars,
          sentAt: nowIso,
          triggerType: 'missed_dose',
        }));

      return {
        ...prev,
        doseLogs: updatedLogs,
        alerts: [newAlert, ...prev.alerts],
        emailLogs: [...newEmails, ...prev.emailLogs],
      };
    });
  }, []);

  const addDoctorNote = useCallback(
    (note: Omit<DoctorNote, 'id' | 'createdAt'>) => {
      const nowIso = new Date().toISOString();
      const created: DoctorNote = {
        ...note,
        id: `docnote-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: nowIso,
      };
      setState((prev) => ({
        ...prev,
        doctorNotes: [created, ...(prev.doctorNotes || [])],
        lastActivityAt: nowIso,
      }));
      return created;
    },
    []
  );

  const deleteDoctorNote = useCallback((noteId: string) => {
    setState((prev) => ({
      ...prev,
      doctorNotes: (prev.doctorNotes || []).filter((n) => n.id !== noteId),
    }));
  }, []);

  const addMedication = useCallback((med: Omit<Medication, 'id'>) => {
    const newMed: Medication = {
      ...med,
      id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    const today = getLocalDateStr(0);
    const activeToday = (!newMed.startDate || newMed.startDate <= today) && (!newMed.endDate || newMed.endDate >= today);
    setState((prev) => {
      const newLogs: DoseLog[] = activeToday
        ? newMed.times.map((time) => ({
            id: `dose-${today}-${newMed.id}-${time}`,
            medicationId: newMed.id,
            date: today,
            scheduledTime: time,
            status: 'pending',
          }))
        : [];
      return {
        ...prev,
        medications: [...prev.medications, newMed],
        doseLogs: [...prev.doseLogs, ...newLogs],
      };
    });
  }, []);

  const updateMedication = useCallback((med: Medication) => {
    const today = getLocalDateStr(0);
    const activeToday = (!med.startDate || med.startDate <= today) && (!med.endDate || med.endDate >= today);
    setState((prev) => ({
      ...prev,
      medications: prev.medications.map((m) => (m.id === med.id ? med : m)),
      doseLogs: prev.doseLogs.filter(
        (d) =>
          !(
            d.medicationId === med.id &&
            d.date === today &&
            d.status === 'pending' &&
            (!activeToday || !med.times.includes(d.scheduledTime))
          )
      ),
    }));
  }, []);

  const deleteMedication = useCallback((medId: string) => {
    setState((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.id !== medId),
      doseLogs: prev.doseLogs.filter((d) => !(d.medicationId === medId && d.status === 'pending')),
    }));
  }, []);

  const addAppointment = useCallback((appt: Omit<Appointment, 'id'>) => {
    setState((prev) => {
      const nowIso = new Date().toISOString();
      const t = getT(prev.language);
      const apptEmails: EmailLogEntry[] = prev.members
        .filter((m) => m.role === 'caretaker' || m.role === 'family')
        .map((r) => {
          const vars = {
            recipient: r.name,
            elder: prev.elderly.honorificName || prev.elderly.name,
            doctor: appt.doctorName,
            specialty: appt.specialty,
            clinic: appt.clinic,
            date: appt.date,
            time: appt.time,
          };
          return {
            id: `email-appt-${Date.now()}-${r.id}`,
            toEmail: r.email,
            toName: r.name,
            recipientRole: r.role,
            subject: formatTemplate(t.emailAppointmentSubject, vars),
            bodyPreview: formatTemplate(t.emailAppointmentBody, vars),
            subjectKey: 'emailAppointmentSubject',
            bodyKey: 'emailAppointmentBody',
            vars,
            sentAt: nowIso,
            triggerType: 'appointment_reminder',
          };
        });
      return {
        ...prev,
        appointments: [
          ...prev.appointments,
          { ...appt, id: `appt-${Date.now()}` },
        ].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)),
        emailLogs: [...apptEmails, ...prev.emailLogs],
      };
    });
  }, []);

  const deleteAppointment = useCallback((apptId: string) => {
    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.filter((a) => a.id !== apptId),
    }));
  }, []);

  const recordMood = useCallback((mood: MoodValue) => {
    const today = getLocalDateStr(0);
    setState((prev) => {
      const nowIso = new Date().toISOString();
      const filtered = prev.moodLogs.filter((m) => m.date !== today);
      const nextMoods = [{ id: `mood-${today}`, date: today, mood, createdAt: nowIso }, ...filtered];

      // Gentle mood trend check: if 2+ recent low/unwell moods
      const recentLow = nextMoods.slice(0, 3).filter((m) => m.mood === 'sad' || m.mood === 'unwell').length;
      const nextAlerts = [...prev.alerts];
      const nextEmails = [...prev.emailLogs];
      if (recentLow >= 2) {
        const alreadyNotified = prev.alerts.some(
          (a) => a.type === 'mood_trend' && a.createdAt.startsWith(today)
        );
        if (!alreadyNotified) {
          const t = getT(prev.language);
          nextAlerts.unshift({
            id: `alert-mood-${Date.now()}`,
            type: 'mood_trend',
            severity: 'info',
            title: formatTemplate(t.alertMoodTitle, { name: prev.elderly.honorificName }),
            message: formatTemplate(t.alertMoodMsg, { name: prev.elderly.honorificName }),
            titleKey: 'alertMoodTitle',
            messageKey: 'alertMoodMsg',
            vars: { name: prev.elderly.honorificName },
            createdAt: nowIso,
            acknowledged: false,
            targetRoles: ['family', 'caretaker'],
          });
          prev.members
            .filter((m) => m.role === 'family')
            .forEach((r) => {
              const moodVars = {
                recipient: r.name,
                elder: prev.elderly.honorificName || prev.elderly.name,
              };
              nextEmails.unshift({
                id: `email-mood-${Date.now()}-${r.id}`,
                toEmail: r.email,
                toName: r.name,
                recipientRole: r.role,
                subject: formatTemplate(t.emailMoodSubject, moodVars),
                bodyPreview: formatTemplate(t.emailMoodBody, moodVars),
                subjectKey: 'emailMoodSubject',
                bodyKey: 'emailMoodBody',
                vars: moodVars,
                sentAt: nowIso,
                triggerType: 'mood_trend',
              });
            });
        }
      }

      return {
        ...prev,
        moodLogs: nextMoods,
        alerts: nextAlerts,
        emailLogs: nextEmails,
        lastActivityAt: nowIso,
      };
    });
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
    }));
  }, []);

  const updatePrivacy = useCallback((patch: Partial<PrivacySettings>) => {
    setState((prev) => ({ ...prev, privacy: { ...prev.privacy, ...patch } }));
  }, []);

  const updateAccessibility = useCallback((patch: Partial<AccessibilitySettings>) => {
    setState((prev) => ({ ...prev, accessibility: { ...prev.accessibility, ...patch } }));
  }, []);

  const updateElderlyProfile = useCallback((patch: Partial<ElderlyProfile>) => {
    setState((prev) => {
      const nextName = patch.name !== undefined ? patch.name : prev.elderly.name;
      const nextHonorific =
        patch.name !== undefined && patch.name.trim()
          ? getLocalizedHonorificName(prev.language, patch.name.trim())
          : prev.elderly.honorificName;
      return {
        ...prev,
        elderly: {
          ...prev.elderly,
          ...patch,
          name: nextName,
          honorificName: nextHonorific,
        },
        lastActivityAt: new Date().toISOString(),
      };
    });
  }, []);

  const sendVoiceFamilyMessage = useCallback(
    (params: { targetHint: string; originalMessage: string; summary: string }): {
      recipientNames: string[];
    } => {
      const hint = params.targetHint.trim().toLowerCase();
      const careRecipients = state.members.filter((m) => m.role === 'caretaker' || m.role === 'family');

      let matched: CareMember[] = [];
      if (hint) {
        matched = careRecipients.filter((m) => {
          const nameL = m.name.toLowerCase();
          const firstNameL = nameL.split(/\s+/)[0] || '';
          const relL = (m.relation || '').toLowerCase();
          return (
            nameL.includes(hint) ||
            hint.includes(nameL) ||
            (firstNameL.length >= 3 && hint.includes(firstNameL)) ||
            (relL && (relL.includes(hint) || hint.includes(relL)))
          );
        });
      }

      if (matched.length === 0) {
        if (/(caretaker|caregiver|nurse|केयरटेकर|काळजीवाहू)/i.test(hint)) {
          matched = careRecipients.filter((m) => m.role === 'caretaker');
        } else if (/(son|daughter|family|kids|children|बेटा|बेटी|परिवार|मुलगा|मुलगी|कुटुंब)/i.test(hint)) {
          matched = careRecipients.filter((m) => m.role === 'family');
        }
      }

      if (matched.length === 0) {
        matched = careRecipients;
      }

      const recipientNames =
        matched.length > 0
          ? matched.map((m) => m.name)
          : [params.targetHint || getT(state.language).roleFamilyShort];
      const recipientRoles: UserRole[] =
        matched.length > 0
          ? Array.from(new Set(matched.map((m) => m.role)))
          : ['caretaker', 'family'];

      setState((prev) => {
        const nowIso = new Date().toISOString();
        const t = getT(prev.language);
        const elder = prev.elderly.honorificName || prev.elderly.name || 'Elder';
        const recipientsLabel = recipientNames.join(', ');
        const vars = {
          elder,
          recipients: recipientsLabel,
          summary: params.summary,
          original: params.originalMessage,
        };

        const newAlert: CareAlert = {
          id: `alert-family-msg-${Date.now()}`,
          type: 'family_message',
          severity: 'info',
          title: formatTemplate(t.familyMsgAlertTitle, vars),
          message: `"${params.summary}"`,
          titleKey: 'familyMsgAlertTitle',
          vars,
          createdAt: nowIso,
          acknowledged: false,
          targetRoles: recipientRoles,
        };

        const emailRecipients =
          matched.length > 0
            ? matched.map((r) => ({
                id: r.id,
                name: r.name,
                email: r.email,
                role: r.role,
              }))
            : (prev.elderly.familyContacts || []).length > 0
            ? (prev.elderly.familyContacts || []).map((c) => ({
                id: c.id,
                name: c.name || recipientNames[0],
                email: `${(c.name || 'family').toLowerCase().replace(/[^a-z0-9]+/g, '.') || 'family'}@saticare.example.com`,
                role: 'family' as UserRole,
              }))
            : [
                {
                  id: 'family-circle',
                  name: recipientNames[0],
                  email: 'family.circle@saticare.example.com',
                  role: 'family' as UserRole,
                },
              ];

        const newEmails: EmailLogEntry[] = emailRecipients.map((r) => {
          const emailVars = { ...vars, recipient: r.name };
          return {
            id: `email-family-msg-${Date.now()}-${r.id}`,
            toEmail: r.email,
            toName: r.name,
            recipientRole: r.role,
            subject: formatTemplate(t.familyMsgEmailSubject, emailVars),
            bodyPreview: formatTemplate(t.familyMsgEmailBody, emailVars),
            subjectKey: 'familyMsgEmailSubject',
            bodyKey: 'familyMsgEmailBody',
            vars: emailVars,
            sentAt: nowIso,
            triggerType: 'family_message',
          };
        });

        return {
          ...prev,
          alerts: [newAlert, ...prev.alerts],
          emailLogs: [...newEmails, ...prev.emailLogs],
          lastActivityAt: nowIso,
        };
      });

      return { recipientNames };
    },
    [state.members, state.language]
  );

  const requestPasscodeHelp = useCallback(
    (payload: { requesterName: string; requesterEmail: string; role: 'caretaker' | 'family' }) => {
      const nowIso = new Date().toISOString();
      if (!state.isSetupComplete) {
        const existing = readPendingPasscodeHelps();
        existing.unshift({
          requesterName: payload.requesterName.trim() || 'Family Member',
          requesterEmail: payload.requesterEmail.trim() || 'member@example.com',
          role: payload.role,
          requestedAt: nowIso,
        });
        try {
          localStorage.setItem(PENDING_PASSCODE_HELP_KEY, JSON.stringify(existing.slice(0, 5)));
        } catch {
          // Ignore storage write error
        }
        return;
      }

      setState((prev) => {
        const t = getT(prev.language);
        const roleLabel = payload.role === 'caretaker' ? t.roleCaretakerShort : t.roleFamilyShort;
        const elderName = prev.elderly.honorificName || prev.elderly.name || 'Elder';
        const vars = {
          name: payload.requesterName.trim() || roleLabel,
          role: roleLabel,
          email: payload.requesterEmail.trim() || 'member@example.com',
          elder: elderName,
        };
        const newAlert: CareAlert = {
          id: `alert-passcode-help-${Date.now()}`,
          type: 'passcode_help',
          severity: 'info',
          title: formatTemplate(t.passcodeHelpAlertTitle, vars),
          message: formatTemplate(t.passcodeHelpAlertMsg, vars),
          titleKey: 'passcodeHelpAlertTitle',
          messageKey: 'passcodeHelpAlertMsg',
          vars,
          createdAt: nowIso,
          acknowledged: false,
          targetRoles: ['caretaker', 'family'],
        };
        const newEmails: EmailLogEntry[] = prev.members
          .filter((m) => m.role === 'caretaker' || m.role === 'family')
          .map((r) => {
            const emailVars = { ...vars, recipient: r.name };
            return {
              id: `email-passcode-help-${Date.now()}-${r.id}`,
              toEmail: r.email,
              toName: r.name,
              recipientRole: r.role,
              subject: formatTemplate(t.passcodeHelpEmailSubject, emailVars),
              bodyPreview: formatTemplate(t.passcodeHelpEmailBody, emailVars),
              subjectKey: 'passcodeHelpEmailSubject',
              bodyKey: 'passcodeHelpEmailBody',
              vars: emailVars,
              sentAt: nowIso,
              triggerType: 'passcode_help',
            };
          });
        return {
          ...prev,
          alerts: [newAlert, ...prev.alerts],
          emailLogs: [...newEmails, ...prev.emailLogs],
        };
      });
    },
    [state.isSetupComplete]
  );

  const appendChatMessage = useCallback(
    (msg: { role: 'user' | 'assistant'; text: string; triageLevel?: 'NONE' | 'MILD' | 'CONCERNING' | 'EMERGENCY' }) => {
      setState((prev) => ({
        ...prev,
        chatHistory: [
          ...prev.chatHistory,
          {
            id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            role: msg.role,
            text: msg.text,
            timestamp: new Date().toISOString(),
            triageLevel: msg.triageLevel,
          },
        ],
        lastActivityAt: new Date().toISOString(),
      }));
    },
    []
  );

  const simulateMissedDose = useCallback((): boolean => {
    const today = getLocalDateStr(0);
    const todaysLogs = state.doseLogs.filter((d) => d.date === today);
    const target =
      todaysLogs.find((d) => d.status === 'pending') ||
      todaysLogs[todaysLogs.length - 1] ||
      state.doseLogs[state.doseLogs.length - 1];
    if (!target) return false;

    setState((prev) => {
      const med = prev.medications.find((m) => m.id === target.medicationId);
      const medLabel = med ? `${med.name} ${med.dose}` : 'Medicine';
      const nowIso = new Date().toISOString();
      const t = getT(prev.language);
      const vars = {
        med: medLabel,
        time: target.scheduledTime,
        name: prev.elderly.honorificName || prev.elderly.name || 'Elder',
      };

      const updatedLogs = prev.doseLogs.map((d) =>
        d.id === target.id ? { ...d, status: 'missed' as const } : d
      );

      const consecutivePair = hasTwoConsecutiveRecentMissedDoses(updatedLogs, today);
      const isConsecutive = consecutivePair.length >= 2;
      const pairMeds = isConsecutive
        ? consecutivePair
            .map((d) => {
              const m = prev.medications.find((item) => item.id === d.medicationId);
              return m ? `${m.name} (${d.scheduledTime})` : d.scheduledTime;
            })
            .join(' & ')
        : '';

      const alertVars = isConsecutive
        ? {
            name: prev.elderly.honorificName || prev.elderly.name || 'Elder',
            med: pairMeds,
          }
        : vars;
      const titleKey = isConsecutive ? 'alertConsecutiveMissedTitle' : 'alertMissedTitle';
      const msgKey = isConsecutive ? 'alertConsecutiveMissedMsg' : 'alertMissedMsg';

      const newAlert: CareAlert = {
        id: `alert-missed-${Date.now()}`,
        type: 'missed_dose',
        severity: isConsecutive ? 'critical' : 'warning',
        title: formatTemplate(t[titleKey], alertVars),
        message: formatTemplate(t[msgKey], alertVars),
        titleKey,
        messageKey: msgKey,
        vars: alertVars,
        createdAt: nowIso,
        acknowledged: false,
        targetRoles: ['caretaker', 'family'],
      };

      const newEmails: EmailLogEntry[] = prev.members
        .filter((m) => m.role === 'caretaker' || m.role === 'family')
        .map((r) => ({
          id: `email-missed-${Date.now()}-${r.id}`,
          toEmail: r.email,
          toName: r.name,
          recipientRole: r.role,
          subject: formatTemplate(t[titleKey], alertVars),
          bodyPreview: formatTemplate(t[msgKey], alertVars),
          subjectKey: titleKey,
          bodyKey: msgKey,
          vars: alertVars,
          sentAt: nowIso,
          triggerType: 'missed_dose' as const,
        }));

      return {
        ...prev,
        doseLogs: updatedLogs,
        alerts: [newAlert, ...prev.alerts],
        emailLogs: [...newEmails, ...prev.emailLogs],
      };
    });
    return true;
  }, [state.doseLogs]);

  const simulateDoubleDoseAttempt = useCallback((): {
    medName: string;
    lastTime: string;
    nextDueTime: string;
  } | null => {
    const today = getLocalDateStr(0);
    const med = state.medications[0];
    if (!med) return null;

    const now = new Date();
    const recentConfirmed = new Date(now.getTime() - 25 * 60 * 1000);
    const nextDue = new Date(recentConfirmed.getTime() + med.safeWindowHours * 3600 * 1000);

    const lastTime = recentConfirmed.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
    const nextDueTime = nextDue.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });

    // Ensure the earlier dose for this med reflects the recent timestamp so subsequent real clicks also enforce double-dose protection
    setState((prev) => {
      const candidate =
        prev.doseLogs.find((d) => d.date === today && d.medicationId === med.id && d.status !== 'pending') ||
        prev.doseLogs.find((d) => d.date === today && d.medicationId === med.id);
      if (!candidate) return prev;
      return {
        ...prev,
        doseLogs: prev.doseLogs.map((d) =>
          d.id === candidate.id
            ? {
                ...d,
                status: d.status === 'pending' ? 'verified_taken' : d.status,
                confirmedAt: recentConfirmed.toISOString(),
              }
            : d
        ),
      };
    });

    return {
      medName: med.name,
      lastTime,
      nextDueTime,
    };
  }, [state.medications]);

  const simulateSuspiciousPattern = useCallback((): boolean => {
    const today = getLocalDateStr(0);
    const todaysLogs = state.doseLogs.filter((d) => d.date === today);
    const target =
      todaysLogs.find((d) => d.status === 'pending') ||
      todaysLogs[0] ||
      state.doseLogs[0];
    if (!target) return false;

    setState((prev) => {
      const med = prev.medications.find((m) => m.id === target.medicationId);
      const medName = med ? med.name : 'Medicine';
      const t = getT(prev.language);
      const nowIso = new Date().toISOString();
      const oddHourDate = new Date();
      oddHourDate.setHours(2, 47, 0, 0);
      const flagText = t.demoSuspiciousFlagText;

      const updatedLogs = prev.doseLogs.map((d) =>
        d.id === target.id
          ? {
              ...d,
              status: 'said_taken' as const,
              confirmedAt: oddHourDate.toISOString(),
              suspiciousFlag: flagText,
            }
          : d
      );

      const vars = { med: medName, flag: flagText };
      const newAlert: CareAlert = {
        id: `alert-susp-${Date.now()}`,
        type: 'suspicious_pattern',
        severity: 'warning',
        title: formatTemplate(t.alertSuspiciousTitle, vars),
        message: formatTemplate(t.alertSuspiciousMsg, vars),
        titleKey: 'alertSuspiciousTitle',
        messageKey: 'alertSuspiciousMsg',
        vars,
        createdAt: nowIso,
        acknowledged: false,
        targetRoles: ['caretaker', 'family'],
      };

      const newEmails: EmailLogEntry[] = prev.members
        .filter((m) => m.role === 'caretaker' || m.role === 'family')
        .map((r) => {
          const emailVars = {
            recipient: r.name,
            elder: prev.elderly.honorificName || prev.elderly.name,
            med: medName,
            flag: flagText,
          };
          return {
            id: `email-susp-${Date.now()}-${r.id}`,
            toEmail: r.email,
            toName: r.name,
            recipientRole: r.role,
            subject: formatTemplate(t.emailSuspiciousSubject, emailVars),
            bodyPreview: formatTemplate(t.emailSuspiciousBody, emailVars),
            subjectKey: 'emailSuspiciousSubject',
            bodyKey: 'emailSuspiciousBody',
            vars: emailVars,
            sentAt: nowIso,
            triggerType: 'suspicious_pattern' as const,
          };
        });

      return {
        ...prev,
        doseLogs: updatedLogs,
        alerts: [newAlert, ...prev.alerts],
        emailLogs: [...newEmails, ...prev.emailLogs],
      };
    });
    return true;
  }, [state.doseLogs]);

  return {
    state,
    activeMember,
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
  };
}
