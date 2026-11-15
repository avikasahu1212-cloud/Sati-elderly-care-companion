import React, { useMemo, useState } from 'react';
import { Mail } from 'lucide-react';
import { getT, LANGUAGES } from '../i18n/translations';
import { resolveEmailText } from '../store/useCareStore';
import { EmailLogEntry, LanguageCode } from '../types';

type EmailFilter = 'all' | 'reminders' | 'alerts' | 'appointments';

interface EmailLogSectionProps {
  emailLogs: EmailLogEntry[];
  language: LanguageCode;
}

export function EmailLogSection({ emailLogs, language }: EmailLogSectionProps) {
  const t = getT(language);
  const speechLocale = LANGUAGES.find((l) => l.code === language)?.speechLocale || 'en-IN';
  const [filter, setFilter] = useState<EmailFilter>('all');

  const typeLabelMap: Record<string, { label: string; style: string }> = {
    dose_reminder: {
      label: t.emailTypeDoseReminder,
      style: 'bg-teal-50 text-[#0D5652] border-teal-200',
    },
    appointment_reminder: {
      label: t.emailTypeAppointmentReminder,
      style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    missed_dose: {
      label: t.emailTypeMissedDose,
      style: 'bg-amber-50 text-amber-900 border-amber-300',
    },
    low_stock: {
      label: t.emailTypeLowStock,
      style: 'bg-amber-50 text-[#A85208] border-amber-200',
    },
    escalation: {
      label: t.emailTypeEscalation,
      style: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    emergency: {
      label: t.emailTypeEmergency,
      style: 'bg-rose-100 text-rose-900 border-rose-300',
    },
    suspicious_pattern: {
      label: t.emailTypeSuspiciousPattern,
      style: 'bg-amber-50 text-amber-900 border-amber-200',
    },
    mood_trend: {
      label: t.emailTypeMoodTrend,
      style: 'bg-[#F2ECE1] text-[#0D5652] border-[#DFD5C5]',
    },
    health_concern: {
      label: t.emailTypeHealthConcern,
      style: 'bg-amber-50 text-amber-900 border-amber-200',
    },
    inactivity: {
      label: t.emailTypeInactivity,
      style: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    family_message: {
      label: t.emailTypeFamilyMessage,
      style: 'bg-teal-50 text-[#0D5652] border-teal-300',
    },
    passcode_help: {
      label: t.emailTypePasscodeHelp,
      style: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    },
  };

  const filteredEmails = useMemo(() => {
    if (filter === 'all') return emailLogs;
    if (filter === 'reminders') {
      return emailLogs.filter(
        (e) => e.triggerType === 'dose_reminder' || e.triggerType === 'low_stock'
      );
    }
    if (filter === 'appointments') {
      return emailLogs.filter((e) => e.triggerType === 'appointment_reminder');
    }
    return emailLogs.filter(
      (e) =>
        e.triggerType === 'missed_dose' ||
        e.triggerType === 'escalation' ||
        e.triggerType === 'emergency' ||
        e.triggerType === 'suspicious_pattern' ||
        e.triggerType === 'health_concern' ||
        e.triggerType === 'inactivity' ||
        e.triggerType === 'mood_trend' ||
        e.triggerType === 'family_message' ||
        e.triggerType === 'passcode_help'
    );
  }, [emailLogs, filter]);

  const filterOptions: Array<{ id: EmailFilter; label: string }> = [
    { id: 'all', label: t.emailFilterAll },
    { id: 'reminders', label: t.emailFilterReminders },
    { id: 'alerts', label: t.emailFilterAlerts },
    { id: 'appointments', label: t.emailFilterAppointments },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2.5">
          <Mail className="w-7 h-7 text-[#0D5652] shrink-0" aria-hidden="true" />
          <span>{t.emailLogTitle}</span>
        </h2>
        <span className="sati-muted text-sm text-[#3E4C48]">{t.smtpReadyNote}</span>
      </div>

      {emailLogs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => {
            const active = filter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(opt.id)}
                className={`min-h-[48px] px-4 rounded-2xl text-sm font-bold border-2 cursor-pointer transition-colors ${
                  active
                    ? 'bg-[#0D5652] text-white border-[#0D5652]'
                    : 'bg-white hover:bg-[#F2ECE1] text-[#3E4C48] border-[#DFD5C5]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {filteredEmails.length === 0 ? (
        <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-9 text-center text-[#3E4C48]">
          {t.noEmailsYet}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEmails.map((email) => {
            const localized = resolveEmailText(email, language);
            const badge = typeLabelMap[email.triggerType] || {
              label: email.triggerType,
              style: 'bg-[#F2ECE1] text-[#3E4C48] border-[#DFD5C5]',
            };
            return (
              <div
                key={email.id}
                className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-5 sm:p-6 space-y-3"
              >
                <div className="sati-muted flex flex-wrap items-center justify-between gap-2 text-sm text-[#3E4C48]">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${badge.style}`}
                    >
                      {badge.label}
                    </span>
                    <span className="break-words">
                      {t.emailSentTo} <strong className="text-[#131B19]">{email.toName}</strong> (
                      {email.toEmail})
                    </span>
                  </div>
                  <span className="tabular-nums shrink-0">
                    {new Date(email.sentAt).toLocaleString(speechLocale)}
                  </span>
                </div>
                <div className="font-bold text-lg text-[#0D5652] break-words">
                  {localized.subject}
                </div>
                <p className="text-base text-[#131B19] bg-[#FAF7F2] p-4 rounded-2xl border border-[#DFD5C5] leading-relaxed break-words">
                  {localized.bodyPreview}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
