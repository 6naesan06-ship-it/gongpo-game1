import React, { useEffect, useState, useRef } from 'react';
import { JumpscareEvent } from '../types';
import ghostFaceImg from '../assets/images/scary_ghost_face_1788500355128.jpg';
import grimReaperSpecterImg from '../assets/images/grim_reaper_specter.jpg';
import { mazeAudio } from '../audio/mazeHorrorAudio';

interface JumpscareOverlayProps {
  event: JumpscareEvent | null;
  onComplete?: () => void;
}

export const JumpscareOverlay: React.FC<JumpscareOverlayProps> = ({ event, onComplete }) => {
  const [visible, setVisible] = useState(false);
  const [showFace, setShowFace] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [glitchPhase, setGlitchPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!event) {
      setVisible(false);
      setShowFace(false);
      setIsFadingOut(false);
      return;
    }

    setVisible(true);
    setShowFace(true);
    setIsFadingOut(false);

    // Guaranteed scream audio trigger on jumpscare presentation
    mazeAudio.playGhostJumpscareScream(event.variant);

    // 1. Strobe / Glitch flicker cycle during the ghost jumpscare attack
    const flickerInterval = setInterval(() => {
      setGlitchPhase((prev) => (prev + 1) % 4);
    }, 45);

    // Stop strobe flicker at 2800ms
    const stopFlickerTimer = setTimeout(() => {
      clearInterval(flickerInterval);
    }, 2800);

    // 2. Hide lunging ghost face and start fade-out at EXACTLY 3.0 seconds (3000ms)
    // [요청사항]: "귀신 사진 뜨는건 3초만 하고 사라지게 해줘"
    const hideFaceTimer = setTimeout(() => {
      setShowFace(false);
      setIsFadingOut(true);
    }, 3000);

    // 3. Complete jumpscare and clear from screen after 3.2s
    const completeTimer = setTimeout(() => {
      setVisible(false);
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }, 3200);

    // Draw procedural blood splatters and dripping blood streaks on canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Blood splatters
        const numSplatters = 36;
        for (let i = 0; i < numSplatters; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const r = 10 + Math.random() * 40;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
          grad.addColorStop(0, 'rgba(185, 28, 28, 0.88)');
          grad.addColorStop(0.65, 'rgba(127, 29, 29, 0.65)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();

          // Dripping blood streak
          if (Math.random() > 0.35) {
            ctx.strokeStyle = 'rgba(153, 27, 27, 0.8)';
            ctx.lineWidth = 2 + Math.random() * 5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 15, y + 40 + Math.random() * 110);
            ctx.stroke();
          }
        }
      }
    }

    return () => {
      clearInterval(flickerInterval);
      clearTimeout(stopFlickerTimer);
      clearTimeout(hideFaceTimer);
      clearTimeout(completeTimer);
    };
  }, [event]);

  if (!visible || !event) return null;

  const USER_GHOST_FULLBODY_URL =
    'https://i.namu.wiki/i/ZVFvc1kRNqfs5QMUVbp3VMepZA1ei5rGpPbbUvXHKVC3RDu1WCOGN_oVl5ic4JxZt725bMP-pRqt4jYgnVIpudnF4c2PsORN1foVz-P902UYk6w9wNjqs-5f3Rlr0T8gT6dj_wlgfwwDZx4oJPK-vQ.webp';

  const isBoss = event.variant === 'boss_demon';
  const isSpecterOrBoss = event.variant === 'shadow_specter' || isBoss;
  const selectedImage = isSpecterOrBoss ? grimReaperSpecterImg : USER_GHOST_FULLBODY_URL;

  return (
    <div
      id="jumpscare-overlay"
      className={`fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden transition-opacity duration-1000 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      } ${
        showFace
          ? glitchPhase % 2 === 0
            ? 'bg-red-950/85'
            : 'bg-black/90'
          : 'bg-red-950/25'
      }`}
      style={{
        animation: showFace ? 'jumpscareViolentShake 0.06s infinite alternate' : undefined,
      }}
    >
      {/* 1. Blood Vignette Overlay */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-700 ${
          showFace ? 'opacity-90' : 'opacity-60'
        }`}
        style={{
          background: showFace
            ? 'radial-gradient(circle, transparent 25%, rgba(180, 15, 15, 0.85) 65%, black 100%)'
            : 'radial-gradient(circle, transparent 40%, rgba(140, 10, 10, 0.6) 75%, rgba(40, 0, 0, 0.8) 100%)',
        }}
      />

      {/* 2. Procedural Blood Splatter & Scratch Canvas (Visible for full 3s, fading out in the last second) */}
      <canvas ref={canvasRef} className="absolute inset-0 z-15 pointer-events-none opacity-85" />

      {/* 3. Terrifying Lunging Ghost Face (Visible for full 3.0 seconds) */}
      {showFace && (
        <div
          className="relative z-20 flex items-center justify-center w-full h-full"
          style={{
            animation: 'jumpscareLungeIn 3.0s cubic-bezier(0.1, 0.9, 0.2, 1) forwards',
          }}
        >
          <div className="relative max-w-2xl max-h-[90vh] w-auto h-auto flex items-center justify-center">
            {/* Pulsing Aura Behind Ghost */}
            <div
              className={`absolute -inset-10 rounded-full filter blur-3xl opacity-90 animate-pulse ${
                isBoss ? 'bg-red-700' : 'bg-rose-900'
              }`}
            />

            {/* Main Ghost Full-Body Image with refererPolicy for namu.wiki compatibility */}
            <img
              src={selectedImage}
              referrerPolicy="no-referrer"
              onError={(e) => {
                if (e.currentTarget.src !== ghostFaceImg) {
                  e.currentTarget.src = ghostFaceImg;
                }
              }}
              alt="원혼 전신 갑툭튀"
              className={`relative object-contain max-h-[88vh] w-auto drop-shadow-[0_0_60px_rgba(239,68,68,0.95)] ${
                glitchPhase === 2 ? 'invert brightness-150 contrast-200' : ''
              }`}
              style={{
                filter:
                  glitchPhase === 3
                    ? 'contrast(240%) brightness(120%) hue-rotate(330deg)'
                    : 'contrast(180%) brightness(95%)',
              }}
            />

            {/* Ghost Name / Fear Stinger Caption */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center whitespace-nowrap z-30 pointer-events-none">
              <span className="inline-block px-5 py-2 bg-black/85 border-2 border-red-700 text-red-500 font-serif font-black text-2xl tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.9)] animate-bounce">
                {event.ghostName ? `${event.ghostName}의 전신 습격!` : '원혼의 전신 기습!'}
              </span>
              <div className="text-red-400 font-mono text-sm tracking-wider mt-1 drop-shadow font-bold">
                정신력 급감 (-{event.damage} SAN)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Film Grain / CRT Scanlines Effect */}
      <div
        className="absolute inset-0 z-25 pointer-events-none opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 2px, transparent 2px, transparent 4px)',
        }}
      />

      {/* Embedded CSS Keyframes for Jumpscare */}
      <style>{`
        @keyframes jumpscareViolentShake {
          0% { transform: translate(-14px, 12px) rotate(-1.5deg) scale(1.02); }
          25% { transform: translate(16px, -14px) rotate(1.8deg) scale(1.04); }
          50% { transform: translate(-18px, -10px) rotate(-1.2deg) scale(1.01); }
          75% { transform: translate(12px, 15px) rotate(1.4deg) scale(1.03); }
          100% { transform: translate(-10px, 8px) rotate(-0.8deg) scale(1.02); }
        }

        @keyframes jumpscareLungeIn {
          0% {
            transform: scale(0.35) translateY(40px);
            opacity: 0.2;
          }
          20% {
            transform: scale(1.35) translateY(-8px);
            opacity: 1;
          }
          50% {
            transform: scale(1.28) translateY(8px);
          }
          80% {
            transform: scale(1.38) translateY(-4px);
            opacity: 1;
          }
          100% {
            transform: scale(1.45) translateY(0);
            opacity: 0.95;
          }
        }
      `}</style>
    </div>
  );
};
