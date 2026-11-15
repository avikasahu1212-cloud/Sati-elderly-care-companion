import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Edit3,
  FileScan,
  Plus,
  Stethoscope,
  Trash2,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { getLocalDateStr } from '../data/seedData';
import { formatTemplate, getT, LANGUAGES } from '../i18n/translations';
import { resolveAlertText } from '../store/useCareStore';
import { CareCircleState, DoseStatus, Medication } from '../types';
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
import { AppointmentsSection } from './AppointmentsSection';
import { DoctorNotesCard } from './DoctorNotesSection';
import { EmailLogSection } from './EmailLogSection';
import { PillGraphic } from './PillGraphic';

export type CaretakerTab = 'dashboard' | 'medications' | 'alerts' | 'emails';

interface CaretakerViewProps {
  state: CareCircleState;
  activeTab: CaretakerTab;
  onChangeTab: (tab: CaretakerTab) => void;
  onVerifyDose: (doseId: string, by: 'caretaker' | 'pillbox_sensor', note: string) => void;
  onMarkMissed: (doseId: string) => void;
  onOpenAddMed: (withScan?: boolean) => void;
  onOpenEditMed: (med: Medication) => void;
  onDeleteMed: (medId: string) => void;
  onOpenAddAppt: () => void;
  onDeleteAppt: (apptId: string) => void;
  onDeleteDoctorNote: (noteId: string) => void;
  onOpenCalendar: () => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onTestReminder: () => void;
}

export function CaretakerView({
  state,
  activeTab,
  onVerifyDose,
  onMarkMissed,
  onOpenAddMed,
  onOpenEditMed,
  onDeleteMed,
  onOpenAddAppt,
  onDeleteAppt,
  onDeleteDoctorNote,
  onOpenCalendar,
  onAcknowledgeAlert,
  onTestReminder,
}: CaretakerViewProps) {
  const t = getT(state.language);
  const speechLocale = LANGUAGES.find((l) => l.code === state.language)?.speechLocale || 'en-IN';
  const todayStr = getLocalDateStr(0);

  const analytics = useMemo(() => computeCareAnalytics(state), [state]);

  const todaysDoses = useMemo(() => {
    const activeMedIds = new Set(state.medications.map((m) => m.id));
    return state.doseLogs
      .filter((d) => d.date === todayStr && activeMedIds.has(d.medicationId))
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [state.doseLogs, state.medications, todayStr]);

  const counts = useMemo(() => {
    const map: Record<DoseStatus, number> = {
      pending: 0,
      said_taken: 0,
      verified_taken: 0,
      missed: 0,
    };
    todaysDoses.forEach((d) => {
      map[d.status]++;
    });
    return map;
  }, [todaysDoses]);

  const statusChip = (status: DoseStatus) => {
    if (status === 'verified_taken') {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800">
          <CheckCircle2 className="w-4 h-4" />
          {t.statusVerifiedTaken}
        </span>
      );
    }
    if (status === 'said_taken') {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0D5652]">
          <UserCheck className="w-4 h-4" />
          {t.statusSaidTaken}
        </span>
      );
    }
    if (status === 'missed') {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-800">
          <XCircle className="w-4 h-4" />
          {t.statusMissed}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#A85208]">
        <Clock className="w-4 h-4" />
        {t.statusPending}
      </span>
    );
  };

  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="space-y-1">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#131B19]">
            {t.careCircleHeading} · {state.elderly.name}
          </h1>
          <p className="sati-muted text-base text-[#3E4C48]">
            {t.passcodeWord} <strong className="tabular-nums text-[#0D5652]">{state.passcode}</strong> ·{' '}
            {state.elderly.conditions.join(', ')}
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
          <button
            type="button"
            onClick={onOpenAddAppt}
            className="min-h-[48px] px-5 rounded-2xl bg-white hover:bg-[#F2ECE1] border-2 border-[#DFD5C5] text-base font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Stethoscope className="w-5 h-5 text-[#A85208]" />
            <span>{t.addAppointment}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAddMed(true)}
            className="min-h-[48px] px-5 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white text-base font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <FileScan className="w-5 h-5" />
            <span>{t.scanPrescription}</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-7">
          {/* 4-Card Analytical KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-5">
              <div className="sati-muted text-sm font-semibold text-[#3E4C48]">
                {t.thirtyDayAdherenceLabel}
              </div>
              <div className="font-display text-4xl font-extrabold text-[#0D5652] tabular-nums mt-1.5">
                {analytics.thirtyDayPct}%
              </div>
              <div className="text-xs font-semibold text-[#3E4C48] mt-1 tabular-nums">
                {formatTemplate(t.takenOfTotal, {
                  taken: analytics.thirtyDayTaken,
                  total: analytics.thirtyDayTotal,
                })}
              </div>
            </div>

            <StreakKpiBadge
              currentStreak={analytics.currentStreak}
              bestStreak={analytics.bestStreak}
              language={state.language}
            />

            <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-5">
              <div className="sati-muted text-sm font-semibold text-[#3E4C48]">
                {t.verificationRateLabel}
              </div>
              <div className="font-display text-4xl font-extrabold text-emerald-800 tabular-nums mt-1.5">
                {analytics.verifiedRatePct}%
              </div>
              <div className="text-xs font-semibold text-[#3E4C48] mt-1 tabular-nums">
                {counts.verified_taken} {t.statusVerifiedTaken} · {counts.said_taken} {t.statusSaidTaken}
              </div>
            </div>

            <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-5">
              <div className="sati-muted text-sm font-semibold text-[#3E4C48]">
                {t.todayProgressLabel}
              </div>
              <div className="font-display text-4xl font-extrabold text-[#131B19] tabular-nums mt-1.5">
                {counts.verified_taken + counts.said_taken}/{todaysDoses.length}
              </div>
              <div className="text-xs font-semibold text-[#3E4C48] mt-1 tabular-nums">
                {counts.pending} {t.statusPending} · {counts.missed} {t.statusMissed}
              </div>
            </div>
          </div>

          {/* Primary Operational Row: Today's Doses + Alerts Timeline & Upcoming Visits */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 sm:p-7 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-bold">{t.todaysDosesTitle}</h2>
                    <p className="sati-muted text-sm text-[#3E4C48] tabular-nums mt-0.5">
                      {counts.verified_taken} {t.statusVerifiedTaken} · {counts.said_taken}{' '}
                      {t.statusSaidTaken} · {counts.pending} {t.statusPending} · {counts.missed}{' '}
                      {t.statusMissed}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onTestReminder}
                    className="min-h-[46px] px-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] text-sm font-bold cursor-pointer transition-colors"
                  >
                    {t.testReminderBtn}
                  </button>
                </div>

                <div className="divide-y divide-[#DFD5C5]">
                  {todaysDoses.length === 0 ? (
                    <div className="py-8 text-center space-y-4">
                      <p className="sati-muted text-base text-[#3E4C48]">{t.noDosesToday}</p>
                      <button
                        type="button"
                        onClick={() => onOpenAddMed(false)}
                        className="min-h-[48px] px-5 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white text-base font-bold inline-flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        <span>{t.addMedication}</span>
                      </button>
                    </div>
                  ) : (
                    todaysDoses.map((log) => {
                      const med = state.medications.find((m) => m.id === log.medicationId);
                      if (!med) return null;
                      return (
                        <div
                          key={log.id}
                          className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <PillGraphic color={med.pillColor} shape={med.pillShape} size={58} />
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="font-bold text-xl">
                                  {med.name} {med.dose}
                                </span>
                                {statusChip(log.status)}
                              </div>
                              <div className="sati-muted text-base text-[#3E4C48] tabular-nums">
                                {t.scheduledWord} {log.scheduledTime}
                                {log.confirmedAt
                                  ? ` · ${t.confirmedWord} ${new Date(
                                      log.confirmedAt
                                    ).toLocaleTimeString(speechLocale, {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}`
                                  : ''}
                              </div>
                              {log.verificationNote && (
                                <div className="text-sm font-medium text-emerald-800">
                                  {log.verificationNote}
                                </div>
                              )}
                              {log.suspiciousFlag && (
                                <div className="text-sm font-medium text-amber-900">
                                  {log.suspiciousFlag}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2.5 shrink-0">
                            {log.status !== 'verified_taken' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onVerifyDose(log.id, 'caretaker', t.statusVerifiedTaken)
                                  }
                                  className="min-h-[48px] px-4 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  <span>{t.verifyInPerson}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onVerifyDose(log.id, 'pillbox_sensor', t.pillboxBtn)
                                  }
                                  className="min-h-[48px] px-4 rounded-2xl bg-[#F2ECE1] hover:bg-[#E7DFD1] text-[#131B19] text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Cpu className="w-4 h-4 text-[#0D5652]" />
                                  <span>{t.pillboxBtn}</span>
                                </button>
                              </>
                            )}
                            {log.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => onMarkMissed(log.id)}
                                className="min-h-[48px] px-4 rounded-2xl border-2 border-[#DFD5C5] text-sm font-bold text-[#3E4C48] hover:text-rose-800 hover:border-rose-300 cursor-pointer transition-colors"
                              >
                                {t.markMissedBtn}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <AlertsTimelineCard
                alerts={state.alerts}
                language={state.language}
                onAcknowledgeAlert={onAcknowledgeAlert}
              />

              <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 space-y-4">
                <h3 className="font-display text-xl font-bold">{t.activityTimeline}</h3>
                <div className="space-y-3 max-h-[260px] overflow-y-auto">
                  {todaysDoses.filter((d) => d.confirmedAt || d.verifiedAt).length === 0 ? (
                    <p className="sati-muted text-sm text-[#3E4C48]">{t.noTimelineYet}</p>
                  ) : (
                    todaysDoses
                      .filter((d) => d.confirmedAt || d.verifiedAt)
                      .map((d) => {
                        const med = state.medications.find((m) => m.id === d.medicationId);
                        return (
                          <div key={d.id} className="pb-3 border-b border-[#DFD5C5] last:border-0 space-y-0.5">
                            <div className="font-bold text-base text-[#131B19]">
                              {med?.name} ({med?.dose})
                            </div>
                            <div className="sati-muted text-sm text-[#3E4C48]">
                              {d.status === 'verified_taken' ? t.statusVerifiedTaken : t.statusSaidTaken}{' '}
                              ·{' '}
                              <span className="tabular-nums">
                                {new Date(d.verifiedAt || d.confirmedAt || '').toLocaleTimeString(
                                  speechLocale,
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Patient Symptom Notes for the Doctor */}
          <DoctorNotesCard
            notes={state.doctorNotes || []}
            language={state.language}
            canDelete
            onDeleteNote={onDeleteDoctorNote}
          />

          {/* Upcoming Doctor Appointments Section */}
          <AppointmentsSection
            state={state}
            onOpenAddAppt={onOpenAddAppt}
            onDeleteAppt={onDeleteAppt}
            onOpenCalendar={onOpenCalendar}
            canAdd
            canDelete
          />

          {/* Full Month Color-Coded Calendar + Selected Day Doses Inspector */}
          <MonthlyAdherenceCalendar
            state={state}
            allowVerifyActions
            onVerifyDose={onVerifyDose}
            onMarkMissed={onMarkMissed}
          />

          {/* Trend Line Chart & Weekly Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
            <AdherenceTrendChart points={analytics.trendPoints} language={state.language} />
            <WeeklyBarChart bars={analytics.weeklyBars} language={state.language} />
          </div>

          {/* Per-Medicine Breakdown & Most-Missed-Times Insight */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
            <PerMedicineBreakdown items={analytics.perMedicine} language={state.language} />
            <MostMissedTimesCard analytics={analytics} language={state.language} />
          </div>
        </div>
      )}

      {/* MEDICATIONS TAB */}
      {activeTab === 'medications' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">{t.tabMedications}</h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onOpenAddMed(true)}
                className="min-h-[50px] px-5 rounded-2xl bg-[#F2ECE1] hover:bg-[#E7DFD1] text-[#0D5652] font-bold text-base flex items-center gap-2 cursor-pointer transition-colors"
              >
                <FileScan className="w-5 h-5" />
                <span>{t.scanPrescription}</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAddMed(false)}
                className="min-h-[50px] px-5 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white font-bold text-base flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>{t.addMedication}</span>
              </button>
            </div>
          </div>

          {state.medications.length === 0 ? (
            <div className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-9 text-center space-y-4">
              <h3 className="font-display text-2xl font-bold">{t.noMedicinesYetTitle}</h3>
              <p className="sati-muted text-base text-[#3E4C48] max-w-md mx-auto">{t.noMedicinesYetDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {state.medications.map((med) => {
              const lowStock = med.stockCount <= med.lowStockThreshold;
              return (
                <div
                  key={med.id}
                  className="sati-card bg-white rounded-3xl border border-[#DFD5C5] p-6 flex flex-col justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    <PillGraphic color={med.pillColor} shape={med.pillShape} size={64} />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-display text-2xl font-bold truncate">
                          {med.name} {med.dose}
                        </h3>
                        <span
                          className={`text-sm font-bold tabular-nums shrink-0 ${
                            lowStock ? 'text-[#A85208]' : 'text-[#3E4C48]'
                          }`}
                        >
                          {med.stockCount} {t.leftWord}
                        </span>
                      </div>
                      <p className="sati-muted text-base text-[#3E4C48] tabular-nums">
                        {med.times.join(', ')} · {med.routineCue}
                      </p>
                      <p className="sati-muted text-sm text-[#3E4C48]">{med.purpose}</p>
                      {lowStock && (
                        <div className="pt-1 text-sm font-bold text-[#A85208] flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{t.refillNeeded}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-3 border-t border-[#DFD5C5]">
                    <button
                      type="button"
                      onClick={() => onOpenEditMed(med)}
                      className="min-h-[48px] px-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>{t.editBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMed(med.id)}
                      className="min-h-[48px] px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{t.deleteBtn}</span>
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}

      {/* ALERTS & PATTERNS TAB */}
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
              {state.alerts.map((alert) => {
                const localized = resolveAlertText(alert, state.language);
                return (
                  <div
                    key={alert.id}
                    className={`sati-card rounded-3xl border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      alert.severity === 'critical'
                        ? 'bg-rose-50 border-rose-300'
                        : alert.severity === 'warning'
                        ? 'bg-amber-50/80 border-amber-300'
                        : 'bg-white border-[#DFD5C5]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="font-display text-xl font-bold text-[#131B19]">{localized.title}</div>
                      <p className="text-base text-[#3E4C48]">{localized.message}</p>
                      <div className="text-sm text-[#3E4C48] tabular-nums">
                        {new Date(alert.createdAt).toLocaleString(speechLocale)}
                      </div>
                    </div>
                    {!alert.acknowledged ? (
                      <button
                        type="button"
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="min-h-[48px] px-5 rounded-2xl bg-white hover:bg-[#F2ECE1] border-2 border-[#DFD5C5] font-bold text-base shrink-0 cursor-pointer transition-colors"
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

      {/* SIMULATED EMAIL LOG TAB */}
      {activeTab === 'emails' && (
        <EmailLogSection emailLogs={state.emailLogs} language={state.language} />
      )}
    </motion.div>
  );
}
