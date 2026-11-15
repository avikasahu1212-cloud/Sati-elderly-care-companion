import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Stethoscope,
  X,
  XCircle,
} from 'lucide-react';
import { getLocalDateStr } from '../data/seedData';
import { getT, LANGUAGES } from '../i18n/translations';
import { Appointment, DoseLog, LanguageCode, Medication } from '../types';
import { PillGraphic } from './PillGraphic';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  medications: Medication[];
  doseLogs: DoseLog[];
  appointments: Appointment[];
}

export function CalendarModal({
  isOpen,
  onClose,
  language,
  medications,
  doseLogs,
  appointments,
}: CalendarModalProps) {
  const t = getT(language);
  const speechLocale = LANGUAGES.find((l) => l.code === language)?.speechLocale || 'en-IN';
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateStr(0));
  const [monthCursor, setMonthCursor] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const weekdayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(speechLocale, { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 7 + i)));
  }, [speechLocale]);

  const monthDays = useMemo(() => {
    const { year, month } = monthCursor;
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startWeekday = firstDay.getDay();

    const cells: Array<{ dateStr: string; dayNum: number } | null> = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dateStr, dayNum: d });
    }
    return {
      monthLabel: firstDay.toLocaleDateString(speechLocale, { month: 'long', year: 'numeric' }),
      cells,
    };
  }, [monthCursor, speechLocale]);

  if (!isOpen) return null;

  const shiftMonth = (delta: number) => {
    setMonthCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const jumpToToday = () => {
    const today = getLocalDateStr(0);
    const now = new Date();
    setSelectedDate(today);
    setMonthCursor({ year: now.getFullYear(), month: now.getMonth() });
  };

  const activeMedIds = new Set(medications.map((m) => m.id));
  const dayLogs = doseLogs
    .filter((d) => d.date === selectedDate && activeMedIds.has(d.medicationId))
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const dayAppointments = appointments.filter((a) => a.date === selectedDate);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t.calendarTitle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="sati-card bg-[#FAF7F2] w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden border border-[#DFD5C5] shadow-2xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-7 py-4 sm:py-5 bg-white border-b border-[#DFD5C5]">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-[#0D5652]" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold">{t.calendarTitle}</h2>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex bg-[#F2ECE1] p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`min-h-[44px] px-4 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
                  viewMode === 'month' ? 'bg-white text-[#0D5652] shadow-sm' : 'text-[#3E4C48]'
                }`}
              >
                {t.monthView}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('day')}
                className={`min-h-[44px] px-4 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
                  viewMode === 'day' ? 'bg-white text-[#0D5652] shadow-sm' : 'text-[#3E4C48]'
                }`}
              >
                {t.dayView}
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.cancelBtn}
              className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-[#F2ECE1] cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-7 overflow-y-auto space-y-6">
          {viewMode === 'month' && (
            <div className="bg-white rounded-3xl border border-[#DFD5C5] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    aria-label={t.prevMonthLabel}
                    className="w-11 h-11 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#131B19]" />
                  </button>
                  <span className="font-display text-xl sm:text-2xl font-bold px-1">
                    {monthDays.monthLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    aria-label={t.nextMonthLabel}
                    className="w-11 h-11 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-[#131B19]" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={jumpToToday}
                  className="min-h-[44px] px-4 rounded-xl bg-[#FAF7F2] text-base font-bold text-[#0D5652] hover:bg-[#F2ECE1] cursor-pointer"
                >
                  {t.tabToday}
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center text-sm font-bold text-[#3E4C48]">
                {weekdayLabels.map((d, i) => (
                  <div key={`${d}-${i}`} className="py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {monthDays.cells.map((cell, idx) => {
                  if (!cell) return <div key={`empty-${idx}`} />;
                  const logs = doseLogs.filter(
                    (l) => l.date === cell.dateStr && activeMedIds.has(l.medicationId)
                  );
                  const hasAppt = appointments.some((a) => a.date === cell.dateStr);
                  const takenCount = logs.filter(
                    (l) => l.status === 'verified_taken' || l.status === 'said_taken'
                  ).length;
                  const missedCount = logs.filter((l) => l.status === 'missed').length;
                  const allDone = logs.length > 0 && takenCount === logs.length;
                  const isRed =
                    logs.length > 0 &&
                    missedCount > 0 &&
                    (takenCount === 0 || missedCount >= Math.ceil(logs.length / 2));
                  const isAmber = logs.length > 0 && !allDone && !isRed && (takenCount > 0 || missedCount > 0);
                  const isSelected = cell.dateStr === selectedDate;
                  const toneClasses = isSelected
                    ? 'bg-[#0D5652] text-white border-[#0D5652]'
                    : allDone
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 hover:bg-emerald-100'
                    : isRed
                    ? 'bg-rose-50 border-rose-400 text-rose-950 hover:bg-rose-100'
                    : isAmber
                    ? 'bg-amber-50 border-amber-400 text-amber-950 hover:bg-amber-100'
                    : 'bg-[#FAF7F2] hover:bg-[#F2ECE1] border-[#DFD5C5] text-[#131B19]';
                  return (
                    <button
                      key={cell.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(cell.dateStr);
                        setViewMode('day');
                      }}
                      className={`min-h-[52px] rounded-2xl flex flex-col items-center justify-center border-2 transition-colors cursor-pointer tabular-nums ${toneClasses}`}
                    >
                      <span className="text-base font-bold">{cell.dayNum}</span>
                      {logs.length > 0 && (
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-teal-100' : 'opacity-80'}`}>
                          {takenCount}/{logs.length}
                          {hasAppt ? ' ·' : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#DFD5C5] text-xs font-semibold text-[#3E4C48]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-500" />
                  {t.legendAllTaken}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-100 border border-amber-500" />
                  {t.legendPartial}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-100 border border-rose-500" />
                  {t.legendMissed}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString(speechLocale, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </h3>

            {dayAppointments.length > 0 && (
              <div className="space-y-3">
                {dayAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-5 rounded-2xl bg-white border border-[#DFD5C5] flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#F2ECE1] text-[#0D5652] flex items-center justify-center shrink-0">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-lg">{appt.doctorName}</div>
                      <div className="sati-muted text-base text-[#3E4C48]">
                        {appt.specialty} · <span className="tabular-nums">{appt.time}</span> · {appt.clinic}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dayLogs.length === 0 ? (
              <div className="p-7 rounded-2xl bg-white border border-[#DFD5C5] text-center text-base text-[#3E4C48]">
                {t.noDosesForDate}
              </div>
            ) : (
              <div className="space-y-3">
                {dayLogs.map((log) => {
                  const med = medications.find((m) => m.id === log.medicationId);
                  if (!med) return null;
                  return (
                    <div
                      key={log.id}
                      className="p-5 rounded-2xl bg-white border border-[#DFD5C5] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <PillGraphic color={med.pillColor} shape={med.pillShape} size={52} />
                        <div className="min-w-0">
                          <div className="font-bold text-lg truncate">
                            {med.name} {med.dose}
                          </div>
                          <div className="sati-muted text-base text-[#3E4C48] tabular-nums">
                            {log.scheduledTime} · {med.routineCue}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-base font-bold shrink-0">
                        {log.status === 'verified_taken' && (
                          <span className="text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-5 h-5" />
                            {t.statusVerifiedTaken}
                          </span>
                        )}
                        {log.status === 'said_taken' && (
                          <span className="text-[#0D5652] flex items-center gap-1.5">
                            <CheckCircle2 className="w-5 h-5" />
                            {t.statusSaidTaken}
                          </span>
                        )}
                        {log.status === 'pending' && (
                          <span className="text-[#A85208] flex items-center gap-1.5">
                            <Clock className="w-5 h-5" />
                            {t.statusPending}
                          </span>
                        )}
                        {log.status === 'missed' && (
                          <span className="text-rose-800 flex items-center gap-1.5">
                            <XCircle className="w-5 h-5" />
                            {t.statusMissed}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
