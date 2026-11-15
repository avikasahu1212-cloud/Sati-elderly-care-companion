import React from 'react';
import { PillColor, PillShape } from '../types';

const COLOR_MAP: Record<PillColor, { primary: string; secondary: string; stroke: string }> = {
  white: { primary: '#FFFFFF', secondary: '#E7E5E4', stroke: '#9CA3AF' },
  yellow: { primary: '#FDE047', secondary: '#FACC15', stroke: '#CA8A04' },
  pink: { primary: '#F9A8D4', secondary: '#F472B6', stroke: '#DB2777' },
  blue: { primary: '#93C5FD', secondary: '#3B82F6', stroke: '#1D4ED8' },
  amber: { primary: '#FDBA74', secondary: '#EA580C', stroke: '#C2410C' },
  teal: { primary: '#5EEAD4', secondary: '#0F766E', stroke: '#115E59' },
  green: { primary: '#86EFAC', secondary: '#16A34A', stroke: '#15803D' },
};

export function SatiLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="48" height="48" rx="14" fill="#0F5C58" />
      <circle cx="24" cy="24" r="14" stroke="#FDE68A" strokeWidth="2.5" strokeDasharray="4 3" />
      <path
        d="M24 14C19.5 14 16 17.5 16 22C16 27.5 24 34 24 34C24 34 32 27.5 32 22C32 17.5 28.5 14 24 14Z"
        fill="#FAF7F2"
      />
      <circle cx="24" cy="21.5" r="3" fill="#D97706" />
    </svg>
  );
}

export function PillGraphic({
  color,
  shape,
  size = 64,
}: {
  color: PillColor;
  shape: PillShape;
  size?: number;
}) {
  const palette = COLOR_MAP[color] || COLOR_MAP.white;

  return (
    <div
      className="flex items-center justify-center rounded-2xl bg-[#F3EDE2] border border-[#E5DDD0] shrink-0"
      style={{ width: size, height: size }}
      aria-label={`${color} ${shape} pill`}
    >
      <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 48 48" fill="none">
        {shape === 'round' && (
          <>
            <circle cx="24" cy="24" r="16" fill={palette.primary} stroke={palette.stroke} strokeWidth="2.5" />
            <line x1="12" y1="24" x2="36" y2="24" stroke={palette.stroke} strokeWidth="2" strokeLinecap="round" opacity="0.65" />
            <path d="M15 17C17 14 21 12.5 24 12.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
          </>
        )}
        {shape === 'oval' && (
          <g transform="rotate(-25 24 24)">
            <rect
              x="6"
              y="14"
              width="36"
              height="20"
              rx="10"
              fill={palette.primary}
              stroke={palette.stroke}
              strokeWidth="2.5"
            />
            <line x1="24" y1="15" x2="24" y2="33" stroke={palette.stroke} strokeWidth="2" opacity="0.6" />
            <path d="M13 19H21" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
          </g>
        )}
        {shape === 'capsule' && (
          <g transform="rotate(-35 24 24)">
            <rect
              x="6"
              y="14"
              width="36"
              height="20"
              rx="10"
              fill={palette.primary}
              stroke={palette.stroke}
              strokeWidth="2.5"
            />
            <path
              d="M24 14H32C37.5228 14 42 18.4772 42 24C42 29.5228 37.5228 34 32 34H24V14Z"
              fill={palette.secondary}
              stroke={palette.stroke}
              strokeWidth="2.5"
            />
            <path d="M12 19H20" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
          </g>
        )}
      </svg>
    </div>
  );
}
