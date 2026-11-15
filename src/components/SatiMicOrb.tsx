import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface SatiMicOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  onClick: () => void;
  label: string;
  compact?: boolean;
}

export function SatiMicOrb({
  isListening,
  isSpeaking,
  isThinking,
  onClick,
  label,
  compact = false,
}: SatiMicOrbProps) {
  const sizeClass = compact ? 'w-16 h-16' : 'w-28 h-28';

  return (
    <div className="relative inline-flex items-center justify-center">
      {isListening && (
        <span
          aria-hidden="true"
          className={`absolute inset-0 rounded-full bg-[#0D5652]/30 animate-sati-halo pointer-events-none`}
        />
      )}
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={isListening}
        aria-busy={isThinking}
        className={`relative min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full transition-all duration-200 ease-out active:scale-95 cursor-pointer ${sizeClass} ${
          isListening
            ? 'bg-[#0D5652] text-white animate-sati-listen'
            : isSpeaking
            ? 'bg-[#A85208] text-white shadow-xl shadow-amber-950/25 scale-[1.03]'
            : 'bg-[#0D5652] hover:bg-[#09413E] text-white shadow-lg shadow-teal-950/25 hover:scale-[1.03]'
        }`}
      >
        {isSpeaking ? (
          <div className="flex items-center gap-1.5 h-8" aria-hidden="true">
            <span className="w-1.5 h-6 rounded-full bg-white animate-sati-wave-1" />
            <span className="w-1.5 h-8 rounded-full bg-white animate-sati-wave-2" />
            <span className="w-1.5 h-5 rounded-full bg-white animate-sati-wave-3" />
            <span className="w-1.5 h-7 rounded-full bg-white animate-sati-wave-4" />
          </div>
        ) : isThinking ? (
          <Volume2 aria-hidden="true" className={compact ? 'w-7 h-7 animate-pulse' : 'w-11 h-11 animate-pulse'} />
        ) : isListening ? (
          <MicOff aria-hidden="true" className={compact ? 'w-7 h-7' : 'w-11 h-11'} />
        ) : (
          <Mic aria-hidden="true" className={compact ? 'w-7 h-7' : 'w-11 h-11'} />
        )}
      </button>
    </div>
  );
}
