import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BellRing,
  HeartHandshake,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { getT } from '../i18n/translations';
import { LanguageCode } from '../types';

interface HowSatiWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onTryDemo: () => void;
}

export function HowSatiWorksModal({
  isOpen,
  onClose,
  language,
  onTryDemo,
}: HowSatiWorksModalProps) {
  const t = getT(language);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const steps = [
    {
      icon: HeartHandshake,
      iconBg: 'bg-[#0D5652] text-white',
      title: t.howStep1Title,
      desc: t.howStep1Desc,
    },
    {
      icon: Users,
      iconBg: 'bg-[#A85208] text-white',
      title: t.howStep2Title,
      desc: t.howStep2Desc,
    },
    {
      icon: KeyRound,
      iconBg: 'bg-[#0D5652] text-white',
      title: t.howStep3Title,
      desc: t.howStep3Desc,
    },
    {
      icon: BellRing,
      iconBg: 'bg-[#A85208] text-white',
      title: t.howStep4Title,
      desc: t.howStep4Desc,
    },
    {
      icon: ShieldCheck,
      iconBg: 'bg-emerald-700 text-white',
      title: t.howStep5Title,
      desc: t.howStep5Desc,
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t.howSatiWorksTitle}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="sati-card bg-[#FAF7F2] w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border border-[#DFD5C5] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 px-6 sm:px-8 py-5 bg-white border-b border-[#DFD5C5]">
          <div className="space-y-1 min-w-0">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D5652]">
              {t.howSatiWorksTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#3E4C48] leading-snug">
              {t.howSatiWorksSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.cancelBtn}
            className="w-11 h-11 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DFD5C5] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 sm:p-7 overflow-y-auto space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="bg-white rounded-2xl border border-[#DFD5C5] p-4 sm:p-5 flex items-start gap-4"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${step.iconBg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#131B19]">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#3E4C48] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 sm:px-8 py-4 bg-white border-t border-[#DFD5C5] flex flex-wrap gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[52px] px-5 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] hover:bg-[#F2ECE1] font-bold text-base cursor-pointer transition-colors"
          >
            {t.backBtn}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onTryDemo();
            }}
            className="min-h-[52px] px-6 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white font-bold text-base flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>{t.howSatiWorksCtaDemo}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
