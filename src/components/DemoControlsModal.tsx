import React from 'react';
import { motion } from 'motion/react';
import { AlertOctagon, Clock, Eye, ShieldAlert, X } from 'lucide-react';
import { getT } from '../i18n/translations';
import { LanguageCode, UserRole } from '../types';

interface DemoControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  activeRole: UserRole;
  notice?: string;
  onSwitchRole: (role: UserRole) => void;
  onTriggerMissedDose: () => void;
  onTriggerDoubleDose: () => void;
  onTriggerEmergency: () => void;
  onTriggerSuspiciousPattern: () => void;
}

export function DemoControlsModal({
  isOpen,
  onClose,
  language,
  activeRole,
  notice,
  onSwitchRole,
  onTriggerMissedDose,
  onTriggerDoubleDose,
  onTriggerEmergency,
  onTriggerSuspiciousPattern,
}: DemoControlsModalProps) {
  if (!isOpen) return null;
  const t = getT(language);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t.demoControlsTitle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="sati-card bg-[#FAF7F2] w-full max-w-xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#DFD5C5] shadow-2xl overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 px-6 sm:px-7 py-5 bg-white border-b border-[#DFD5C5]">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold text-[#131B19]">
              {t.demoControlsTitle}
            </h2>
            <p className="text-sm text-[#3E4C48]">{t.demoControlsSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.cancelBtn}
            className="w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-[#F2ECE1] text-[#3E4C48] hover:text-[#131B19] cursor-pointer shrink-0 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 sm:p-7 overflow-y-auto space-y-3.5">
          {notice && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-sm font-semibold">
              {notice}
            </div>
          )}
          <button
            type="button"
            onClick={onTriggerMissedDose}
            className="w-full min-h-[72px] p-4 rounded-2xl bg-white hover:bg-[#F2ECE1] border border-[#DFD5C5] text-left flex items-center gap-4 cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#A85208] flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-lg text-[#131B19]">{t.demoMissedDoseBtn}</div>
              <div className="text-sm text-[#3E4C48]">{t.demoMissedDoseDesc}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={onTriggerDoubleDose}
            className="w-full min-h-[72px] p-4 rounded-2xl bg-white hover:bg-[#F2ECE1] border border-[#DFD5C5] text-left flex items-center gap-4 cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D5652] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-lg text-[#131B19]">{t.demoDoubleDoseBtn}</div>
              <div className="text-sm text-[#3E4C48]">{t.demoDoubleDoseDesc}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={onTriggerSuspiciousPattern}
            className="w-full min-h-[72px] p-4 rounded-2xl bg-white hover:bg-[#F2ECE1] border border-[#DFD5C5] text-left flex items-center gap-4 cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#F2ECE1] text-[#A85208] flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-lg text-[#131B19]">{t.demoSuspiciousBtn}</div>
              <div className="text-sm text-[#3E4C48]">{t.demoSuspiciousDesc}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={onTriggerEmergency}
            className="w-full min-h-[72px] p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-left flex items-center gap-4 cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#B91C1C] text-white flex items-center justify-center shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-lg text-rose-950">{t.demoEmergencyBtn}</div>
              <div className="text-sm text-rose-900">{t.demoEmergencyDesc}</div>
            </div>
          </button>

          {/* Quick View Jump + Shortcut Tip */}
          <div className="pt-3 border-t border-[#DFD5C5] space-y-3">
            <div className="flex items-center gap-2 p-1 bg-[#F2ECE1] rounded-2xl">
              {(
                [
                  ['elderly', t.roleElderShort],
                  ['caretaker', t.roleCaretakerShort],
                  ['family', t.roleFamilyShort],
                ] as Array<[UserRole, string]>
              ).map(([role, label]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    onSwitchRole(role);
                    onClose();
                  }}
                  className={`flex-1 min-h-[44px] px-3 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
                    activeRole === role
                      ? 'bg-white text-[#0D5652] shadow-sm'
                      : 'text-[#3E4C48] hover:text-[#131B19]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-[#3E4C48]">{t.demoControlsHint}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
