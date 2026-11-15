import React, { useState } from 'react';
import { CheckCircle2, Delete, HelpCircle, RotateCcw } from 'lucide-react';
import { formatTemplate, getT } from '../i18n/translations';
import { LanguageCode } from '../types';
import { playDigitEnteredAudio, playPinClickSound } from '../utils/speech';

interface PinPadProps {
  value: string;
  onChange: (nextValue: string) => void;
  language: LanguageCode;
  maxLength?: number;
  onForgotPasscode?: () => void;
  forgotSent?: boolean;
  circleLabel?: string;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace'] as const;

export function PinPad({
  value,
  onChange,
  language,
  maxLength = 6,
  onForgotPasscode,
  forgotSent = false,
  circleLabel,
}: PinPadProps) {
  const t = getT(language);
  const [enteredBanner, setEnteredBanner] = useState<string>('');

  const handleDigit = (digit: string) => {
    if (value.length >= maxLength) return;
    const next = `${value}${digit}`.slice(0, maxLength);
    onChange(next);
    playPinClickSound(next.length);
    playDigitEnteredAudio(t.pinDigitSpokenWord, language);
    setEnteredBanner(formatTemplate(t.pinDigitEnteredToast, { count: next.length }));
  };

  const handleBackspace = () => {
    if (!value.length) return;
    const next = value.slice(0, -1);
    onChange(next);
    playPinClickSound(Math.max(1, next.length));
    setEnteredBanner(
      next.length > 0 ? formatTemplate(t.pinDigitEnteredToast, { count: next.length }) : ''
    );
  };

  const handleClear = () => {
    onChange('');
    playPinClickSound(1);
    setEnteredBanner('');
  };

  return (
    <div className="space-y-4">
      {/* High-Contrast 6-Slot PIN Display */}
      <div className="grid grid-cols-6 gap-2 sm:gap-3" aria-label={t.passcodeLabel}>
        {Array.from({ length: maxLength }).map((_, idx) => {
          const char = value[idx];
          const isActive = idx === value.length;
          return (
            <div
              key={idx}
              className={`h-16 sm:h-[72px] rounded-2xl border-2 flex items-center justify-center font-display text-3xl sm:text-4xl font-extrabold tabular-nums transition-all ${
                char
                  ? 'bg-[#0D5652] text-white border-[#0D5652] shadow-sm'
                  : isActive
                  ? 'bg-white text-[#131B19] border-[#0D5652] ring-2 ring-[#0D5652]/30'
                  : 'bg-[#FAF7F2] text-[#3E4C48] border-[#131B19]/30'
              }`}
            >
              {char || '•'}
            </div>
          );
        })}
      </div>

      {/* Visible + Screen-Reader Digit Entered Confirmation */}
      <div
        role="status"
        aria-live="polite"
        className={`min-h-[44px] px-4 py-2 rounded-2xl flex items-center justify-center gap-2 text-base font-bold transition-colors ${
          enteredBanner
            ? 'bg-emerald-50 border-2 border-emerald-600 text-emerald-950'
            : 'bg-[#FAF7F2] border border-[#DFD5C5] text-[#3E4C48]'
        }`}
      >
        {enteredBanner ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{enteredBanner}</span>
          </>
        ) : (
          <span>{t.enterPasscodePlaceholder}</span>
        )}
      </div>

      {/* Massive High-Contrast 0-9 Keypad */}
      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((key) => {
          if (key === 'clear') {
            return (
              <button
                key="clear"
                type="button"
                onClick={handleClear}
                className="min-h-[68px] sm:min-h-[76px] rounded-2xl bg-[#F2ECE1] hover:bg-[#E7DFD1] border-2 border-[#131B19]/25 text-[#131B19] font-bold text-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all"
              >
                <RotateCcw className="w-5 h-5 shrink-0" />
                <span>{t.pinClearBtn}</span>
              </button>
            );
          }
          if (key === 'backspace') {
            return (
              <button
                key="backspace"
                type="button"
                onClick={handleBackspace}
                className="min-h-[68px] sm:min-h-[76px] rounded-2xl bg-[#F2ECE1] hover:bg-[#E7DFD1] border-2 border-[#131B19]/25 text-[#131B19] font-bold text-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all"
              >
                <Delete className="w-5 h-5 shrink-0" />
                <span>{t.pinBackspaceBtn}</span>
              </button>
            );
          }
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleDigit(key)}
              className="min-h-[68px] sm:min-h-[76px] rounded-2xl bg-white hover:bg-[#0D5652] hover:text-white border-2 border-[#131B19] text-[#131B19] font-display text-3xl sm:text-4xl font-extrabold tabular-nums shadow-sm cursor-pointer active:scale-[0.96] transition-all"
            >
              {key}
            </button>
          );
        })}
      </div>

      {/* Forgot Passcode? Ask Family Button */}
      {onForgotPasscode && (
        <div className="pt-1 space-y-3">
          <button
            type="button"
            onClick={onForgotPasscode}
            className="w-full min-h-[56px] px-5 py-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] border-2 border-[#0D5652] text-[#0D5652] font-bold text-lg flex items-center justify-center gap-2.5 cursor-pointer transition-colors"
          >
            <HelpCircle className="w-6 h-6 shrink-0" />
            <span>{t.forgotPasscodeBtn}</span>
          </button>

          {forgotSent && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-600 text-emerald-950 space-y-1">
              <div className="font-bold text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>{t.forgotPasscodeSentTitle}</span>
              </div>
              <p className="text-sm leading-snug">
                {formatTemplate(t.forgotPasscodeSentDesc, {
                  circle: circleLabel || t.featureCircle,
                })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
