import React, { useEffect, useState, useRef } from 'react';
import { JumpscareEvent } from '../types';
import ghostFaceImg from '../assets/images/jumpscare_ghost_face_1788411405875.jpg';
import shadowDemonImg from '../assets/images/jumpscare_shadow_demon_1788411419426.jpg';

interface JumpscareOverlayProps {
  event: JumpscareEvent | null;
  onComplete?: () => void;
}

export const JumpscareOverlay: React.FC<JumpscareOverlayProps> = ({ event, onComplete }) => {
  const [visible, setVisible] = useState(false);
  const [glitchPhase, setGlitchPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!event) {
      setVisible(false);
      return;
    }

    setVisible(true);

    // Strobe / Glitch flicker cycle
    let step = 0;
    const flickerInterval = setInterval(() => {
      step++;
      setGlitchPhase((prev) => (prev + 1) % 4);
    }, 45);

    // Draw procedural blood splatters and scratch lines on canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Blood splatters
        const numSplatters = 32;
        for (let i = 0; i < numSplatters; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const r = 8 + Math.random() * 45;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
          grad.addColorStop(0, 'rgba(185, 28, 28, 0.88)');
          grad.addColorStop(0.6, 'rgba(127, 29, 29, 0.65)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();

          // Dripping blood streak
          if (Math.random() > 0.4) {
            ctx.strokeStyle = 'rgba(153, 27, 27, 0.75)';
            ctx.lineWidth = 2 + Math.random() * 5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 20, y + 50 + Math.random() * 120);
            ctx.stroke();
          }
        }
      }
    }

    // Jumpscare duration: 1.3 seconds
    const timer = setTimeout(() => {
      clearInterval(flickerInterval);
      setVisible(false);
      if (onComplete) onComplete();
    }, 1350);

    return () => {
      clearInterval(flickerInterval);
      clearTimeout(timer);
    };
  }, [event, onComplete]);

  if (!visible || !event) return null;

  const isBoss = event.variant === 'boss_demon';
  const isMaiden = event.variant === 'white_maiden';
  const selectedImage = isMaiden ? ghostFaceImg : shadowDemonImg;

  return (
    <div
      id="jumpscare-overlay"
      className={`fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden transition-opacity duration-300 ${
        glitchPhase % 2 === 0 ? 'bg-red-950/90' : 'bg-black/95'
      }`}
      style={{
        animation: 'jumpscareViolentShake 0.06s infinite alternate',
      }}
    >
      {/* 1. Heavy Red & Black Vignette Pulsing */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            glitchPhase === 1
              ? 'radial-gradient(circle, transparent 20%, rgba(220, 20, 20, 0.85) 65%, black 100%)'
              : 'radial-gradient(circle, transparent 15%, rgba(136, 0, 0, 0.95) 60%, black 100%)',
        }}
      />

      {/* 2. Procedural Blood Splatter & Scratch Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-15 pointer-events-none opacity-80" />

      {/* 3. Terrifying Lunging Ghost Face */}
      <div
        className="relative z-20 flex items-center justify-center w-full h-full"
        style={{
          animation: 'jumpscareLungeIn 1.35s cubic-bezier(0.1, 0.9, 0.2, 1) forwards',
        }}
      >
        <div className="relative max-w-2xl max-h-[85vh] w-auto h-auto flex items-center justify-center">
          {/* Pulsing Aura Behind Ghost Face */}
          <div
            className={`absolute -inset-8 rounded-full filter blur-3xl opacity-90 animate-pulse ${
              isBoss ? 'bg-red-700' : 'bg-rose-900'
            }`}
          />

          {/* Main Ghost Face Image */}
          <img
            src={selectedImage}
            alt="원혼 갑툭튀"
            className={`relative object-contain max-h-[80vh] w-auto drop-shadow-[0_0_50px_rgba(239,68,68,0.9)] ${
              glitchPhase === 2 ? 'invert brightness-150 contrast-200' : ''
            }`}
            style={{
              filter:
                glitchPhase === 3
                  ? 'contrast(240%) brightness(120%) hue-rotate(330deg)'
                  : 'contrast(180%) brightness(90%)',
            }}
          />

          {/* Ghost Name / Fear Stinger Caption */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center whitespace-nowrap z-30 pointer-events-none">
            <span className="inline-block px-5 py-2 bg-black/85 border-2 border-red-700 text-red-500 font-serif font-black text-2xl tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.9)] animate-bounce">
              {event.ghostName ? `${event.ghostName}의 습격!` : '원혼의 기습!'}
            </span>
            <div className="text-red-400 font-mono text-sm tracking-wider mt-1 drop-shadow font-bold">
              정신력 급감 (-{event.damage}%)
            </div>
          </div>
        </div>
      </div>

      {/* 4. Film Grain / CRT Scanlines Effect */}
      <div
        className="absolute inset-0 z-25 pointer-events-none opacity-40 mix-blend-overlay"
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
          10% {
            transform: scale(1.32) translateY(-10px);
            opacity: 1;
          }
          25% {
            transform: scale(1.24) translateY(12px);
          }
          40% {
            transform: scale(1.36) translateY(-8px);
          }
          65% {
            transform: scale(1.28) translateY(4px);
            opacity: 1;
          }
          85% {
            transform: scale(1.42) translateY(-4px);
            opacity: 0.85;
          }
          100% {
            transform: scale(1.55) translateY(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
