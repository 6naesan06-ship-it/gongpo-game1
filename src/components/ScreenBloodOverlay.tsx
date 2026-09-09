import React from 'react';

interface ScreenBloodOverlayProps {
  bloodLevel: number; // 0: None, 1: Moderate (1st death), 2: Heavy (2nd death), 3+: Critical/Fatal
}

export const ScreenBloodOverlay: React.FC<ScreenBloodOverlayProps> = ({ bloodLevel }) => {
  if (bloodLevel <= 0) return null;

  return (
    <div
      id="screen-blood-overlay"
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden select-none transition-opacity duration-1000"
    >
      {/* 1. Peripheral Blood Vignette (Intensity scales with bloodLevel) */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          boxShadow:
            bloodLevel === 1
              ? 'inset 0 0 60px rgba(160, 20, 20, 0.55), inset 0 0 120px rgba(80, 0, 0, 0.35)'
              : bloodLevel === 2
              ? 'inset 0 0 90px rgba(185, 20, 20, 0.75), inset 0 0 160px rgba(100, 0, 0, 0.55)'
              : 'inset 0 0 120px rgba(220, 20, 20, 0.85), inset 0 0 200px rgba(120, 0, 0, 0.75)',
        }}
      />

      {/* 2. Procedural SVG Horror Blood Splatters & Dripping Gore */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="bloodGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#990000" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#660000" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#330000" stopOpacity="0" />
          </radialGradient>
          <filter id="bloodBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* --- LEVEL 1: First Death / Revival Blood Splatters --- */}
        {bloodLevel >= 1 && (
          <g filter="url(#bloodBlur)">
            {/* Top-Left Corner Blood Splatter */}
            <path
              d="M0,0 Q60,20 80,60 Q95,110 50,130 Q30,140 0,90 Z"
              fill="#7f1d1d"
              opacity="0.85"
            />
            <circle cx="95" cy="70" r="14" fill="#991b1b" opacity="0.8" />
            <circle cx="120" cy="95" r="9" fill="#7f1d1d" opacity="0.75" />
            <circle cx="70" cy="125" r="12" fill="#881337" opacity="0.85" />
            <circle cx="110" cy="140" r="6" fill="#991b1b" opacity="0.7" />
            <circle cx="135" cy="65" r="5" fill="#7f1d1d" opacity="0.65" />
            {/* Top-Left Blood Drip */}
            <path
              d="M45,130 Q47,190 48,220 Q48,225 45,225 Q42,225 43,190 Z"
              fill="#881337"
              opacity="0.85"
            />
            <circle cx="46" cy="227" r="4.5" fill="#991b1b" opacity="0.9" />

            {/* Bottom-Right Corner Blood Splatter */}
            <path
              d="M100%,100% l-120,-20 q40,-60 80,-40 l40,60 Z"
              fill="#7f1d1d"
              opacity="0.8"
            />
            <circle cx="calc(100% - 70px)" cy="calc(100% - 60px)" r="18" fill="#881337" opacity="0.8" />
            <circle cx="calc(100% - 110px)" cy="calc(100% - 40px)" r="11" fill="#991b1b" opacity="0.75" />
            <circle cx="calc(100% - 45px)" cy="calc(100% - 100px)" r="14" fill="#7f1d1d" opacity="0.8" />
            <circle cx="calc(100% - 90px)" cy="calc(100% - 95px)" r="7" fill="#991b1b" opacity="0.65" />

            {/* Top Center Blood Droplets */}
            <circle cx="35%" cy="18" r="8" fill="#881337" opacity="0.75" />
            <path d="M35%,18 Q35.2%,60 35.1%,75 Q35%,78 34.8%,75 Z" stroke="#7f1d1d" strokeWidth="3" fill="none" opacity="0.8" />
            <circle cx="35.1%" cy="77" r="3.5" fill="#991b1b" opacity="0.85" />
          </g>
        )}

        {/* --- LEVEL 2: Second Death / Revival Heavy Gore & Palm Drag --- */}
        {bloodLevel >= 2 && (
          <g filter="url(#bloodBlur)">
            {/* Top-Right Corner Heavy Splatter */}
            <path
              d="M100%,0 Lcalc(100% - 150px),0 Qcalc(100% - 110px),70 calc(100% - 60px),90 L100%,140 Z"
              fill="#6b1111"
              opacity="0.9"
            />
            <circle cx="calc(100% - 110px)" cy="85" r="22" fill="#881337" opacity="0.85" />
            <circle cx="calc(100% - 150px)" cy="60" r="14" fill="#991b1b" opacity="0.8" />
            <circle cx="calc(100% - 80px)" cy="130" r="16" fill="#7f1d1d" opacity="0.85" />
            <circle cx="calc(100% - 170px)" cy="95" r="8" fill="#991b1b" opacity="0.75" />

            {/* Top-Right Blood Dripping Streaks */}
            <path
              d="Mcalc(100% - 100px),90 Qcalc(100% - 98px),170 calc(100% - 100px),210"
              stroke="#881337"
              strokeWidth="4.5"
              fill="none"
              opacity="0.88"
            />
            <circle cx="calc(100% - 100px)" cy="214" r="5" fill="#991b1b" opacity="0.95" />

            {/* Bottom-Left Corner Bloody Spatter & Pooling */}
            <path
              d="M0,100% L0,calc(100% - 130px) Q60,calc(100% - 90px) 110,calc(100% - 50px) L140,100% Z"
              fill="#5e0f0f"
              opacity="0.88"
            />
            <circle cx="80" cy="calc(100% - 70px)" r="20" fill="#7f1d1d" opacity="0.85" />
            <circle cx="125" cy="calc(100% - 40px)" r="15" fill="#991b1b" opacity="0.8" />
            <circle cx="45" cy="calc(100% - 120px)" r="12" fill="#881337" opacity="0.8" />

            {/* Right Edge: Desperate Bloody Hand Drag Smear */}
            <path
              d="Mcalc(100% - 18px),38% Qcalc(100% - 45px),42% calc(100% - 25px),52% Qcalc(100% - 55px),60% calc(100% - 20px),68% L100%,68% L100%,38% Z"
              fill="#580c0c"
              opacity="0.75"
            />
            <path
              d="Mcalc(100% - 35px),44% Qcalc(100% - 33px),50% calc(100% - 32px),58%"
              stroke="#881337"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
            <path
              d="Mcalc(100% - 45px),46% Qcalc(100% - 43px),52% calc(100% - 42px),60%"
              stroke="#7f1d1d"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
          </g>
        )}

        {/* --- LEVEL 3+: Extreme Critical Trauma Blood & Cracked Lens --- */}
        {bloodLevel >= 3 && (
          <g filter="url(#bloodBlur)">
            {/* Center Blood Drops and Splashes */}
            <circle cx="28%" cy="35%" r="14" fill="#991b1b" opacity="0.75" />
            <circle cx="72%" cy="40%" r="18" fill="#7f1d1d" opacity="0.75" />
            <circle cx="68%" cy="65%" r="12" fill="#881337" opacity="0.7" />
            <circle cx="32%" cy="68%" r="15" fill="#991b1b" opacity="0.7" />

            {/* Top Center Heavy Hemorrhage Drip */}
            <path
              d="M48%,0 L54%,0 Q53%,70 52%,110 Q51%,140 50%,170 Q49%,175 48.5%,170 Q48%,140 48%,0 Z"
              fill="#5e0f0f"
              opacity="0.9"
            />
            <circle cx="49.5%" cy="174" r="6" fill="#991b1b" opacity="0.95" />

            {/* Left Border Streaks */}
            <path
              d="M0,25% Q35,28% 15,38% L0,42% Z"
              fill="#6b1111"
              opacity="0.85"
            />
            <circle cx="30" cy="32%" r="10" fill="#991b1b" opacity="0.8" />
          </g>
        )}
      </svg>

      {/* 3. Subtle Pulsing Red Edge Alarm when bloodLevel is high */}
      {bloodLevel >= 2 && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-color-burn animate-pulse"
          style={{
            animationDuration: bloodLevel >= 3 ? '1.2s' : '2.2s',
            background:
              'radial-gradient(ellipse at center, transparent 65%, rgba(136, 19, 55, 0.4) 90%, rgba(88, 12, 12, 0.7) 100%)',
          }}
        />
      )}
    </div>
  );
};
