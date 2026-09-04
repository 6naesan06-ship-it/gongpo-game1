import React, { useState, useEffect } from 'react';
import { RelicItem, HauntedEvent, InventoryItem, BossState } from '../types';
import {
  Compass,
  Flashlight,
  Flame,
  Activity,
  Footprints,
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  X,
  ShieldAlert,
  Ghost,
  Zap,
  Sliders,
  Tv,
  Sun,
  MousePointer,
  Sword,
  Scroll,
  ChevronLeft,
  ChevronRight,
  Trophy,
  RotateCcw,
  Heart,
  Skull,
  AlertTriangle
} from 'lucide-react';

interface MazeHUDProps {
  sanity: number;
  maxSanity?: number;
  stamina: number;
  battery: number;
  lightMode: 'flashlight' | 'lantern' | 'off';
  depthMeters: number;
  roomsExplored: number;
  collectedRelics: RelicItem[];
  inventory: InventoryItem[];
  activeSlotIndex: number;
  onSelectSlot: (index: number) => void;
  onPrevSlot: () => void;
  onNextSlot: () => void;
  onUseActiveItem: () => void;
  exorcisedGhostCount: number;
  bossState: BossState;
  escapeModal: {
    method: 'relics' | 'kills' | 'boss';
    exorcisedCount: number;
    depthMeters: number;
    roomsExplored: number;
    relicsCount: number;
    bossDefeated?: boolean;
  } | null;
  onRestart: () => void;
  hoveredTarget: { name: string; description: string; distance: number } | null;
  onToggleLight: () => void;
  onInspect: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  investigationModal: { relic: RelicItem | null; title: string; text: string } | null;
  onCloseInvestigation: () => void;
  hauntedAlert: HauntedEvent | null;
  onVirtualMove: (x: number, y: number) => void;
  onVirtualLook: (deltaYaw: number, deltaPitch: number) => void;
  onSprintToggle: (sprinting: boolean) => void;
  playerYaw: number;
  brightness: number;
  onChangeBrightness: (val: number) => void;
  sensitivity: number;
  onChangeSensitivity: (val: number) => void;
  onReleasePointerLock: () => void;
}

export const MazeHUD: React.FC<MazeHUDProps> = ({
  sanity,
  maxSanity = 100,
  stamina,
  battery,
  lightMode,
  depthMeters,
  roomsExplored,
  collectedRelics,
  inventory,
  activeSlotIndex,
  onSelectSlot,
  onPrevSlot,
  onNextSlot,
  onUseActiveItem,
  exorcisedGhostCount,
  bossState,
  escapeModal,
  onRestart,
  hoveredTarget,
  onToggleLight,
  onInspect,
  soundEnabled,
  onToggleSound,
  investigationModal,
  onCloseInvestigation,
  hauntedAlert,
  onVirtualMove,
  onVirtualLook,
  onSprintToggle,
  playerYaw,
  brightness,
  onChangeBrightness,
  sensitivity,
  onChangeSensitivity,
  onReleasePointerLock,
}) => {
  const [showCodex, setShowCodex] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [crtFilter, setCrtFilter] = useState<boolean>(false);
  const [isMobileSprint, setIsMobileSprint] = useState<boolean>(false);

  // Compass angle (converting yaw to compass degrees)
  const compassDegree = Math.round(((-playerYaw * 180) / Math.PI) % 360);
  const normalizedDegree = compassDegree < 0 ? compassDegree + 360 : compassDegree;
  const cardinalDirections = ['북(北)', '북동', '동(東)', '남동', '남(南)', '남서', '서(西)', '북서'];
  const currentCardinal = cardinalDirections[Math.round(normalizedDegree / 45) % 8];

  const handleOpenModal = (type: 'codex' | 'settings') => {
    onReleasePointerLock();
    if (type === 'codex') setShowCodex(true);
    if (type === 'settings') setShowSettings(true);
  };

  const activeItem = inventory[activeSlotIndex] || inventory[0];
  const maxSan = maxSanity && maxSanity > 0 ? maxSanity : 100;
  const sanityPercent = Math.min(100, Math.max(0, (sanity / maxSan) * 100));
  const isLowSanity = sanityPercent <= 30;
  const lowSanitySeverity = isLowSanity ? Math.min(1, Math.max(0, (30 - sanityPercent) / 30)) : 0;
  const isBossFight = bossState && bossState.active;

  // ESC / Enter / Space / E 키로 조사창 신속 닫기
  useEffect(() => {
    if (!investigationModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.code === 'Space' || e.code === 'KeyE') {
        e.preventDefault();
        onCloseInvestigation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [investigationModal, onCloseInvestigation]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-3 sm:p-5 overflow-hidden font-sans">
      {/* 1. CRT Scanline & Horror Vignette Overlay */}
      {crtFilter && (
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />
      )}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{
          boxShadow: `inset 0 0 ${100 - sanityPercent * 0.7}px rgba(${isBossFight ? '90, 10, 60' : sanityPercent < 40 ? '110, 10, 10' : '0, 0, 0'}, ${0.45 + (100 - sanityPercent) * 0.003})`,
        }}
      />

      {/* 2. Red Horror Vignette Overlay (Active when SAN <= 30%) */}
      {isLowSanity && (
        <>
          {/* Outer Blood-red Radial Vignette with Cardiac Pulse */}
          <div
            className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-300 animate-pulse"
            style={{
              background: `radial-gradient(ellipse at center, transparent ${Math.max(15, 48 - lowSanitySeverity * 28)}%, rgba(190, 12, 12, ${0.4 + lowSanitySeverity * 0.45}) ${Math.max(50, 75 - lowSanitySeverity * 15)}%, rgba(95, 0, 0, ${0.75 + lowSanitySeverity * 0.22}) 100%)`,
              boxShadow: `inset 0 0 ${80 + lowSanitySeverity * 120}px rgba(230, 20, 20, ${0.55 + lowSanitySeverity * 0.4})`,
              animationDuration: `${Math.max(0.4, 1.2 - lowSanitySeverity * 0.7)}s`,
            }}
          />
          {/* Peripheral Blood Vein Frame */}
          <div
            className="absolute inset-0 pointer-events-none z-[2] border-[8px] sm:border-[16px] border-red-700/40 transition-opacity duration-300 pointer-events-none"
            style={{
              opacity: 0.5 + lowSanitySeverity * 0.5,
              boxShadow: `inset 0 0 50px rgba(255, 10, 10, ${0.35 + lowSanitySeverity * 0.5})`,
            }}
          />
          {/* Extreme Low-Sanity Red Haze Flash when SAN <= 15% */}
          {sanity <= 15 && (
            <div
              className="absolute inset-0 pointer-events-none z-[3] bg-red-950/25 mix-blend-color-burn animate-pulse pointer-events-none"
              style={{ animationDuration: '0.45s' }}
            />
          )}
        </>
      )}

      {/* 3. Top Header Status Bar & Boss Health Bar */}
      <div className="relative z-10 flex flex-col gap-2.5 pointer-events-auto">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          {/* Left: Sanity & Exploration Depth */}
          <div className="flex flex-col gap-2">
            {/* Depth Counter & Exorcism Count */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-neutral-950/85 border border-neutral-800 backdrop-blur-md text-xs font-mono shadow-lg">
              <Footprints className="w-4 h-4 text-amber-400" />
              <span className="text-neutral-400">심도:</span>
              <span className="text-amber-400 font-bold text-sm tracking-wider">{depthMeters} m</span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-400">방:</span>
              <span className="text-neutral-200 font-semibold">{roomsExplored}</span>
              {exorcisedGhostCount > 0 && (
                <>
                  <span className="text-neutral-600">|</span>
                  <Ghost className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-400 font-bold">{exorcisedGhostCount}위 퇴마</span>
                </>
              )}
            </div>

            {/* Sanity Meter (SAN) */}
            <div
              className={`flex items-center gap-3 px-3.5 py-1.5 rounded-2xl backdrop-blur-md shadow-lg min-w-[200px] transition-all duration-300 ${
                isLowSanity
                  ? 'bg-red-950/90 border border-red-600/80 ring-1 ring-red-500/50 animate-pulse'
                  : 'bg-neutral-950/85 border border-neutral-800'
              }`}
            >
              {isLowSanity ? (
                <Heart className="w-4 h-4 text-red-500 animate-ping" />
              ) : (
                <Activity className={`w-4 h-4 ${sanityPercent < 50 ? 'text-amber-500' : 'text-emerald-400'}`} />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-center text-[11px] font-mono mb-1">
                  <span className={isLowSanity ? 'text-red-300 font-bold flex items-center gap-1' : 'text-neutral-400'}>
                    정신력 (SAN)
                    {maxSan > 100 && <span className="text-[10px] text-amber-400 font-bold">[결전각성]</span>}
                    {isLowSanity && <span className="text-[10px] text-red-400 animate-pulse">(심장박동 위험)</span>}
                  </span>
                  <span className={`font-bold ${isLowSanity ? 'text-red-400' : sanityPercent < 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {maxSan > 100 ? `${Math.round(sanity)}/${maxSan}` : `${Math.round(sanity)}%`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isLowSanity ? 'bg-red-600' : sanityPercent < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${sanityPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Center: Antique Compass HUD (Hidden when Boss fight is active to show boss bar) */}
          {!isBossFight && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-neutral-950/85 border border-amber-950/70 backdrop-blur-md text-xs font-mono text-amber-300 shadow-xl">
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="text-neutral-400">방위:</span>
              <span className="font-bold text-amber-400">{currentCardinal}</span>
              <span className="text-neutral-500 text-[10px]">({normalizedDegree}°)</span>
            </div>
          )}

          {/* Right: Light Status, Codex & Quick Settings Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Light Mode Indicator / Toggle */}
            <button
              onClick={onToggleLight}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-neutral-950/85 border border-neutral-800 hover:border-amber-600/80 backdrop-blur-md text-xs font-mono transition text-neutral-300 cursor-pointer shadow-md active:scale-95"
              title="[F] 손전등 점등/소등"
            >
              {lightMode === 'flashlight' && (
                <>
                  <Flashlight className="w-4 h-4 text-yellow-400" />
                  <span className="hidden xs:inline text-yellow-400 font-semibold">회중전등</span>
                  <span className="text-neutral-300 font-mono text-[11px]">{Math.round(battery)}%</span>
                </>
              )}
              {lightMode === 'lantern' && (
                <>
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span className="hidden xs:inline text-amber-400 font-semibold">호롱불</span>
                </>
              )}
              {lightMode === 'off' && (
                <>
                  <Flashlight className="w-4 h-4 text-neutral-600" />
                  <span className="hidden xs:inline text-neutral-500 font-semibold">소등</span>
                </>
              )}
            </button>

            {/* Relics Codex Button (Highlights 20 relics goal) */}
            <button
              onClick={() => handleOpenModal('codex')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-neutral-950/85 border backdrop-blur-md text-xs font-mono transition cursor-pointer shadow-md ${
                collectedRelics.length >= 20
                  ? 'border-rose-500/80 text-rose-300 animate-pulse'
                  : 'border-neutral-800 hover:border-amber-600/70 text-neutral-300 hover:text-amber-300'
              }`}
              title="수습한 유물 도감 (20개 수습 시 어둑시니 결계 해방)"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">유물</span>
              <span className={`px-1.5 py-0.5 rounded-full border text-[10px] font-bold ${
                collectedRelics.length >= 20
                  ? 'bg-rose-950 border-rose-600 text-rose-300'
                  : 'bg-amber-950/80 border-amber-800 text-amber-300'
              }`}>
                {collectedRelics.length}/20
              </span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => handleOpenModal('settings')}
              className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-neutral-950/85 border border-neutral-800 hover:border-cyan-600 backdrop-blur-md text-xs font-mono text-neutral-300 hover:text-cyan-300 transition cursor-pointer shadow-md"
              title="밝기 및 감도 설정"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">설정</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-2xl bg-neutral-950/85 border border-neutral-800 hover:border-neutral-700 backdrop-blur-md text-neutral-300 transition cursor-pointer"
              title="사운드 켜기/끄기"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
            </button>
          </div>
        </div>

        {/* BOSS HEALTH BAR (Appears when Eoduksini Boss Battle is Active) */}
        {isBossFight && (
          <div className="self-center w-full max-w-2xl px-4 py-2.5 rounded-3xl bg-neutral-950/95 border-2 border-rose-600/90 shadow-[0_0_35px_rgba(225,29,72,0.4)] backdrop-blur-xl animate-fade-in flex flex-col gap-2">
            <div className="flex items-center justify-between font-mono flex-wrap gap-1">
              <div className="flex items-center gap-2">
                <Skull className={`w-5 h-5 ${bossState.isEnraged ? 'text-red-500 animate-bounce' : 'text-rose-400'}`} />
                <span className="text-sm font-extrabold text-rose-300 tracking-wider">
                  {bossState.name}
                  {bossState.isEnraged ? ' [2단계: 암흑 폭주]' : ' [1단계: 흑야의 형상]'}
                </span>
                {bossState.currentPatternName && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-700/60 text-purple-300">
                    {bossState.currentPatternName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                <span>체력:</span>
                <span className="text-sm font-mono text-white bg-rose-950 px-2 py-0.5 rounded-lg border border-rose-700">
                  {bossState.currentHp} / {bossState.maxHp} HP
                </span>
              </div>
            </div>

            {/* 15 Hit Health Bar Segments */}
            <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden border border-rose-900/80 flex gap-0.5 p-0.5">
              {Array.from({ length: bossState.maxHp }).map((_, i) => {
                const isFilled = i < bossState.currentHp;
                return (
                  <div
                    key={i}
                    className={`flex-1 h-full rounded-sm transition-all duration-300 ${
                      isFilled
                        ? bossState.isEnraged
                          ? 'bg-gradient-to-t from-red-700 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                          : 'bg-gradient-to-t from-purple-800 to-rose-500'
                        : 'bg-neutral-950 opacity-40'
                    }`}
                  />
                );
              })}
            </div>

            {/* Boss Status Badge: Invulnerable vs Groggy (Stunned) */}
            <div className="flex items-center justify-between text-xs font-mono gap-2">
              {bossState.isStaggered ? (
                <div className="flex-1 flex items-center justify-center gap-1.5 py-1 px-3 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 font-bold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>[기절 / 그로기 상태! 무적 해제] 타격 기회: <span className="text-amber-400 text-sm underline">{bossState.staggerHitsLeft ?? 2} / 2회</span> 남음!</span>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-1.5 py-1 px-3 rounded-xl bg-purple-950/60 border border-purple-700/60 text-purple-300 text-[11px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                  <span>[흑무 무적 상태] 공격 진행 중에는 무적입니다! 패턴 종료 후 기절 타이밍을 노리십시오.</span>
                </div>
              )}
            </div>

            {/* Attack Warning Banner */}
            {bossState.attackWarning && (
              <div className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-mono font-bold animate-pulse">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span>{bossState.attackWarning}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Center Reticle / Crosshair & Interaction Prompt */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        {/* Reticle Dot */}
        <div
          className={`w-2.5 h-2.5 rounded-full border transition-all duration-150 ${
            hoveredTarget
              ? 'w-5 h-5 bg-amber-400/30 border-amber-300 scale-125 ring-4 ring-amber-400/30'
              : 'bg-white/60 border-white/80'
          }`}
        />

        {/* Hover Target Bubble */}
        {hoveredTarget && (
          <div className="absolute top-1/2 mt-7 px-4 py-2.5 rounded-2xl bg-neutral-950/95 border border-amber-500/80 backdrop-blur-md text-center shadow-2xl animate-fade-in pointer-events-auto flex flex-col items-center gap-1 max-w-xs sm:max-w-md">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{hoveredTarget.name}</span>
              <span className="text-[10px] text-neutral-400">({hoveredTarget.distance}m)</span>
            </div>
            <p className="text-[11px] text-neutral-300 font-mono leading-snug">{hoveredTarget.description}</p>
            {hoveredTarget.name.includes('문') ? (
              <div className="mt-1 px-4 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-xs font-mono shadow-sm">
                [E 키] {hoveredTarget.name.includes('열림') ? '미닫이문 닫기' : '미닫이문 열기'}
              </div>
            ) : (
              <button
                onClick={onInspect}
                className="mt-1 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-xs font-mono shadow-md cursor-pointer active:scale-95 transition"
              >
                [E / 클릭] 조사하기
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. Haunted Event Toast Alert */}
      {hauntedAlert && (
        <div className="self-center mb-3 px-5 py-2.5 rounded-2xl bg-rose-950/90 border border-rose-600 text-rose-200 text-xs font-mono shadow-2xl backdrop-blur-md animate-bounce flex items-center gap-2 z-20">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>{hauntedAlert.message}</span>
        </div>
      )}

      {/* 5. Bottom Navigation & Hotbar Inventory System (요청: 아래의 인벤토리 칸, 화살표로 교체 가능) */}
      <div className="relative z-20 flex flex-col items-center gap-2.5 pointer-events-auto">
        {/* Active Item Action Hint */}
        <div className="text-[11px] font-mono text-neutral-400 bg-neutral-950/90 border border-neutral-800/80 px-3.5 py-1 rounded-full backdrop-blur-md shadow-md flex items-center gap-2">
          <span className="text-amber-400 font-semibold">{activeItem.name}:</span>
          <span className="text-neutral-300">
            {activeItem.id === 'flashlight'
              ? '[F / 클릭] 전등 켜기/끄기'
              : activeItem.unlocked
              ? activeItem.id === 'exorcism_sword'
                ? '[F / 좌클릭] 사인참사검 검기 참격 (어둑시니 1타격)'
                : '[F / 좌클릭] 구천응원 봉인부적 결계 (기절 및 타격)'
              : '미로 속 안치실에서 획득 필요'}
          </span>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-500">[←/→ 화살표키 / 휠 / 1·2·3번]</span>
        </div>

        {/* Inventory Slots Container with Arrow Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-3xl bg-neutral-950/90 border border-neutral-800 backdrop-blur-lg shadow-2xl">
          {/* Left Arrow Button */}
          <button
            onClick={onPrevSlot}
            className="w-8 h-12 sm:w-9 sm:h-14 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500 text-neutral-400 hover:text-amber-300 flex items-center justify-center transition cursor-pointer active:scale-95"
            title="이전 슬롯 (← 화살표)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Slots */}
          {inventory.map((item, idx) => {
            const isSelected = activeSlotIndex === idx;
            const hotkeyLabel = idx === 0 ? '1 · Z' : idx === 1 ? '2 · X' : '3 · C';
            return (
              <button
                key={item.id}
                onClick={() => onSelectSlot(idx)}
                className={`relative flex flex-col items-center justify-center w-22 sm:w-28 h-14 sm:h-16 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-105'
                    : 'bg-neutral-900/70 border-neutral-800/80 hover:border-neutral-700 opacity-80 hover:opacity-100'
                } ${!item.unlocked ? 'grayscale opacity-40' : ''}`}
              >
                {/* Slot Number & Hotkey Badge */}
                <span className="absolute top-1 left-2 text-[10px] font-mono text-neutral-400 font-bold">
                  [{hotkeyLabel}]
                </span>

                {/* Icon */}
                <div className="mb-0.5">
                  {item.id === 'flashlight' && (
                    <Flashlight
                      className={`w-5 h-5 ${
                        isSelected ? 'text-amber-300' : 'text-neutral-400'
                      }`}
                    />
                  )}
                  {item.id === 'sealing_talisman' && (
                    <Scroll
                      className={`w-5 h-5 ${
                        item.unlocked
                          ? isSelected
                            ? 'text-amber-400'
                            : 'text-amber-600'
                          : 'text-neutral-500'
                      }`}
                    />
                  )}
                  {item.id === 'exorcism_sword' && (
                    <Sword
                      className={`w-5 h-5 ${
                        item.unlocked
                          ? isSelected
                            ? 'text-cyan-300'
                            : 'text-cyan-600'
                          : 'text-neutral-500'
                      }`}
                    />
                  )}
                </div>

                {/* Item Label */}
                <span
                  className={`text-[10px] sm:text-[11px] font-mono font-bold tracking-tight ${
                    isSelected ? 'text-amber-200' : 'text-neutral-400'
                  }`}
                >
                  {item.name}
                </span>

                {/* Status Indicator */}
                {!item.unlocked && (
                  <span className="text-[9px] font-mono text-rose-400/80">[미발견]</span>
                )}
              </button>
            );
          })}

          {/* Right Arrow Button */}
          <button
            onClick={onNextSlot}
            className="w-8 h-12 sm:w-9 sm:h-14 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500 text-neutral-400 hover:text-amber-300 flex items-center justify-center transition cursor-pointer active:scale-95"
            title="다음 슬롯 (→ 화살표)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Auxiliary Bar (Stamina & Controls) */}
        <div className="w-full flex items-center justify-between gap-4">
          {/* Controls Legend */}
          <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-neutral-950/85 border border-neutral-800 text-[11px] font-mono text-neutral-400 shadow-lg">
            <div><strong className="text-neutral-200">WASD</strong> 이동</div>
            <span className="text-neutral-700">•</span>
            <div><strong className="text-amber-300 font-bold">[1번/Z]</strong> 회중전등</div>
            <span className="text-neutral-700">•</span>
            <div><strong className="text-cyan-300 font-bold">[좌클릭/F]</strong> 전등·무기 사용</div>
            <span className="text-neutral-700">•</span>
            <div><strong className="text-amber-400 font-bold">[E / 우클릭]</strong> 정밀 조사·상호작용</div>
            <span className="text-neutral-700">•</span>
            <div><strong className="text-neutral-300">[휠/1·2·3]</strong> 무기 교체</div>
          </div>

          {/* Stamina Bar */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-neutral-950/85 border border-neutral-800 shadow-lg min-w-[150px] ml-auto">
            <Zap className={`w-3.5 h-3.5 ${stamina < 20 ? 'text-amber-500 animate-pulse' : 'text-cyan-400'}`} />
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-mono mb-0.5">
                <span className="text-neutral-400">체력</span>
                <span className="text-neutral-200 font-bold">{Math.round(stamina)}%</span>
              </div>
              <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-150"
                  style={{ width: `${stamina}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Mobile Virtual Touch Controls */}
      <div className="sm:hidden absolute bottom-28 inset-x-4 flex items-end justify-between pointer-events-auto z-20">
        {/* Virtual D-Pad for Movement */}
        <div className="grid grid-cols-3 gap-1.5 p-2 bg-neutral-950/90 border border-neutral-800 rounded-3xl backdrop-blur-md">
          <div />
          <button
            onPointerDown={() => onVirtualMove(0, -1)}
            onPointerUp={() => onVirtualMove(0, 0)}
            onPointerLeave={() => onVirtualMove(0, 0)}
            className="w-10 h-10 rounded-2xl bg-neutral-800 active:bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow"
          >
            ▲
          </button>
          <div />
          <button
            onPointerDown={() => onVirtualMove(-1, 0)}
            onPointerUp={() => onVirtualMove(0, 0)}
            onPointerLeave={() => onVirtualMove(0, 0)}
            className="w-10 h-10 rounded-2xl bg-neutral-800 active:bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow"
          >
            ◀
          </button>
          <button
            onPointerDown={() => onVirtualMove(0, 1)}
            onPointerUp={() => onVirtualMove(0, 0)}
            onPointerLeave={() => onVirtualMove(0, 0)}
            className="w-10 h-10 rounded-2xl bg-neutral-800 active:bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow"
          >
            ▼
          </button>
          <button
            onPointerDown={() => onVirtualMove(1, 0)}
            onPointerUp={() => onVirtualMove(0, 0)}
            onPointerLeave={() => onVirtualMove(0, 0)}
            className="w-10 h-10 rounded-2xl bg-neutral-800 active:bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow"
          >
            ▶
          </button>
        </div>

        {/* Action Buttons: Look Quick Buttons, Sprint, Exorcism/Inspect */}
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            <button
              onClick={() => onVirtualLook(0.65, 0)}
              className="w-10 h-10 rounded-2xl bg-neutral-900/90 border border-neutral-700 text-neutral-200 text-sm font-mono font-bold flex items-center justify-center active:bg-amber-600 shadow"
              title="좌회전"
            >
              ⟲
            </button>
            <button
              onClick={() => onVirtualLook(-0.65, 0)}
              className="w-10 h-10 rounded-2xl bg-neutral-900/90 border border-neutral-700 text-neutral-200 text-sm font-mono font-bold flex items-center justify-center active:bg-amber-600 shadow"
              title="우회전"
            >
              ⟳
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                const next = !isMobileSprint;
                setIsMobileSprint(next);
                onSprintToggle(next);
              }}
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-xs font-bold font-mono transition shadow ${
                isMobileSprint ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-neutral-900/90 border-neutral-800 text-neutral-400'
              }`}
            >
              질주
            </button>
            <button
              onClick={onUseActiveItem}
              className="w-11 h-11 rounded-2xl bg-amber-600 active:bg-amber-500 border border-amber-400 text-neutral-950 font-bold text-[11px] font-mono flex items-center justify-center shadow-lg"
            >
              사용
            </button>
          </div>
        </div>
      </div>

      {/* 7. Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md pointer-events-auto">
          <div className="relative max-w-lg w-full bg-neutral-950 border border-cyan-600/70 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-neutral-200 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-5">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg font-mono">
                <Sliders className="w-5 h-5" />
                <span>환경 설정 (밝기 및 조작 감도)</span>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Controls */}
            <div className="space-y-5 font-mono">
              {/* Brightness Control */}
              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 text-sm font-bold">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>게임 밝기 (Brightness)</span>
                  </div>
                  <span className="text-amber-400 font-bold text-sm">{Math.round(brightness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.6"
                  step="0.1"
                  value={brightness}
                  onChange={(e) => onChangeBrightness(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex items-center justify-between gap-2 pt-1">
                  {[1.0, 1.4, 1.8, 2.2, 2.6].map((b) => (
                    <button
                      key={b}
                      onClick={() => onChangeBrightness(b)}
                      className={`flex-1 py-1 text-[11px] rounded-xl border transition ${
                        Math.abs(brightness - b) < 0.05
                          ? 'bg-amber-600 text-neutral-950 font-bold border-amber-400'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {Math.round(b * 100)}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Sensitivity Control */}
              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-300 text-sm font-bold">
                    <MousePointer className="w-4 h-4 text-cyan-400" />
                    <span>마우스 & 터치 시점 감도 (Sensitivity)</span>
                  </div>
                  <span className="text-cyan-400 font-bold text-sm">{sensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="3.5"
                  step="0.1"
                  value={sensitivity}
                  onChange={(e) => onChangeSensitivity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex items-center justify-between gap-2 pt-1">
                  {[0.8, 1.2, 1.6, 2.0, 2.6, 3.2].map((s) => (
                    <button
                      key={s}
                      onClick={() => onChangeSensitivity(s)}
                      className={`flex-1 py-1 text-[11px] rounded-xl border transition ${
                        Math.abs(sensitivity - s) < 0.05
                          ? 'bg-cyan-600 text-neutral-950 font-bold border-cyan-400'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {s.toFixed(1)}x
                    </button>
                  ))}
                </div>
              </div>

              {/* CRT Scanline Filter Toggle */}
              <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-neutral-300">
                  <Tv className="w-4 h-4 text-neutral-400" />
                  <span>CRT 브라운관 스캔라인 필터</span>
                </div>
                <button
                  onClick={() => setCrtFilter(!crtFilter)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                    crtFilter ? 'bg-amber-600 border-amber-400 text-neutral-950' : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                  }`}
                >
                  {crtFilter ? '켜짐 (ON)' : '꺼짐 (OFF)'}
                </button>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={() => setShowSettings(false)}
              className="mt-5 w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold text-sm font-mono shadow-md transition cursor-pointer active:scale-98"
            >
              설정 저장 및 게임 복귀
            </button>
          </div>
        </div>
      )}

      {/* 8. Detailed Investigation Modal */}
      {investigationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-md pointer-events-auto">
          <div className="relative max-w-lg w-full bg-neutral-950 border border-amber-600/70 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-neutral-200 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base sm:text-lg font-mono">
                <Sparkles className="w-5 h-5" />
                <span>{investigationModal.title}</span>
              </div>
              <button
                onClick={onCloseInvestigation}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Text */}
            <div className="my-2 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-sm leading-relaxed text-neutral-300 font-mono">
              <p>{investigationModal.text}</p>
              {investigationModal.relic?.lore && (
                <div className="mt-4 pt-3 border-t border-neutral-800 text-xs text-amber-300/90">
                  <span className="font-semibold text-amber-400 block mb-1">[폐가 괴담 기록]</span>
                  <p className="italic">{investigationModal.relic.lore}</p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onCloseInvestigation}
              className="mt-4 w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-sm font-mono shadow-md transition cursor-pointer active:scale-98"
            >
              확인 및 탐험 계속하기
            </button>
          </div>
        </div>
      )}

      {/* 9. Relics & Lore Codex Modal */}
      {showCodex && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 backdrop-blur-md pointer-events-auto">
          <div className="relative max-w-2xl w-full max-h-[85vh] bg-neutral-950 border border-amber-600/70 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col text-neutral-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-lg font-mono">
                <BookOpen className="w-5 h-5" />
                <span>수습한 폐옥 유물 도감 ({collectedRelics.length} / 20종 발견)</span>
              </div>
              <button
                onClick={() => setShowCodex(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Codex List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {collectedRelics.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 font-mono text-sm">
                  <Ghost className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>아직 수습된 유물이 없습니다.</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    미로 속 제단실, 헛간, 부적 벽면을 조사([E])하여 유물 20개를 모아 어둑시니 결계를 해제하세요.
                  </p>
                </div>
              ) : (
                collectedRelics.map((relic) => (
                  <div
                    key={relic.id}
                    className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-700/60 transition flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 font-mono text-sm">{relic.name}</span>
                      <span className="text-[10px] font-mono text-neutral-500">심도 {relic.collectedAtDepth}m에서 발견</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed font-mono">{relic.description}</p>
                    <div className="p-2.5 rounded-xl bg-black/50 border border-neutral-800/80 text-[11px] text-amber-200/80 italic font-mono">
                      {relic.lore}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Footer */}
            <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setShowCodex(false)}
                className="px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono font-bold transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Escape & Boss Victory Screen */}
      {escapeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 backdrop-blur-xl pointer-events-auto">
          <div className="relative max-w-xl w-full bg-neutral-950 border-2 border-amber-500/90 rounded-3xl p-8 shadow-[0_0_60px_rgba(245,158,11,0.4)] flex flex-col items-center text-center animate-fade-in">
            {/* Victory Badge */}
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_25px_rgba(245,158,11,0.5)]">
              <Trophy className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
              {escapeModal.method === 'boss' || escapeModal.bossDefeated
                ? '[어둑시니 토벌 대성공: 결계 완전 소멸]'
                : '[폐가 탈출 성공: 미로의 결계 해제]'}
            </h2>
            <p className="text-xs font-mono text-amber-400/90 mt-1">
              {escapeModal.method === 'boss' || escapeModal.bossDefeated
                ? '20개의 신성한 유물을 공명시키고 사인참사검(四寅斬邪劍)으로 거대 요괴 어둑시니를 15연격으로 베어 소멸시켰습니다!'
                : escapeModal.method === 'relics'
                ? '신성한 퇴마 신물을 수습하여 미로의 저주를 정화했습니다!'
                : '백여 위의 원혼을 모조리 베어 퇴마하여 폐옥의 결계를 완벽하게 정화 파괴했습니다!'}
            </p>

            <div className="my-5 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 font-mono leading-relaxed text-left space-y-2">
              <p className="text-amber-300 font-semibold">
                {escapeModal.method === 'boss' || escapeModal.bossDefeated
                  ? '어둑시니의 거대한 그림자가 사인참사검의 신성한 칼날에 조각나며 허공으로 흩어졌습니다. 폐가 전체를 감싸고 있던 흑야의 저주가 산산이 부서지며 푸른 아침 햇살이 폐옥을 비춥니다.'
                  : '새벽녘의 여명과 함께 폐가의 뒤틀린 시공간이 본래 모습을 되찾았습니다. 무한히 반복되던 낡은 회랑과 방문들이 열리며 바깥세상으로의 탈출로가 열렸습니다.'}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800 text-[11px]">
                <div>• 최종 탐험 심도: <span className="text-amber-400 font-bold">{escapeModal.depthMeters}m</span></div>
                <div>• 돌파한 방의 수: <span className="text-emerald-400 font-bold">{escapeModal.roomsExplored}개소</span></div>
                <div>• 정화 퇴마한 원혼: <span className="text-rose-400 font-bold">{escapeModal.exorcisedCount}위</span></div>
                <div>• 수습한 괴담 유물: <span className="text-cyan-400 font-bold">{escapeModal.relicsCount} / 20개</span></div>
              </div>
            </div>

            <button
              onClick={onRestart}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm font-mono shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              <span>새로운 탐험 시작하기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
