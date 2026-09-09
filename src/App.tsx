import React, { useEffect, useRef, useState } from 'react';
import { InfiniteMazeEngine } from './game/InfiniteMazeEngine';
import { MazeHUD } from './components/MazeHUD';
import { JumpscareOverlay } from './components/JumpscareOverlay';
import { ScreenBloodOverlay } from './components/ScreenBloodOverlay';
import { mazeAudio } from './audio/mazeHorrorAudio';
import { RelicItem, HauntedEvent, InventoryItem, JumpscareEvent } from './types';
import {
  Compass,
  Footprints,
  Ghost,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Flame,
  BookOpen,
  Volume2,
  Sword,
  Scroll
} from 'lucide-react';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<InfiniteMazeEngine | null>(null);

  // Game Status
  const [gameStatus, setGameStatus] = useState<'intro' | 'playing' | 'game_over'>('intro');

  // Player Stats
  const [sanity, setSanity] = useState<number>(100);
  const [maxSanity, setMaxSanity] = useState<number>(100);
  const [stamina, setStamina] = useState<number>(200);
  const [maxStamina, setMaxStamina] = useState<number>(200);
  const [battery, setBattery] = useState<number>(100);
  const [lightMode, setLightMode] = useState<'flashlight' | 'lantern' | 'off'>('flashlight');
  const [depthMeters, setDepthMeters] = useState<number>(0);
  const [roomsExplored, setRoomsExplored] = useState<number>(1);
  const [collectedRelics, setCollectedRelics] = useState<RelicItem[]>([]);
  const [playerYaw, setPlayerYaw] = useState<number>(0);

  // Inventory & Combat Stats
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 'flashlight',
      name: '회중전등',
      description: '어두운 미로를 밝혀주는 기본 탐험 장비 [1번/Z]',
      unlocked: true,
      iconType: 'flashlight'
    },
    {
      id: 'sealing_talisman',
      name: '봉인부적',
      description: '미로 속 제단에서 획득하는 원혼 퇴마 부적 [2번/X]',
      unlocked: false,
      iconType: 'talisman'
    },
    {
      id: 'exorcism_sword',
      name: '사인참사검',
      description: '미로 속 보검대에서 뽑아드는 전설의 보검 [3번/C/G]',
      unlocked: false,
      iconType: 'sword'
    }
  ]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [exorcisedGhostCount, setExorcisedGhostCount] = useState<number>(0);
  const [extraLives, setExtraLives] = useState<number>(2);
  const [lives, setLives] = useState<number>(3);
  const [bloodLevel, setBloodLevel] = useState<number>(0);
  const [nearestGhostDist, setNearestGhostDist] = useState<number>(999);
  const [isInvincible, setIsInvincible] = useState<boolean>(false);
  const [escapeModal, setEscapeModal] = useState<{
    method: 'relics' | 'kills' | 'boss';
    exorcisedCount: number;
    depthMeters: number;
    roomsExplored: number;
    relicsCount: number;
    bossDefeated?: boolean;
  } | null>(null);

  // Sound & Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [brightness, setBrightness] = useState<number>(1.5);
  const [sensitivity, setSensitivity] = useState<number>(1.6);

  // Hover & Investigation
  const [hoveredTarget, setHoveredTarget] = useState<{
    name: string;
    description: string;
    distance: number;
  } | null>(null);
  const [investigationModal, setInvestigationModal] = useState<{
    relic: RelicItem | null;
    title: string;
    text: string;
  } | null>(null);
  const [hauntedAlert, setHauntedAlert] = useState<HauntedEvent | null>(null);
  const [currentJumpscare, setCurrentJumpscare] = useState<JumpscareEvent | null>(null);

  // Initialize and mount 3D Infinite Maze Engine
  useEffect(() => {
    if (!containerRef.current || gameStatus !== 'playing') return;

    const engine = new InfiniteMazeEngine(containerRef.current);
    engine.setBrightness(brightness);
    engine.setSensitivity(sensitivity);
    engineRef.current = engine;

    // Callbacks
    engine.onInspectCallback = (relic, title, desc) => {
      engine.releasePointerLock();
      setInvestigationModal({ relic, title, text: desc });
    };

    engine.onHauntedEvent = (event) => {
      setHauntedAlert(event);
      setTimeout(() => {
        setHauntedAlert(null);
      }, 3500);
    };

    engine.onJumpscare = (event) => {
      setCurrentJumpscare(event);
    };

    engine.onStatsUpdate = () => {
      if (!engineRef.current) return;
      setSanity(engineRef.current.sanity);
      setMaxSanity(engineRef.current.maxSanity);
      setCollectedRelics([...engineRef.current.collectedRelics]);
      setRoomsExplored(engineRef.current.roomsExplored.size);
      setInventory([...engineRef.current.inventory]);
      setActiveSlotIndex(engineRef.current.activeSlotIndex);
      setExorcisedGhostCount(engineRef.current.exorcisedGhostCount);
      setLives(engineRef.current.lives);
      setExtraLives(engineRef.current.extraLives);
      setBloodLevel(engineRef.current.bloodLevel);
      setNearestGhostDist(engineRef.current.nearestGhostDistance);
      setIsInvincible(engineRef.current.isInvincible);
    };

    // State sync loop
    const syncInterval = setInterval(() => {
      if (engineRef.current) {
        setSanity(engineRef.current.sanity);
        setMaxSanity(engineRef.current.maxSanity);
        setStamina(engineRef.current.stamina);
        setBattery(engineRef.current.battery);
        setLightMode(engineRef.current.lightMode);
        setDepthMeters(engineRef.current.depthMeters);
        setPlayerYaw(engineRef.current.playerYaw);
        setHoveredTarget(engineRef.current.hoveredInteractable);
        setInventory([...engineRef.current.inventory]);
        setActiveSlotIndex(engineRef.current.activeSlotIndex);
        setExorcisedGhostCount(engineRef.current.exorcisedGhostCount);
        setExtraLives(engineRef.current.extraLives);
        setLives(engineRef.current.lives);
        setBloodLevel(engineRef.current.bloodLevel);
        setNearestGhostDist(engineRef.current.nearestGhostDistance);
        setIsInvincible(engineRef.current.isInvincible);
        setCollectedRelics([...engineRef.current.collectedRelics]);

        // Check Victory escape condition (Only Eoduksini Boss defeat escapes!)
        if (engineRef.current.isEscaped && !escapeModal) {
          engineRef.current.releasePointerLock();
          setEscapeModal({
            method: 'boss',
            exorcisedCount: engineRef.current.exorcisedGhostCount,
            depthMeters: engineRef.current.depthMeters,
            roomsExplored: engineRef.current.roomsExplored.size,
            relicsCount: engineRef.current.collectedRelics.length,
            bossDefeated: true,
          });
        }

        // Check Defeat condition: Only triggers when player has exhausted all lives (0 lives left) and sanity reaches 0, and no active jumpscare!
        if (engineRef.current.lives <= 0 && engineRef.current.sanity <= 0 && !engineRef.current.isEscaped) {
          if (!currentJumpscare) {
            setGameStatus('game_over');
            mazeAudio.playHorrorStinger();
          }
        }
      }
    }, 60);

    return () => {
      clearInterval(syncInterval);
      engine.destroy();
      engineRef.current = null;
    };
  }, [gameStatus]);

  const handleChangeBrightness = (newVal: number) => {
    setBrightness(newVal);
    if (engineRef.current) {
      engineRef.current.setBrightness(newVal);
    }
  };

  const handleChangeSensitivity = (newVal: number) => {
    setSensitivity(newVal);
    if (engineRef.current) {
      engineRef.current.setSensitivity(newVal);
    }
  };

  const handleReleasePointerLock = () => {
    if (engineRef.current) {
      engineRef.current.releasePointerLock();
    }
  };

  const handleStartGame = () => {
    mazeAudio.init();
    mazeAudio.resumeAudio();
    mazeAudio.startAmbient();
    setSanity(100);
    setMaxSanity(100);
    setStamina(200);
    setMaxStamina(200);
    setBattery(100);
    setDepthMeters(0);
    setRoomsExplored(1);
    setCollectedRelics([]);
    setExorcisedGhostCount(0);
    setExtraLives(2);
    setLives(3);
    setBloodLevel(0);
    setNearestGhostDist(999);
    setIsInvincible(false);
    setEscapeModal(null);
    setCurrentJumpscare(null);
    setGameStatus('playing');
  };

  const handleChallengeBoss = () => {
    if (engineRef.current) {
      engineRef.current.transitionToBossFight();
    }
  };

  const handleRestart = () => {
    setEscapeModal(null);
    setCurrentJumpscare(null);
    setLives(3);
    setBloodLevel(0);
    setNearestGhostDist(999);
    setGameStatus('intro');
  };

  const handleToggleLight = () => {
    if (engineRef.current) {
      engineRef.current.toggleLight();
      setLightMode(engineRef.current.lightMode);
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    mazeAudio.setMuted(!next);
  };

  const handleInspectCurrent = () => {
    if (engineRef.current) {
      engineRef.current.inspectTarget();
    }
  };

  const handleVirtualMove = (x: number, y: number) => {
    if (engineRef.current) {
      engineRef.current.setVirtualMove(x, y);
    }
  };

  const handleVirtualLook = (deltaYaw: number, deltaPitch: number) => {
    if (engineRef.current) {
      engineRef.current.rotateViewBy(deltaYaw, deltaPitch);
    }
  };

  const handleSprintToggle = (sprinting: boolean) => {
    if (engineRef.current) {
      engineRef.current.isSprinting = sprinting;
    }
  };

  const handleSelectSlot = (idx: number) => {
    if (engineRef.current) {
      engineRef.current.setActiveSlot(idx);
      setActiveSlotIndex(engineRef.current.activeSlotIndex);
    }
  };

  const handlePrevSlot = () => {
    if (engineRef.current) {
      engineRef.current.prevSlot();
      setActiveSlotIndex(engineRef.current.activeSlotIndex);
    }
  };

  const handleNextSlot = () => {
    if (engineRef.current) {
      engineRef.current.nextSlot();
      setActiveSlotIndex(engineRef.current.activeSlotIndex);
    }
  };

  const handleUseActiveItem = () => {
    if (engineRef.current) {
      engineRef.current.useActiveItem();
    }
  };

  const handleCloseInvestigation = () => {
    setInvestigationModal(null);
    if (containerRef.current) {
      containerRef.current.requestPointerLock();
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans select-none">
      {/* 3D Three.js Viewport */}
      {gameStatus === 'playing' && (
        <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-crosshair z-0" />
      )}

      {/* Playing HUD Overlay */}
      {gameStatus === 'playing' && (
        <>
          <ScreenBloodOverlay bloodLevel={bloodLevel} />
          <MazeHUD
            sanity={sanity}
            maxSanity={maxSanity}
            stamina={stamina}
            maxStamina={maxStamina}
            battery={battery}
            lightMode={lightMode}
            depthMeters={depthMeters}
            roomsExplored={roomsExplored}
            collectedRelics={collectedRelics}
            inventory={inventory}
            activeSlotIndex={activeSlotIndex}
            onSelectSlot={handleSelectSlot}
            onPrevSlot={handlePrevSlot}
            onNextSlot={handleNextSlot}
            onUseActiveItem={handleUseActiveItem}
            exorcisedGhostCount={exorcisedGhostCount}
            bossState={engineRef.current?.bossState || { active: false, name: '어둑시니', maxHp: 15, currentHp: 15, phase: 1, isStaggered: false, isInvulnerable: true }}
            lives={lives}
            bloodLevel={bloodLevel}
            nearestGhostDistance={nearestGhostDist}
            extraLives={extraLives}
            isInvincible={isInvincible}
            onChallengeBoss={handleChallengeBoss}
            escapeModal={escapeModal}
            onRestart={handleRestart}
            hoveredTarget={hoveredTarget}
            onToggleLight={handleToggleLight}
            onInspect={handleInspectCurrent}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            investigationModal={investigationModal}
            onCloseInvestigation={handleCloseInvestigation}
            hauntedAlert={hauntedAlert}
            onVirtualMove={handleVirtualMove}
            onVirtualLook={handleVirtualLook}
            onSprintToggle={handleSprintToggle}
            playerYaw={playerYaw}
            brightness={brightness}
            onChangeBrightness={handleChangeBrightness}
            sensitivity={sensitivity}
            onChangeSensitivity={handleChangeSensitivity}
            onReleasePointerLock={handleReleasePointerLock}
          />
        </>
      )}

      {/* Intro / Start Screen */}
      {gameStatus === 'intro' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-neutral-950/95 p-6 backdrop-blur-md">
          {/* Subtle Ambient Darkness & Embers Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,24,12,0.45)_0,rgba(5,3,3,0.98)_100%)] pointer-events-none" />

          <div className="relative max-w-xl w-full bg-black/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-mono mb-4">
              <Compass className="w-3.5 h-3.5" />
              <span>1982년 폐쇄 국립정신병원 · 끝없는 미로</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 tracking-tight leading-tight">
              폐병원: 끝없는 미로
            </h1>
            <p className="text-sm font-mono text-neutral-400 mt-1">Haunted Abandoned Hospital Labyrinth</p>

            {/* Atmosphere Lore & Rules Box */}
            <div className="w-full my-6 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-left text-xs leading-relaxed text-neutral-300 space-y-2.5 font-mono">
              <p className="text-amber-400 font-semibold flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" /> [생존 및 탈출 규칙]
              </p>
              <p>• <strong>유일한 탈출 조건:</strong> 오직 어둠의 거대 군주 <strong>[어둑시니]</strong>를 쓰러뜨려야만 폐병원의 결계가 깨지고 탈출할 수 있습니다.</p>
              <p className="text-amber-300">
                • <strong>어둑시니 결계 진입 조건:</strong> <strong>[유물 20종 전수 수습]</strong> + <strong>[구천응원 봉인부적]</strong> + <strong>[사인참사검]</strong> 3가지를 모두 갖추어야만 어둑시니의 결계가 열립니다!
              </p>
              <p className="text-rose-300">
                • <strong>제자리 부활 (목숨 2개 추가):</strong> 귀신에게 잡히더라도 <strong>총 3개의 목숨(제자리 부활 2회)</strong>이 주어집니다! 부활 시 정신력/스태미나 완충 및 <strong>귀신이 20m 이상 멀리 튕겨져 나갑니다.</strong>
              </p>
              <p>• <strong>체력 증강 (스태미나 200):</strong> 스태미나가 200으로 확장되어 원혼의 추격을 피해 더 오래 질주할 수 있습니다.</p>
              <p>• <strong>응급 처치대와 링거 수액:</strong> 처치대 카트를 조사([E])하면 깎여나간 정신력(SAN)을 100% 완전 회복합니다.</p>
            </div>

            {/* Controls Guide Table */}
            {/* Controls Guide Table (컴퓨터 & 노트북 완벽 지원) */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-neutral-300 mb-4 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800/80 text-left">
              <div><strong className="text-white">WASD</strong> 이동</div>
              <div><strong className="text-white">마우스 이동</strong> 시점 회전</div>
              <div><strong className="text-white">Shift</strong> 전력 질주</div>
              <div><strong className="text-amber-300 font-bold">[1번/Z]</strong> 회중전등 (기본)</div>
              <div><strong className="text-cyan-300 font-bold">[좌클릭/F]</strong> 전등·무기 사용</div>
              <div><strong className="text-amber-400 font-bold">[E / 우클릭]</strong> 문·처치대·유물</div>
              <div className="col-span-2 sm:col-span-3 text-neutral-400 text-[10px] border-t border-neutral-800/60 pt-1.5 mt-0.5">
                • <strong>신물 탐색:</strong> 봉인부적[2번/X]과 사인참사검[3번/C]은 미로 속 격리실 제단과 보검대에서 찾아내야 합니다.<br />
                • <strong>정밀 조준 상호작용:</strong> 처치대나 유물은 화면 정중앙으로 조준한 상태에서 [E] 키 또는 클릭해야 작동합니다.
              </div>
            </div>

            {/* Quick Brightness & Sensitivity Tuner */}
            <div className="w-full flex items-center justify-between gap-4 p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800 text-xs font-mono mb-6 text-neutral-300">
              <div className="flex-1 flex items-center gap-2">
                <span className="text-amber-400 font-bold">밝기:</span>
                <input
                  type="range"
                  min="0.8"
                  max="2.6"
                  step="0.1"
                  value={brightness}
                  onChange={(e) => handleChangeBrightness(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-amber-300 min-w-[36px] text-right font-bold">{Math.round(brightness * 100)}%</span>
              </div>
              <div className="h-4 w-px bg-neutral-700" />
              <div className="flex-1 flex items-center gap-2">
                <span className="text-cyan-400 font-bold">감도:</span>
                <input
                  type="range"
                  min="0.6"
                  max="3.5"
                  step="0.1"
                  value={sensitivity}
                  onChange={(e) => handleChangeSensitivity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-cyan-300 min-w-[32px] text-right font-bold">{sensitivity.toFixed(1)}x</span>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartGame}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-neutral-950 font-bold text-base shadow-[0_0_25px_rgba(16,185,129,0.4)] transition flex items-center justify-center gap-2 cursor-pointer font-mono"
            >
              <Play className="w-5 h-5 fill-neutral-950" />
              <span>폐병원 정문 열기 (미로 진입)</span>
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameStatus === 'game_over' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/95 p-6 backdrop-blur-lg">
          <div className="relative max-w-lg w-full bg-neutral-950 border border-rose-900/60 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-600 flex items-center justify-center text-rose-500 mb-4 animate-pulse">
              <Ghost className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-rose-400">정신력 붕괴 (SAN: 0)</h2>
            <p className="text-xs font-mono text-neutral-500 mt-1">[끝없는 어둠 속에 잠식되었습니다]</p>

            <p className="text-sm text-neutral-300 my-5 leading-relaxed bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 font-mono">
              끝없는 폐병원의 미로 속에서 공포를 이기지 못하고 이성을 잃었습니다. 당신의 발소리는 이제 차디찬 병원 복도 타일 아래 영원한 원혼의 비명이 되었습니다.
            </p>

            {/* Run Stats */}
            <div className="w-full flex items-center justify-around py-3.5 mb-6 bg-neutral-900/60 rounded-2xl border border-neutral-800 text-xs font-mono">
              <div>
                <span className="text-neutral-500 block">최대 도달 심도</span>
                <span className="text-amber-400 font-bold text-sm">{depthMeters} m</span>
              </div>
              <div className="h-6 w-px bg-neutral-800" />
              <div>
                <span className="text-neutral-500 block">탐색한 방</span>
                <span className="text-emerald-400 font-bold text-sm">{roomsExplored} 개소</span>
              </div>
              <div className="h-6 w-px bg-neutral-800" />
              <div>
                <span className="text-neutral-500 block">퇴마한 원혼</span>
                <span className="text-rose-400 font-bold text-sm">{exorcisedGhostCount} 위</span>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="w-full py-3.5 rounded-2xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(225,29,72,0.4)] transition flex items-center justify-center gap-2 cursor-pointer font-mono"
            >
              <RotateCcw className="w-4 h-4" />
              <span>폐병원 입구에서 다시 시작</span>
            </button>
          </div>
        </div>
      )}

      {/* Terrifying Jumpscare Overlay on Ghost Attacks */}
      <JumpscareOverlay
        event={currentJumpscare}
        onComplete={() => {
          setCurrentJumpscare(null);
          if (engineRef.current && (engineRef.current.lives <= 0 || engineRef.current.isPendingGameOver)) {
            setGameStatus('game_over');
            mazeAudio.playHorrorStinger();
          }
        }}
      />
    </div>
  );
}
