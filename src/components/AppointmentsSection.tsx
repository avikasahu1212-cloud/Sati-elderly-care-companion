import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  Loader2,
  MapPin,
  Plus,
  Share2,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import { getLocalDateStr } from '../data/seedData';
import { formatTemplate, getT, LANGUAGES } from '../i18n/translations';
import { generateWeeklyDoctorReport } from '../services/geminiService';
import { Appointment, CareCircleState, LanguageCode } from '../types';
import { getSymptomCategoryLabel } from './DoctorNotesSection';

export function sortAppointmentsChronologically(appointments: Appointment[]): Appointment[] {
  return [...appointments].sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
  );
}

export function getNextUpcomingAppointment(appointments: Appointment[]): Appointment | null {
  const todayStr = getLocalDateStr(0);
  const sorted = sortAppointmentsChronologically(appointments);
  return sorted.find((a) => a.date >= todayStr) || sorted[sorted.length - 1] || null;
}

export function formatAppointmentCountdown(
  dateStr: string,
  language: LanguageCode
): { label: string; tone: 'urgent' | 'upcoming' | 'past' } {
  const t = getT(language);
  const todayStr = getLocalDateStr(0);
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date(todayStr + 'T00:00:00');
  if (Number.isNaN(target.getTime())) {
    return { label: dateStr, tone: 'upcoming' };
  }
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: t.countdownPassed, tone: 'past' };
  if (diffDays === 0) return { label: t.countdownToday, tone: 'urgent' };
  if (diffDays === 1) return { label: t.countdownTomorrow, tone: 'urgent' };
  return {
    label: formatTemplate(t.countdownInDays, { days: diffDays }),
    tone: 'upcoming',
  };
}

function useShareDoctorReport(state: CareCircleState) {
  const todayStr = getLocalDateStr(0);
  const [reportText, setReportText] = useState('');
  const [usedOfflineFallback, setUsedOfflineFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareReport = async () => {
    setLoading(true);
    setUsedOfflineFallback(false);
    const notesBlock =
      (state.doctorNotes || []).length > 0
        ? `\n\n${getT(state.language).doctorNotesSectionTitle}:\n` +
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
      const fullText = `${res.report}${notesBlock}`;
      setReportText(fullText);
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullText).catch(() => {});
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
    } catch {
      const last7 = new Set(Array.from({ length: 7 }, (_, i) => getLocalDateStr(-i)));
      const logs = state.doseLogs.filter((d) => last7.has(d.date) && d.status !== 'pending');
      const taken = logs.filter(
        (d) => d.status === 'verified_taken' || d.status === 'said_taken'
      ).length;
      const pct = logs.length > 0 ? Math.round((taken / logs.length) * 100) : 0;
      const baseFallback =
        state.language === 'hi'
          ? `${state.elderly.name}: पिछले 7 दिनों में ${logs.length} में से ${taken} निर्धारित खुराक (${pct}%) लीं।`
          : state.language === 'mr'
          ? `${state.elderly.name}: गेल्या 7 दिवसांत ${logs.length} पैकी ${taken} डोस (${pct}%) घेतले.`
          : `${state.elderly.name} completed ${taken} of ${logs.length} scheduled doses (${pct}%) over the past 7 days.`;
      const fullFallback = `${baseFallback}${notesBlock}`;
      setReportText(fullFallback);
      setUsedOfflineFallback(true);
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullFallback).catch(() => {});
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
    } finally {
      setLoading(false);
    }
  };

  return { reportText, usedOfflineFallback, loading, copied, shareReport };
}

interface NextAppointmentSpotlightProps {
  state: CareCircleState;
  onOpenAddAppt?: () => void;
  canAdd?: boolean;
}

export function NextAppointmentSpotlight({
  state,
  onOpenAddAppt,
  canAdd = false,
}: NextAppointmentSpotlightProps) {
  const t = getT(state.language);
  const speechLocale = LANGUAGES.find((l) => l.code === state.language)?.speechLocale || 'en-IN';
  const nextAppt = useMemo(
    () => getNextUpcomingAppointment(state.appointments),
    [state.appointments]
  );
  const { reportText, usedOfflineFallback, loading, copied, shareReport } = useShareDoctorReport(state);

  return (
    <section className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#F2ECE1] text-[#0D5652] flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl font-bold text-[#131B19]">
            {t.nextAppointmentTitle}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canAdd && onOpenAddAppt && (
            <button
              type="button"
              onClick={onOpenAddAppt}
              className="min-h-[48px] px-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] text-sm sm:text-base font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 text-[#0D5652]" aria-hidden="true" />
              <span>{t.addAppointment}</span>
            </button>
          )}
          <button
            type="button"
            onClick={shareReport}
            disabled={loading}
            className="min-h-[48px] px-4 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white text-sm sm:text-base font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Share2 className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{loading ? t.preparingReport : t.shareDoctorReport}</span>
          </button>
        </div>
      </div>

      {!nextAppt ? (
        <p className="sati-muted text-base text-[#3E4C48]">{t.noAppointments}</p>
      ) : (
        (() => {
          const countdown = formatAppointmentCountdown(nextAppt.date, state.language);
          const parsedNextDate = new Date(nextAppt.date + 'T00:00:00');
          const dateFormatted = Number.isNaN(parsedNextDate.getTime())
            ? nextAppt.date
            : parsedNextDate.toLocaleDateString(speechLocale, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              });
          return (
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C5] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-7 space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display text-2xl font-extrabold text-[#131B19]">
                    {nextAppt.doctorName}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-bold tabular-nums ${
                      countdown.tone === 'urgent'
                        ? 'text-[#A85208]'
                        : countdown.tone === 'past'
                        ? 'text-[#3E4C48]'
                        : 'text-[#0D5652]'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>{countdown.label}</span>
                  </span>
                </div>
                <div className="text-base font-medium text-[#3E4C48]">{nextAppt.specialty}</div>
                <div className="text-base font-bold text-[#0D5652] tabular-nums pt-1">
                  {dateFormatted} · {nextAppt.time}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[#3E4C48]">
                  <MapPin className="w-4 h-4 shrink-0 text-[#0D5652]" />
                  <span>{nextAppt.clinic}</span>
                </div>
              </div>

              {nextAppt.notes && (
                <div className="md:col-span-5 p-4 rounded-2xl bg-white border border-[#DFD5C5] space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wide text-[#3E4C48]">
                    {t.notesLabel}
                  </div>
                  <p className="text-sm text-[#131B19] leading-relaxed">{nextAppt.notes}</p>
                </div>
              )}
            </div>
          );
        })()
      )}

      {reportText && (
        <div
          role="region"
          aria-live="polite"
          className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C5] space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-lg font-bold text-[#0D5652]">
              {t.doctorReportHeading}
            </span>
            {copied && (
              <span className="text-sm font-bold text-emerald-800 inline-flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                {t.copiedNotice}
              </span>
            )}
          </div>
          {usedOfflineFallback && (
            <p className="text-sm font-medium text-amber-900 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
              {t.offlineReportNote}
            </p>
          )}
          <p className="text-base text-[#131B19] leading-relaxed whitespace-pre-line">{reportText}</p>
        </div>
      )}
    </section>
  );
}

interface AppointmentsSectionProps {
  state: CareCircleState;
  onOpenAddAppt?: () => void;
  onDeleteAppt?: (apptId: string) => void;
  onOpenCalendar?: () => void;
  canAdd?: boolean;
  canDelete?: boolean;
  elderlyLargeMode?: boolean;
  headingLevel?: 'h1' | 'h2';
}

export function AppointmentsSection({
  state,
  onOpenAddAppt,
  onDeleteAppt,
  onOpenCalendar,
  canAdd = true,
  canDelete = false,
  elderlyLargeMode = false,
  headingLevel = 'h2',
}: AppointmentsSectionProps) {
  const t = getT(state.language);
  const speechLocale = LANGUAGES.find((l) => l.code === state.language)?.speechLocale || 'en-IN';
  const sortedAppointments = useMemo(
    () => sortAppointmentsChronologically(state.appointments),
    [state.appointments]
  );
  const { reportText, usedOfflineFallback, loading, copied, shareReport } = useShareDoctorReport(state);
  const HeadingTag = headingLevel;
  const CardHeadingTag = headingLevel === 'h1' ? 'h2' : 'h3';

  return (
    <section className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Stethoscope className="w-7 h-7 text-[#0D5652]" aria-hidden="true" />
          <HeadingTag className="font-display text-2xl sm:text-3xl font-bold text-[#131B19]">
            {t.upcomingAppointments}
          </HeadingTag>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenCalendar && (
            <button
              type="button"
              onClick={onOpenCalendar}
              className="min-h-[48px] px-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] text-sm sm:text-base font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Calendar className="w-5 h-5 text-[#0D5652]" />
              <span>{t.tabCalendar}</span>
            </button>
          )}
          {canAdd && onOpenAddAppt && (
            <button
              type="button"
              onClick={onOpenAddAppt}
              className="min-h-[48px] px-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border-2 border-[#DFD5C5] text-sm sm:text-base font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-5 h-5 text-[#0D5652]" />
              <span>{t.addAppointment}</span>
            </button>
          )}
          <button
            type="button"
            onClick={shareReport}
            disabled={loading}
            className="min-h-[48px] px-5 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white text-sm sm:text-base font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
            <span>{loading ? t.preparingReport : t.shareDoctorReport}</span>
          </button>
        </div>
      </div>

      {sortedAppointments.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C5] text-center space-y-4">
          <p className="sati-muted text-base text-[#3E4C48]">{t.noAppointments}</p>
          {canAdd && onOpenAddAppt && (
            <button
              type="button"
              onClick={onOpenAddAppt}
              className="min-h-[48px] px-5 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white text-base font-bold inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>{t.addAppointment}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sortedAppointments.map((appt) => {
            const countdown = formatAppointmentCountdown(appt.date, state.language);
            const parsedApptDate = new Date(appt.date + 'T00:00:00');
            const dateLabel = Number.isNaN(parsedApptDate.getTime())
              ? appt.date
              : parsedApptDate.toLocaleDateString(speechLocale, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });
            return (
              <div
                key={appt.id}
                className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#DFD5C5] flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-[#DFD5C5] text-[#0D5652] flex items-center justify-center shrink-0">
                        <Stethoscope className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <CardHeadingTag
                          className={`font-display font-bold text-[#131B19] ${
                            elderlyLargeMode ? 'text-2xl' : 'text-xl'
                          }`}
                        >
                          {appt.doctorName}
                        </CardHeadingTag>
                        <p className="sati-muted text-base text-[#3E4C48]">{appt.specialty}</p>
                      </div>
                    </div>

                    {canDelete && onDeleteAppt && (
                      <button
                        type="button"
                        onClick={() => onDeleteAppt(appt.id)}
                        aria-label={`${t.deleteBtn}: ${appt.doctorName}`}
                        className="w-12 h-12 rounded-xl hover:bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-base sm:text-lg font-bold text-[#0D5652] tabular-nums">
                      {dateLabel} · {appt.time}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm font-bold tabular-nums ${
                        countdown.tone === 'urgent'
                          ? 'text-[#A85208]'
                          : countdown.tone === 'past'
                          ? 'text-[#3E4C48]'
                          : 'text-[#0D5652]'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>{countdown.label}</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-base text-[#3E4C48]">
                    <MapPin className="w-5 h-5 shrink-0 text-[#0D5652] mt-0.5" />
                    <span>{appt.clinic}</span>
                  </div>

                  {appt.notes && (
                    <div className="flex items-start gap-2 text-sm sm:text-base text-[#131B19] pt-2 border-t border-[#DFD5C5]">
                      <FileText className="w-4 h-4 shrink-0 text-[#A85208] mt-1" />
                      <span>{appt.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reportText && (
        <div
          role="region"
          aria-live="polite"
          className="p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] border-2 border-[#0D5652] space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardHeadingTag className="font-display text-xl font-bold text-[#0D5652]">
              {t.doctorReportHeading}
            </CardHeadingTag>
            {copied && (
              <span className="text-sm font-bold text-emerald-800 inline-flex items-center gap-1.5">
                <Copy className="w-4 h-4" aria-hidden="true" />
                {t.copiedNotice}
              </span>
            )}
          </div>
          {usedOfflineFallback && (
            <p className="text-sm font-medium text-amber-900 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
              {t.offlineReportNote}
            </p>
          )}
          <p className="text-base text-[#131B19] leading-relaxed whitespace-pre-line">{reportText}</p>
        </div>
      )}
    </section>
  );
}
