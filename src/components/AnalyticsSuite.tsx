import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Info,
  Minus,
  ShieldAlert,
  Stethoscope,
  TrendingUp,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';
import { getLocalDateStr } from '../data/seedData';
import { formatTemplate, getT, LANGUAGES } from '../i18n/translations';
import { resolveAlertText } from '../store/useCareStore';
import { CareAlert, CareCircleState, DoseLog, DoseStatus, Medication } from '../types';
import { PillGraphic } from './PillGraphic';

export interface DailyMetricPoint {
  dateStr: string;
  shortLabel: string;
  weekdayShort: string;
  taken: number;
  missed: number;
  pending: number;
  total: number;
  pct: number;
}

export interface MedicineStat {
  med: Medication;
  taken: number;
  verified: number;
  missed: number;
  total: number;
  pct: number;
  verifiedPct: number;
}

export interface TimeWindowStat {
  id: 'morning' | 'afternoon' | 'evening' | 'night';
  labelKey: 'windowMorning' | 'windowAfternoon' | 'windowEvening' | 'windowNight';
  total: number;
  missed: number;
  missPct: number;
  shareOfMissedPct: number;
}

export interface CareAnalytics {
  thirtyDayPct: number;
  thirtyDayTaken: number;
  thirtyDayTotal: number;
  weeklyPct: number;
  weeklyTaken: number;
  weeklyTotal: number;
  verifiedRatePct: number;
  currentStreak: number;
  bestStreak: number;
  trendPoints: DailyMetricPoint[];
  weeklyBars: DailyMetricPoint[];
  perMedicine: MedicineStat[];
  timeWindows: TimeWindowStat[];
  topMissedWindow: TimeWindowStat | null;
  peakMissedSlot: { time: string; count: number } | null;
  totalMissed30d: number;
}

function getWindowId(hhmm: string): TimeWindowStat['id'] {
  const hour = Number(hhmm.split(':')[0] || 0);
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function computeCareAnalytics(state: CareCircleState): CareAnalytics {
  const speechLocale = LANGUAGES.find((l) => l.code === state.language)?.speechLocale || 'en-IN';
  const activeMedIds = new Set(state.medications.map((m) => m.id));
  const activeLogs = state.doseLogs.filter((d) => activeMedIds.has(d.medicationId));
  const trendPoints: DailyMetricPoint[] = [];

  for (let offset = -29; offset <= 0; offset++) {
    const dateStr = getLocalDateStr(offset);
    const allLogs = activeLogs.filter((d) => d.date === dateStr);
    const evaluatedLogs = offset === 0 ? allLogs.filter((d) => d.status !== 'pending') : allLogs;
    const taken = evaluatedLogs.filter(
      (d) => d.status === 'verified_taken' || d.status === 'said_taken'
    ).length;
    const missed = evaluatedLogs.filter((d) => d.status === 'missed').length;
    const pending = allLogs.filter((d) => d.status === 'pending').length;
    const total = evaluatedLogs.length;
    const pct = total > 0 ? Math.round((taken / total) * 100) : 0;
    const dateObj = new Date(dateStr + 'T00:00:00');
    trendPoints.push({
      dateStr,
      shortLabel: dateObj.toLocaleDateString(speechLocale, { month: 'short', day: 'numeric' }),
      weekdayShort: dateObj.toLocaleDateString(speechLocale, { weekday: 'short' }),
      taken,
      missed,
      pending,
      total,
      pct,
    });
  }

  const thirtyDayTaken = trendPoints.reduce((sum, p) => sum + p.taken, 0);
  const thirtyDayTotal = trendPoints.reduce((sum, p) => sum + p.total, 0);
  const thirtyDayPct = thirtyDayTotal > 0 ? Math.round((thirtyDayTaken / thirtyDayTotal) * 100) : 0;

  const weeklyBars = trendPoints.slice(-7);
  const weeklyTaken = weeklyBars.reduce((sum, p) => sum + p.taken, 0);
  const weeklyTotal = weeklyBars.reduce((sum, p) => sum + p.total, 0);
  const weeklyPct = weeklyTotal > 0 ? Math.round((weeklyTaken / weeklyTotal) * 100) : 0;

  const last30Dates = new Set(trendPoints.map((p) => p.dateStr));
  const last30Logs = activeLogs.filter((d) => last30Dates.has(d.date) && d.status !== 'pending');
  const taken30Logs = last30Logs.filter(
    (d) => d.status === 'verified_taken' || d.status === 'said_taken'
  );
  const verified30Logs = taken30Logs.filter((d) => d.status === 'verified_taken');
  const verifiedRatePct =
    taken30Logs.length > 0 ? Math.round((verified30Logs.length / taken30Logs.length) * 100) : 0;

  // Streak calculation across past 30 days
  let bestStreak = 0;
  let running = 0;
  for (let i = 0; i < trendPoints.length - 1; i++) {
    const p = trendPoints[i];
    if (p.total > 0 && p.taken === p.total) {
      running += 1;
      if (running > bestStreak) bestStreak = running;
    } else if (p.total > 0) {
      running = 0;
    }
  }
  const todayPoint = trendPoints[trendPoints.length - 1];
  const todayAllScheduledDone =
    todayPoint && todayPoint.pending === 0 && todayPoint.total > 0 && todayPoint.taken === todayPoint.total;
  const currentStreak = todayAllScheduledDone ? running + 1 : running;
  if (currentStreak > bestStreak) bestStreak = currentStreak;

  // Per-medicine breakdown
  const perMedicine: MedicineStat[] = state.medications.map((med) => {
    const logs = last30Logs.filter((d) => d.medicationId === med.id);
    const taken = logs.filter(
      (d) => d.status === 'verified_taken' || d.status === 'said_taken'
    ).length;
    const verified = logs.filter((d) => d.status === 'verified_taken').length;
    const missed = logs.filter((d) => d.status === 'missed').length;
    const total = logs.length;
    return {
      med,
      taken,
      verified,
      missed,
      total,
      pct: total > 0 ? Math.round((taken / total) * 100) : 0,
      verifiedPct: taken > 0 ? Math.round((verified / taken) * 100) : 0,
    };
  });

  // Most-missed-times insight
  const windowDefs: Array<{ id: TimeWindowStat['id']; labelKey: TimeWindowStat['labelKey'] }> = [
    { id: 'morning', labelKey: 'windowMorning' },
    { id: 'afternoon', labelKey: 'windowAfternoon' },
    { id: 'evening', labelKey: 'windowEvening' },
    { id: 'night', labelKey: 'windowNight' },
  ];

  const totalMissed30d = last30Logs.filter((d) => d.status === 'missed').length;
  const slotCounts = new Map<string, number>();
  last30Logs.forEach((d) => {
    if (d.status === 'missed') {
      slotCounts.set(d.scheduledTime, (slotCounts.get(d.scheduledTime) || 0) + 1);
    }
  });

  const timeWindows: TimeWindowStat[] = windowDefs.map((w) => {
    const matching = last30Logs.filter((d) => getWindowId(d.scheduledTime) === w.id);
    const missed = matching.filter((d) => d.status === 'missed').length;
    return {
      id: w.id,
      labelKey: w.labelKey,
      total: matching.length,
      missed,
      missPct: matching.length > 0 ? Math.round((missed / matching.length) * 100) : 0,
      shareOfMissedPct: totalMissed30d > 0 ? Math.round((missed / totalMissed30d) * 100) : 0,
    };
  });

  const topMissedWindow =
    totalMissed30d > 0
      ? [...timeWindows].sort((a, b) => b.missed - a.missed || b.missPct - a.missPct)[0]
      : null;

  let peakMissedSlot: { time: string; count: number } | null = null;
  slotCounts.forEach((count, time) => {
    if (!peakMissedSlot || count > peakMissedSlot.count) {
      peakMissedSlot = { time, count };
    }
  });

  return {
    thirtyDayPct,
    thirtyDayTaken,
    thirtyDayTotal,
    weeklyPct,
    weeklyTaken,
    weeklyTotal,
    verifiedRatePct,
    currentStreak,
    bestStreak,
    trendPoints,
    weeklyBars,
    perMedicine,
    timeWindows,
    topMissedWindow,
    peakMissedSlot,
    totalMissed30d,
  };
}

export type DayTone = 'green' | 'amber' | 'red' | 'neutral';

export function classifyDayStatus(logs: DoseLog[]): DayTone {
  if (logs.length === 0) return 'neutral';
  const takenCount = logs.filter(
    (d) => d.status === 'verified_taken' || d.status === 'said_taken'
  ).length;
  const missedCount = logs.filter((d) => d.status === 'missed').length;

  if (takenCount === logs.length) return 'green';
  if (missedCount > 0 && (takenCount === 0 || missedCount >= Math.ceil(logs.length / 2))) {
    return 'red';
  }
  if (takenCount > 0 || missedCount > 0) return 'amber';
  return 'neutral';
}

interface MonthlyAdherenceCalendarProps {
  state: CareCircleState;
  allowVerifyActions?: boolean;
  onVerifyDose?: (doseId: string, by: 'caretaker' | 'pillbox_sensor', note: string) => void;
  onMarkMissed?: (doseId: string) => void;
}

export function MonthlyAdherenceCalendar({
  state,
  allowVerifyActions = false,
  onVerifyDose,
  onMarkMissed,
}: MonthlyAdherenceCalendarProps) {
  const t = getT(state.language);
  const speechLocale = LANGUAGES.find((l) => l.code === state.language)?.speechLocale || 'en-IN';
  const todayStr = getLocalDateStr(0);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [monthCursor, setMonthCursor] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const weekdayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(speechLocale, { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 7 + i)));
  }, [speechLocale]);

  const activeMedIds = useMemo(
    () => new Set(state.medications.map((m) => m.id)),
    [state.medications]
  );

  const monthData = useMemo(() => {
    const { year, month } = monthCursor;
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startWeekday = firstDay.getDay();

    const cells: Array<{
      dateStr: string;
      dayNum: number;
      tone: DayTone;
      takenCount: number;
      totalCount: number;
      hasAppt: boolean;
    } | null> = [];

    for (let i = 0; i < startWeekday; i++) cells.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const logs = state.doseLogs.filter(
        (l) => l.date === dateStr && activeMedIds.has(l.medicationId)
      );
      const takenCount = logs.filter(
        (l) => l.status === 'verified_taken' || l.status === 'said_taken'
      ).length;
      const tone = classifyDayStatus(logs);
      const hasAppt = state.appointments.some((a) => a.date === dateStr);
      cells.push({
        dateStr,
        dayNum: d,
        tone,
        takenCount,
        totalCount: logs.length,
        hasAppt,
      });
    }

    return {
      monthLabel: firstDay.toLocaleDateString(speechLocale, { month: 'long', year: 'numeric' }),
      cells,
    };
  }, [activeMedIds, monthCursor, speechLocale, state.appointments, state.doseLogs]);

  const shiftMonth = (delta: number) => {
    setMonthCursor((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const selectedLogs = useMemo(() => {
    const activeMedIds = new Set(state.medications.map((m) => m.id));
    return state.doseLogs
      .filter((d) => d.date === selectedDate && activeMedIds.has(d.medicationId))
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [selectedDate, state.doseLogs, state.medications]);

  const selectedAppts = useMemo(
    () => state.appointments.filter((a) => a.date === selectedDate),
    [selectedDate, state.appointments]
  );

  const statusText = (status: DoseStatus) => {
    if (status === 'verified_taken') return { label: t.statusVerifiedTaken, cls: 'text-emerald-800', icon: CheckCircle2 };
    if (status === 'said_taken') return { label: t.statusSaidTaken, cls: 'text-[#0D5652]', icon: UserCheck };
    if (status === 'missed') return { label: t.statusMissed, cls: 'text-rose-800', icon: XCircle };
    return { label: t.statusPending, cls: 'text-[#A85208]', icon: Clock };
  };

  return (
    <section className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2.5 text-[#131B19]">
            <CalendarIcon className="w-6 h-6 text-[#0D5652]" />
            <span>{t.monthCalendarTitle}</span>
          </h2>
          <p className="sati-muted text-sm text-[#3E4C48] mt-1">{t.tapDayPrompt}</p>
        </div>

        {/* Clean inline legend without pill enclosures */}
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[#3E4C48]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block" aria-hidden="true" />
            <span>{t.legendAllTaken}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-500 inline-block" aria-hidden="true" />
            <span>{t.legendPartial}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-rose-500 inline-block" aria-hidden="true" />
            <span>{t.legendMissed}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left: Month Calendar Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="font-display text-xl sm:text-2xl font-bold text-[#131B19]">
              {monthData.monthLabel}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label={t.prevMonthLabel}
                className="w-11 h-11 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setMonthCursor({ year: now.getFullYear(), month: now.getMonth() });
                  setSelectedDate(todayStr);
                }}
                className="min-h-[44px] px-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] text-sm font-bold text-[#0D5652] cursor-pointer transition-colors"
              >
                {t.todayWord}
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label={t.nextMonthLabel}
                className="w-11 h-11 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs sm:text-sm font-bold text-[#3E4C48]">
            {weekdayLabels.map((lbl, idx) => (
              <div key={`${lbl}-${idx}`} className="py-1.5">
                {lbl}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {monthData.cells.map((cell, idx) => {
              if (!cell) return <div key={`blank-${idx}`} className="min-h-[54px]" />;
              const isSelected = cell.dateStr === selectedDate;
              const isToday = cell.dateStr === todayStr;

              const toneStyle =
                cell.tone === 'green'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 hover:bg-emerald-100'
                  : cell.tone === 'amber'
                  ? 'bg-amber-50 border-amber-400 text-amber-950 hover:bg-amber-100'
                  : cell.tone === 'red'
                  ? 'bg-rose-50 border-rose-400 text-rose-950 hover:bg-rose-100'
                  : 'bg-[#FAF7F2] border-[#DFD5C5] text-[#3E4C48] hover:bg-[#F2ECE1]';

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(cell.dateStr)}
                  aria-pressed={isSelected}
                  className={`min-h-[54px] sm:min-h-[60px] rounded-2xl border-2 p-1.5 flex flex-col items-center justify-between transition-all cursor-pointer tabular-nums ${toneStyle} ${
                    isSelected ? 'ring-2 ring-[#0D5652] ring-offset-2 font-extrabold' : ''
                  }`}
                >
                  <div className="w-full flex items-center justify-between px-0.5">
                    <span className={`text-sm font-bold ${isToday ? 'underline underline-offset-2' : ''}`}>
                      {cell.dayNum}
                    </span>
                    {cell.hasAppt && <Stethoscope className="w-3.5 h-3.5 text-[#0D5652]" />}
                  </div>

                  {cell.totalCount > 0 ? (
                    <div className="flex items-center gap-0.5 text-[11px] font-bold">
                      {cell.tone === 'green' && <Check className="w-3 h-3 text-emerald-700" />}
                      {cell.tone === 'amber' && <Minus className="w-3 h-3 text-amber-800" />}
                      {cell.tone === 'red' && <X className="w-3 h-3 text-rose-700" />}
                      <span>
                        {cell.takenCount}/{cell.totalCount}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] opacity-40">—</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Doses Inspector */}
        <div className="lg:col-span-5 bg-[#FAF7F2] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#DFD5C5]">
            <h3 className="font-display text-xl font-bold text-[#131B19]">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString(speechLocale, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </h3>
            {selectedLogs.length > 0 && (
              <span className="text-sm font-bold text-[#0D5652] tabular-nums">
                {
                  selectedLogs.filter(
                    (d) => d.status === 'verified_taken' || d.status === 'said_taken'
                  ).length
                }
                /{selectedLogs.length} {t.dosesWord}
              </span>
            )}
          </div>

          {selectedAppts.length > 0 && (
            <div className="space-y-2 pb-2 border-b border-[#DFD5C5]">
              {selectedAppts.map((appt) => (
                <div key={appt.id} className="flex items-start gap-3 py-1.5">
                  <Stethoscope className="w-5 h-5 text-[#0D5652] shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-bold text-[#131B19]">{appt.doctorName}</div>
                    <div className="text-[#3E4C48] tabular-nums">
                      {appt.time} · {appt.clinic}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedLogs.length === 0 ? (
            <p className="sati-muted text-base text-[#3E4C48] py-6 text-center">{t.noDosesForDate}</p>
          ) : (
            <div className="divide-y divide-[#DFD5C5] max-h-[380px] overflow-y-auto pr-1">
              {selectedLogs.map((log) => {
                const med = state.medications.find((m) => m.id === log.medicationId);
                if (!med) return null;
                const st = statusText(log.status);
                const StatusIcon = st.icon;
                return (
                  <div key={log.id} className="py-3.5 first:pt-1 last:pb-1 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <PillGraphic color={med.pillColor} shape={med.pillShape} size={42} />
                        <div className="min-w-0">
                          <div className="font-bold text-base truncate text-[#131B19]">
                            {med.name} {med.dose}
                          </div>
                          <div className="text-xs text-[#3E4C48] tabular-nums">
                            {log.scheduledTime} · {med.routineCue}
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold shrink-0 ${st.cls}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span>{st.label}</span>
                      </span>
                    </div>

                    {allowVerifyActions && log.status !== 'verified_taken' && onVerifyDose && (
                      <div className="flex flex-wrap gap-2 pl-[54px]">
                        <button
                          type="button"
                          onClick={() => onVerifyDose(log.id, 'caretaker', t.statusVerifiedTaken)}
                          className="min-h-[38px] px-3 rounded-xl bg-[#0D5652] hover:bg-[#09413E] text-white text-xs font-bold cursor-pointer transition-colors"
                        >
                          {t.verifyInPerson}
                        </button>
                        {log.status === 'pending' && onMarkMissed && (
                          <button
                            type="button"
                            onClick={() => onMarkMissed(log.id)}
                            className="min-h-[38px] px-3 rounded-xl bg-white hover:bg-rose-50 border border-[#DFD5C5] text-xs font-bold text-[#3E4C48] hover:text-rose-800 cursor-pointer transition-colors"
                          >
                            {t.markMissedBtn}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function AdherenceTrendChart({
  points,
  language,
}: {
  points: DailyMetricPoint[];
  language: CareCircleState['language'];
}) {
  const t = getT(language);
  const [range, setRange] = useState<'14d' | '30d'>('30d');
  const sliced = useMemo(() => (range === '14d' ? points.slice(-14) : points), [points, range]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const activePoints = sliced.filter((p) => p.total > 0);
  const avgPct =
    activePoints.length > 0
      ? Math.round(activePoints.reduce((s, p) => s + p.pct, 0) / activePoints.length)
      : 0;

  const width = 560;
  const height = 190;
  const padL = 36;
  const padR = 14;
  const padT = 16;
  const padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const coords = activePoints.map((p, idx) => {
    const x =
      activePoints.length <= 1 ? padL + innerW / 2 : padL + (idx / (activePoints.length - 1)) * innerW;
    const y = padT + innerH - (p.pct / 100) * innerH;
    return { x, y, point: p, idx };
  });

  const linePath =
    coords.length > 1
      ? coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
      : '';
  const areaPath =
    coords.length > 1
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padT + innerH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padT + innerH).toFixed(1)} Z`
      : '';

  const inspected =
    selectedIdx !== null && coords[selectedIdx]
      ? coords[selectedIdx].point
      : coords[coords.length - 1]?.point;

  return (
    <section className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2.5 text-[#131B19]">
            <TrendingUp className="w-6 h-6 text-[#0D5652]" />
            <span>{t.adherenceTrendTitle}</span>
          </h2>
          <div className="sati-muted text-sm text-[#3E4C48] mt-1 tabular-nums">
            {t.averageAdherenceWord}: <strong className="text-[#0D5652]">{avgPct}%</strong>
            {inspected && (
              <>
                {' '}
                · {inspected.shortLabel}:{' '}
                <strong>
                  {inspected.taken}/{inspected.total} ({inspected.pct}%)
                </strong>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F2ECE1] rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setRange('14d');
              setSelectedIdx(null);
            }}
            className={`min-h-[40px] px-3.5 rounded-xl text-sm font-bold cursor-pointer transition-colors whitespace-nowrap ${
              range === '14d' ? 'bg-white text-[#0D5652] shadow-sm' : 'text-[#3E4C48]'
            }`}
          >
            {t.last14Days}
          </button>
          <button
            type="button"
            onClick={() => {
              setRange('30d');
              setSelectedIdx(null);
            }}
            className={`min-h-[40px] px-3.5 rounded-xl text-sm font-bold cursor-pointer transition-colors whitespace-nowrap ${
              range === '30d' ? 'bg-white text-[#0D5652] shadow-sm' : 'text-[#3E4C48]'
            }`}
          >
            {t.last30Days}
          </button>
        </div>
      </div>

      {activePoints.length === 0 ? (
        <p className="sati-muted text-base text-[#3E4C48] py-10 text-center">{t.noAnalyticsYet}</p>
      ) : (
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none"
            role="img"
            aria-label={t.adherenceTrendTitle}
          >
            <defs>
              <linearGradient id="satiTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0D5652" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#0D5652" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {[0, 50, 100].map((val) => {
              const y = padT + innerH - (val / 100) * innerH;
              return (
                <g key={val}>
                  <line
                    x1={padL}
                    x2={width - padR}
                    y1={y}
                    y2={y}
                    stroke="#DFD5C5"
                    strokeDasharray={val === 0 ? undefined : '4 4'}
                    strokeWidth="1"
                  />
                  <text
                    x={padL - 6}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#3E4C48"
                    fontFamily="var(--font-body)"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {areaPath && <path d={areaPath} fill="url(#satiTrendFill)" />}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#0D5652"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {coords.map((c) => {
              const isHighlighted =
                selectedIdx === c.idx || (selectedIdx === null && c.idx === coords.length - 1);
              const dotColor =
                c.point.total === 0
                  ? '#94A3B8'
                  : c.point.pct === 100
                  ? '#0D5652'
                  : c.point.pct >= 60
                  ? '#C96A12'
                  : '#B91C1C';
              return (
                <g key={c.point.dateStr}>
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isHighlighted ? 5.5 : 3.2}
                    fill={dotColor}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={14}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setSelectedIdx(c.idx)}
                    onClick={() => setSelectedIdx(c.idx)}
                  />
                </g>
              );
            })}

            {Array.from(
              new Set(
                coords.length === 1
                  ? [0]
                  : [0, Math.floor((coords.length - 1) / 2), coords.length - 1]
              )
            ).map((idx) => {
              const c = coords[idx];
              if (!c) return null;
              return (
                <text
                  key={`tick-${idx}`}
                  x={c.x}
                  y={height - 6}
                  textAnchor={
                    coords.length === 1
                      ? 'middle'
                      : idx === 0
                      ? 'start'
                      : idx === coords.length - 1
                      ? 'end'
                      : 'middle'
                  }
                  fontSize="11"
                  fill="#3E4C48"
                  fontFamily="var(--font-body)"
                >
                  {c.point.shortLabel}
                </text>
              );
            })}
          </svg>
        </div>
      )}
    </section>
  );
}

export function WeeklyBarChart({
  bars,
  language,
}: {
  bars: DailyMetricPoint[];
  language: CareCircleState['language'];
}) {
  const t = getT(language);
  const hasAny = bars.some((b) => b.total > 0);

  return (
    <section className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2.5 text-[#131B19]">
          <BarChart3 className="w-6 h-6 text-[#0D5652]" />
          <span>{t.weeklyBarTitle}</span>
        </h2>
        <span className="sati-muted text-sm font-semibold text-[#3E4C48] tabular-nums">
          {bars.reduce((s, b) => s + b.taken, 0)}/{bars.reduce((s, b) => s + b.total, 0)} {t.dosesWord}
        </span>
      </div>

      {!hasAny ? (
        <p className="sati-muted text-base text-[#3E4C48] py-10 text-center">{t.noAnalyticsYet}</p>
      ) : (
        <div className="grid grid-cols-7 gap-1.5 sm:gap-3 items-end pt-3">
          {bars.map((day) => {
            const barColor =
              day.total === 0
                ? 'bg-[#CFC5B4]'
                : day.pct === 100
                ? 'bg-[#0D5652]'
                : day.pct >= 50
                ? 'bg-[#C96A12]'
                : 'bg-[#B91C1C]';
            return (
              <div key={day.dateStr} className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-[#3E4C48] tabular-nums">
                  {day.total > 0 ? `${day.pct}%` : '—'}
                </span>
                <div className="w-full max-w-[44px] h-36 bg-[#F2ECE1] rounded-2xl overflow-hidden flex items-end p-0.5">
                  <div
                    className={`w-full rounded-xl transition-all duration-300 ${barColor}`}
                    style={{ height: `${day.total > 0 ? Math.max(14, day.pct) : 8}%` }}
                  />
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-[#131B19]">{day.weekdayShort}</div>
                  <div className="text-[11px] text-[#3E4C48] tabular-nums">
                    {day.taken}/{day.total}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function PerMedicineBreakdown({
  items,
  language,
}: {
  items: MedicineStat[];
  language: CareCircleState['language'];
}) {
  const t = getT(language);

  return (
    <section className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-5">
      <h2 className="font-display text-2xl font-bold text-[#131B19]">{t.perMedicineTitle}</h2>

      {items.length === 0 ? (
        <p className="sati-muted text-base text-[#3E4C48] py-8 text-center">{t.noMedicinesYetTitle}</p>
      ) : (
        <div className="divide-y divide-[#DFD5C5]">
          {items.map((item) => {
            const barFill =
              item.pct >= 90 ? 'bg-[#0D5652]' : item.pct >= 70 ? 'bg-[#C96A12]' : 'bg-[#B91C1C]';
            return (
              <div key={item.med.id} className="py-4 first:pt-1 last:pb-1 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <PillGraphic
                      color={item.med.pillColor}
                      shape={item.med.pillShape}
                      size={44}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-lg text-[#131B19] truncate">
                        {item.med.name} {item.med.dose}
                      </div>
                      <div className="sati-muted text-sm text-[#3E4C48] tabular-nums">
                        {formatTemplate(t.takenOfTotal, { taken: item.taken, total: item.total })} ·{' '}
                        {formatTemplate(t.missedCountLabel, { count: item.missed })} ·{' '}
                        {formatTemplate(t.verifiedShareLabel, { pct: item.verifiedPct })}
                      </div>
                    </div>
                  </div>
                  <span className="font-display text-2xl font-extrabold text-[#131B19] tabular-nums shrink-0">
                    {item.pct}%
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-[#F2ECE1] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barFill}`}
                    style={{ width: `${Math.max(item.total > 0 ? 4 : 0, item.pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function MostMissedTimesCard({
  analytics,
  language,
}: {
  analytics: CareAnalytics;
  language: CareCircleState['language'];
}) {
  const t = getT(language);
  const { timeWindows, topMissedWindow, peakMissedSlot, totalMissed30d } = analytics;

  return (
    <section className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-5">
      <h2 className="font-display text-2xl font-bold flex items-center gap-2.5 text-[#131B19]">
        <Clock className="w-6 h-6 text-[#A85208]" />
        <span>{t.mostMissedTimesTitle}</span>
      </h2>

      {totalMissed30d === 0 || !topMissedWindow ? (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
          <p className="text-base font-medium text-emerald-950">{t.noMissedInsight}</p>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C5] space-y-2">
          <div className="font-bold text-base text-[#131B19]">
            {formatTemplate(t.missedInsightSummary, {
              window: t[topMissedWindow.labelKey],
              pct: topMissedWindow.shareOfMissedPct,
              missed: topMissedWindow.missed,
              totalMissed: totalMissed30d,
            })}
          </div>
          {peakMissedSlot && (
            <div className="text-sm font-bold text-[#A85208] tabular-nums">
              {formatTemplate(t.missedPeakSlot, { time: peakMissedSlot.time })}
            </div>
          )}
          <p className="sati-muted text-sm text-[#3E4C48]">{t.missedInsightTip}</p>
        </div>
      )}

      <div className="space-y-3.5">
        {timeWindows.map((win) => {
          const isTop = topMissedWindow?.id === win.id && win.missed > 0;
          return (
            <div key={win.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className={isTop ? 'text-[#A85208] font-bold' : 'text-[#131B19]'}>
                  {t[win.labelKey]}
                </span>
                <span className="text-[#3E4C48] tabular-nums">
                  {win.missed}/{win.total} {t.statusMissed} ({win.missPct}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#F2ECE1] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    win.missed === 0 ? 'bg-emerald-600' : isTop ? 'bg-[#B91C1C]' : 'bg-[#C96A12]'
                  }`}
                  style={{ width: `${win.missed === 0 ? 0 : Math.max(8, win.shareOfMissedPct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AlertsTimelineCard({
  alerts,
  language,
  onAcknowledgeAlert,
}: {
  alerts: CareAlert[];
  language: CareCircleState['language'];
  onAcknowledgeAlert: (alertId: string) => void;
}) {
  const t = getT(language);
  const speechLocale = LANGUAGES.find((l) => l.code === language)?.speechLocale || 'en-IN';

  return (
    <section className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2.5 text-[#131B19]">
          <Bell className="w-6 h-6 text-[#A85208]" />
          <span>{t.alertsTimelineTitle}</span>
        </h2>
        <span className="text-sm font-bold text-[#3E4C48] tabular-nums">
          {alerts.filter((a) => !a.acknowledged).length} / {alerts.length}
        </span>
      </div>

      {alerts.length === 0 ? (
        <p className="sati-muted text-base text-[#3E4C48] py-4">{t.allClearAlerts}</p>
      ) : (
        <div className="relative space-y-5 max-h-[420px] overflow-y-auto pr-1">
          {alerts.slice(0, 8).map((alert) => {
            const localized = resolveAlertText(alert, language);
            const Icon =
              alert.severity === 'critical'
                ? ShieldAlert
                : alert.severity === 'warning'
                ? AlertTriangle
                : Info;
            const iconWrap =
              alert.severity === 'critical'
                ? 'bg-rose-100 text-rose-800'
                : alert.severity === 'warning'
                ? 'bg-amber-100 text-[#A85208]'
                : 'bg-[#F2ECE1] text-[#0D5652]';

            return (
              <div
                key={alert.id}
                className="flex items-start gap-3.5 pb-4 border-b border-[#DFD5C5] last:border-0 last:pb-0"
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconWrap}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="font-bold text-base text-[#131B19]">{localized.title}</div>
                  <p className="sati-muted text-sm text-[#3E4C48] leading-snug">
                    {localized.message}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-[#3E4C48] tabular-nums">
                      {new Date(alert.createdAt).toLocaleString(speechLocale, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {!alert.acknowledged ? (
                      <button
                        type="button"
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="min-h-[38px] px-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] text-xs font-bold text-[#131B19] cursor-pointer transition-colors"
                      >
                        {t.acknowledgeBtn}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-800">{t.acknowledgedWord}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function StreakKpiBadge({
  currentStreak,
  bestStreak,
  language,
}: {
  currentStreak: number;
  bestStreak: number;
  language: CareCircleState['language'];
}) {
  const t = getT(language);
  return (
    <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-5">
      <div className="sati-muted text-sm font-semibold text-[#3E4C48] flex items-center gap-1.5">
        <Flame className="w-4 h-4 text-[#A85208]" />
        <span>{t.streakCounterTitle}</span>
      </div>
      <div className="font-display text-4xl font-extrabold text-[#A85208] tabular-nums mt-1.5">
        {currentStreak} <span className="text-xl font-bold">{t.daysWord}</span>
      </div>
      <div className="text-xs font-semibold text-[#3E4C48] mt-1 tabular-nums">
        {formatTemplate(t.bestStreakLabel, { days: bestStreak })}
      </div>
    </div>
  );
}
