import React, { useEffect, useState } from 'react';
import { CheckCircle2, HeartPulse, MapPin, PhoneCall, ShieldAlert, Users } from 'lucide-react';
import { getT } from '../i18n/translations';
import { ElderlyProfile, LanguageCode, Medication } from '../types';
import { getPlainConditionLabel } from '../utils/plainLanguage';

interface EmergencyOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  elderly: ElderlyProfile;
  medications: Medication[];
  reason?: string;
}

export function EmergencyOverlay({
  isOpen,
  onClose,
  language,
  elderly,
  medications,
  reason,
}: EmergencyOverlayProps) {
  const t = getT(language);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSecondsElapsed(0);
      return;
    }
    const timer = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
  const secs = String(secondsElapsed % 60).padStart(2, '0');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-overlay-title"
      className="fixed inset-0 z-50 bg-[#7F1D1D] text-white flex flex-col overflow-y-auto p-5 sm:p-8"
    >
      <div className="max-w-2xl w-full mx-auto space-y-6 my-auto">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white text-[#991B1B] flex items-center justify-center shrink-0">
            <PhoneCall className="w-9 h-9 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <h1 id="emergency-overlay-title" className="font-display text-3xl sm:text-4xl font-extrabold">
              {t.emergencyTitle}
            </h1>
            <p className="text-lg text-red-100 mt-1">{t.emergencySubtitle}</p>
          </div>
        </div>

        {reason && (
          <div className="p-4 rounded-2xl bg-black/25 border border-white/20 text-base">
            {reason}
          </div>
        )}

        {/* Live Action Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-lg">
              <PhoneCall className="w-5 h-5 text-amber-300" />
              <span>{t.callingAmbulance}</span>
            </div>
            <p className="text-sm text-red-100 tabular-nums">{t.connectedWord} · {mins}:{secs}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/20 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-lg">
              <MapPin className="w-5 h-5 text-emerald-300" />
              <span>{t.sharingLocation}</span>
            </div>
            <p className="text-sm text-red-100">{elderly.locationLabel}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/20 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Users className="w-5 h-5 text-emerald-300" />
              <span>{t.circleNotified}</span>
            </div>
            <p className="text-sm text-red-100">{t.inAppEmailDispatched}</p>
          </div>
        </div>

        {/* Responder Medical Card */}
        <div className="bg-white text-[#131B19] rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="flex items-center gap-2.5 text-[#991B1B] font-display text-2xl font-bold">
            <HeartPulse className="w-7 h-7" aria-hidden="true" />
            <span>{t.medicalSummaryForResponders}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#3E4C48]">{t.patientWord}</div>
              <div className="font-bold text-xl">
                {elderly.name} ({elderly.age})
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#3E4C48]">{t.allergiesWord}</div>
              <div className="font-bold text-lg text-[#991B1B]">
                {elderly.allergies.length > 0 ? elderly.allergies.join(', ') : t.noneReported}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[#3E4C48] mb-1">
              {t.healthConditionsWord}
            </div>
            <div className="font-semibold text-base">
              {elderly.conditions.length > 0
                ? elderly.conditions.map((c) => getPlainConditionLabel(c, language)).join(' · ')
                : t.noneReported}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[#3E4C48] mb-2">
              {t.activeMedicationsWord}
            </div>
            <div className="divide-y divide-[#DFD5C5] border border-[#DFD5C5] rounded-2xl overflow-hidden">
              {medications.length === 0 ? (
                <div className="px-4 py-3 text-base text-[#3E4C48]">{t.noneReported}</div>
              ) : (
                medications.map((m) => (
                  <div key={m.id} className="px-4 py-2.5 flex items-center justify-between gap-2 text-base">
                    <span className="font-bold">{m.name}</span>
                    <span className="text-[#3E4C48] tabular-nums">
                      {m.dose} · {m.times.join(', ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[60px] rounded-2xl bg-white text-[#7F1D1D] font-display text-xl font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          <CheckCircle2 className="w-6 h-6" />
          <span>{t.cancelEmergency}</span>
        </button>
      </div>
    </div>
  );
}

interface InactivityCheckModalProps {
  isOpen: boolean;
  language: LanguageCode;
  honorificName: string;
  onImOkay: () => void;
  onNeedHelp: () => void;
}

export function InactivityCheckModal({
  isOpen,
  language,
  honorificName,
  onImOkay,
  onNeedHelp,
}: InactivityCheckModalProps) {
  const t = getT(language);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inactivity-check-title"
        className="sati-card bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 border-2 border-[#0D5652] shadow-2xl text-center"
      >
        <div className="w-16 h-16 rounded-full bg-amber-100 text-[#A85208] mx-auto flex items-center justify-center">
          <ShieldAlert className="w-9 h-9" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 id="inactivity-check-title" className="font-display text-3xl font-bold text-[#131B19]">
            {t.areYouOkayTitle}
          </h2>
          <p className="text-lg text-[#3E4C48]">
            {honorificName} — {t.inactivityDesc}
          </p>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={onImOkay}
            className="w-full min-h-[64px] rounded-2xl bg-[#15803D] hover:bg-[#166534] text-white font-display text-2xl font-bold cursor-pointer"
          >
            {t.imOkayBtn}
          </button>
          <button
            type="button"
            onClick={onNeedHelp}
            className="w-full min-h-[56px] rounded-2xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-display text-xl font-bold cursor-pointer"
          >
            {t.iNeedHelpBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
