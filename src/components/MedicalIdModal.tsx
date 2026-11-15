import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Droplets,
  HeartPulse,
  PhoneCall,
  Pill,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';
import { formatTemplate, getT } from '../i18n/translations';
import { ElderlyProfile, LanguageCode, Medication } from '../types';
import { getPlainConditionLabel, getPlainMedicineTags } from '../utils/plainLanguage';
import { speakWarmly } from '../utils/speech';
import { PillGraphic } from './PillGraphic';

interface MedicalIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToEdit?: () => void;
  language: LanguageCode;
  elderly: ElderlyProfile;
  medications: Medication[];
  voiceEnabled?: boolean;
}

export function MedicalIdModal({
  isOpen,
  onClose,
  onGoToEdit,
  language,
  elderly,
  medications,
  voiceEnabled = true,
}: MedicalIdModalProps) {
  const t = getT(language);
  const [callingStatus, setCallingStatus] = useState<string | null>(null);
  const [missingPhoneNotice, setMissingPhoneNotice] = useState(false);

  useEffect(() => {
    setCallingStatus(null);
    setMissingPhoneNotice(false);
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const contacts = elderly.familyContacts || [];
  const primaryFamily = contacts[0];
  const doctorName = elderly.doctorName?.trim() || '';
  const doctorPhone = elderly.doctorPhone?.trim() || '';

  const triggerCall = (label: string, phone: string) => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setCallingStatus(null);
      setMissingPhoneNotice(true);
      return;
    }
    setMissingPhoneNotice(false);
    const msg = formatTemplate(t.callingBannerText, { name: label, phone: cleanPhone });
    setCallingStatus(msg);
    if (voiceEnabled) {
      speakWarmly(msg, language);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="medical-id-title"
      className="fixed inset-0 z-50 bg-[#131B19] text-white flex flex-col overflow-y-auto"
    >
      {/* Sticky High-Contrast Header */}
      <div className="sticky top-0 z-10 bg-[#991B1B] text-white px-4 sm:px-8 py-4 border-b border-red-900 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#991B1B] flex items-center justify-center shrink-0 shadow-sm">
            <HeartPulse className="w-7 h-7" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 id="medical-id-title" className="font-display text-2xl sm:text-3xl font-extrabold leading-tight truncate">
              {t.medicalIdTitle}
            </h1>
            <p className="text-sm sm:text-base text-red-100 leading-snug">
              {t.medicalIdSubtitle}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setCallingStatus(null);
            setMissingPhoneNotice(false);
            onClose();
          }}
          className="min-h-[52px] px-4 sm:px-5 rounded-2xl bg-white text-[#131B19] hover:bg-red-50 font-bold text-base sm:text-lg flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
        >
          <X className="w-5 h-5" />
          <span>{t.closeBtn}</span>
        </button>
      </div>

      <div className="max-w-4xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Large One-Tap Call Family & Call Doctor Action Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {primaryFamily?.phone ? (
            <a
              href={`tel:${primaryFamily.phone.replace(/\s+/g, '')}`}
              onClick={() => triggerCall(primaryFamily.name, primaryFamily.phone)}
              className="min-h-[82px] px-6 py-4 rounded-3xl bg-[#15803D] hover:bg-[#166534] text-white font-display text-2xl font-extrabold shadow-lg flex items-center justify-between gap-4 transition-colors"
            >
              <span className="flex items-center gap-3.5 min-w-0">
                <PhoneCall className="w-8 h-8 shrink-0" />
                <span className="truncate">{t.callFamilyBtn}</span>
              </span>
              <span className="text-sm sm:text-base font-sans font-bold bg-black/20 px-3 py-1.5 rounded-xl truncate max-w-[45%]">
                {primaryFamily.name}
              </span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => triggerCall(t.callFamilyBtn, '')}
              className="min-h-[82px] px-6 py-4 rounded-3xl bg-[#15803D] hover:bg-[#166534] text-white font-display text-2xl font-extrabold shadow-lg flex items-center justify-center gap-3.5 cursor-pointer transition-colors"
            >
              <PhoneCall className="w-8 h-8 shrink-0" />
              <span>{t.callFamilyBtn}</span>
            </button>
          )}

          {doctorPhone ? (
            <a
              href={`tel:${doctorPhone.replace(/\s+/g, '')}`}
              onClick={() => triggerCall(doctorName || t.doctorContactLabel, doctorPhone)}
              className="min-h-[82px] px-6 py-4 rounded-3xl bg-[#0D5652] hover:bg-[#09413E] border-2 border-teal-300/40 text-white font-display text-2xl font-extrabold shadow-lg flex items-center justify-between gap-4 transition-colors"
            >
              <span className="flex items-center gap-3.5 min-w-0">
                <Stethoscope className="w-8 h-8 shrink-0" />
                <span className="truncate">{t.callDoctorBtn}</span>
              </span>
              <span className="text-sm sm:text-base font-sans font-bold bg-black/20 px-3 py-1.5 rounded-xl truncate max-w-[45%]">
                {doctorName || doctorPhone}
              </span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => triggerCall(t.callDoctorBtn, '')}
              className="min-h-[82px] px-6 py-4 rounded-3xl bg-[#0D5652] hover:bg-[#09413E] border-2 border-teal-300/40 text-white font-display text-2xl font-extrabold shadow-lg flex items-center justify-center gap-3.5 cursor-pointer transition-colors"
            >
              <Stethoscope className="w-8 h-8 shrink-0" />
              <span>{t.callDoctorBtn}</span>
            </button>
          )}
        </div>

        {/* Simulated Live Call Feedback Banner */}
        {callingStatus && (
          <div
            role="status"
            aria-live="polite"
            className="p-5 rounded-3xl bg-emerald-600 text-white border-2 border-emerald-300 flex flex-wrap items-center justify-between gap-3 font-bold text-lg sm:text-xl shadow-md"
          >
            <div className="flex items-center gap-3">
              <PhoneCall className="w-7 h-7 animate-pulse shrink-0" />
              <span>{callingStatus}</span>
            </div>
            <button
              type="button"
              onClick={() => setCallingStatus(null)}
              className="min-h-[48px] px-4 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-bold cursor-pointer"
            >
              {t.dismissBtn}
            </button>
          </div>
        )}

        {missingPhoneNotice && (
          <div
            role="alert"
            aria-live="polite"
            className="p-5 rounded-3xl bg-amber-100 text-amber-950 border-2 border-amber-400 flex flex-wrap items-center justify-between gap-3 font-semibold text-base sm:text-lg"
          >
            <span>{t.noPhoneAddedNote}</span>
            {onGoToEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToEdit();
                }}
                className="min-h-[48px] px-5 rounded-2xl bg-[#0D5652] text-white font-bold cursor-pointer"
              >
                {t.editBtn}
              </button>
            )}
          </div>
        )}

        {/* Core Identity & Blood Group Card */}
        <div className="bg-white text-[#131B19] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#DFD5C5]">
            <div>
              <div className="text-sm font-bold uppercase tracking-wide text-[#3E4C48]">
                {t.patientWord}
              </div>
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#131B19] mt-0.5">
                {elderly.name || t.notSpecifiedWord}
              </div>
              <div className="text-xl font-bold text-[#0D5652] mt-1 tabular-nums">
                {t.ageLabel}: {elderly.age}
              </div>
            </div>

            <div className="px-6 py-4 rounded-3xl bg-[#FEF2F2] border-2 border-[#B91C1C] text-center min-w-[140px]">
              <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#991B1B]">
                <Droplets className="w-4 h-4" />
                <span>{t.bloodGroupLabel}</span>
              </div>
              <div className="font-display text-4xl font-extrabold text-[#991B1B] mt-1">
                {elderly.bloodGroup?.trim() || '—'}
              </div>
            </div>
          </div>

          {/* Allergies & Health Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-900 text-base uppercase tracking-wide">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{t.allergiesWord}</span>
              </div>
              <div className="font-extrabold text-xl text-red-950">
                {elderly.allergies.length > 0 ? elderly.allergies.join(', ') : t.noneReported}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF7F2] border-2 border-[#DFD5C5] space-y-2">
              <div className="font-bold text-[#3E4C48] text-base uppercase tracking-wide">
                {t.healthConditionsWord}
              </div>
              <div className="font-extrabold text-xl text-[#131B19]">
                {elderly.conditions.length > 0
                  ? elderly.conditions.map((c) => getPlainConditionLabel(c, language)).join(' · ')
                  : t.noneReported}
              </div>
            </div>
          </div>

          {/* Doctor & Family Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C5] space-y-3">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[#0D5652]">
                <Stethoscope className="w-6 h-6 shrink-0" aria-hidden="true" />
                <span>{t.doctorContactLabel}</span>
              </h2>
              <div className="space-y-1">
                <div className="font-bold text-xl text-[#131B19]">
                  {doctorName || t.notSpecifiedWord}
                </div>
                <div className="font-bold text-lg text-[#0D5652] tabular-nums">
                  {doctorPhone || t.notSpecifiedWord}
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C5] space-y-3">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[#0D5652]">
                <Users className="w-6 h-6 shrink-0" aria-hidden="true" />
                <span>{t.familyContactsLabel}</span>
              </h2>
              {contacts.length === 0 ? (
                <div className="text-base text-[#3E4C48]">{t.notSpecifiedWord}</div>
              ) : (
                <div className="space-y-2.5">
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#DFD5C5]"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-lg text-[#131B19] truncate">{c.name}</div>
                        <div className="text-sm text-[#3E4C48] tabular-nums">
                          {c.relation ? `${c.relation} · ` : ''}
                          {c.phone}
                        </div>
                      </div>
                      {c.phone && (
                        <a
                          href={`tel:${c.phone.replace(/\s+/g, '')}`}
                          onClick={() => triggerCall(c.name, c.phone)}
                          aria-label={`${t.callContactBtn}: ${c.name}`}
                          className="min-h-[48px] px-4 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-sm font-bold flex items-center gap-1.5 shrink-0"
                        >
                          <PhoneCall className="w-4 h-4" aria-hidden="true" />
                          <span>{t.callContactBtn}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Current Medicines */}
          <div className="space-y-3 pt-2">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-[#131B19]">
              <Pill className="w-6 h-6 text-[#0D5652]" aria-hidden="true" />
              <span>{t.activeMedicationsWord}</span>
            </h2>
            {medications.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#FAF7F2] text-lg text-[#3E4C48]">
                {t.noneReported}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {medications.map((m) => {
                  const tags = getPlainMedicineTags(m, language);
                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C5] flex items-center gap-3.5"
                    >
                      <PillGraphic
                        color={m.pillColor}
                        shape={m.pillShape}
                        size={52}
                        language={language}
                        medName={m.name}
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="font-bold text-lg text-[#131B19] truncate">
                          {m.name} · {m.dose}
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                          <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-[#0D5652] border border-teal-200">
                            {tags.purposeTag}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-[#A85208] border border-amber-200">
                            {tags.timingTag}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
