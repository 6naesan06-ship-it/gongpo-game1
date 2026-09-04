import * as THREE from 'three';
import { AbandonedMansionAssets } from './proceduralAssets';
import { AbandonedMansionTextures } from './textures';
import { mazeAudio } from '../audio/mazeHorrorAudio';
import { RelicItem, HauntedEvent, InventorySlotItem, EscapeVictoryData, BossState, JumpscareEvent } from '../types';

export interface ChunkInfo {
  gx: number;
  gz: number;
  group: THREE.Group;
  walls: { minX: number; maxX: number; minZ: number; maxZ: number }[];
  interactables: {
    mesh: THREE.Object3D;
    relic?: RelicItem;
    type: 'relic' | 'altar' | 'door' | 'talisman' | 'mask' | 'talisman_sacred' | 'sword_sacred';
    name: string;
    description: string;
    doorId?: string;
  }[];
}

export interface ActiveDoor {
  id: string;
  group: THREE.Group;
  slidingLeaf: THREE.Group;
  isOpen: boolean;
  slideProgress: number; // 0 (closed) to 1 (open)
  targetSlide: number; // 0 or 1
  edge: 'north' | 'south' | 'west' | 'east';
  chunkGx: number;
  chunkGz: number;
  wallBox: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export interface ActiveGhost {
  id: string;
  name: string;
  variant: 'white_robe' | 'shadow_specter';
  mesh: THREE.Group;
  pos: THREE.Vector3;
  targetPos: THREE.Vector3;
  state: 'wandering' | 'stalking' | 'charging';
  speed: number;
  bobTimer: number;
  wanderTimer: number;
  chunkKey: string;
  originX: number;
  originZ: number;
  soundCooldown: number;
  attackCooldown: number;
  isDead: boolean;
  respawnTimer: number;
}

export class InfiniteMazeEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private container: HTMLElement;

  // Player state
  public playerPos: THREE.Vector3 = new THREE.Vector3(0, 1.5, 0);
  public playerVelocity: THREE.Vector3 = new THREE.Vector3();
  public playerYaw: number = 0;
  public playerPitch: number = 0;
  public isSprinting: boolean = false;
  public stamina: number = 100;
  public sanity: number = 100;
  public maxSanity: number = 100;
  public battery: number = 100;
  public lightMode: 'flashlight' | 'lantern' | 'off' = 'flashlight';

  // Inventory System & Relics
  public inventory: InventorySlotItem[] = [
    {
      id: 'flashlight',
      name: '회중전등',
      category: 'tool',
      icon: 'flashlight',
      description: '어두운 복도와 방을 밝히는 필수 탐험 장비입니다. [F / 마우스 클릭]으로 켜고 끌 수 있습니다.',
      actionPrompt: '전등 켜기/끄기',
      unlocked: true,
    },
    {
      id: 'sealing_talisman',
      name: '구천응원 봉인부적',
      category: 'talisman',
      icon: 'scroll',
      description: '태상노군의 진언이 깃든 영험한 주사 부적. 원혼을 향해 내지르면 신성한 결계 화염으로 악귀를 봉인 퇴마합니다.',
      actionPrompt: '봉인 결계 방출 (퇴마)',
      unlocked: false,
    },
    {
      id: 'exorcism_sword',
      name: '사인참사검 (四寅斬邪劍)',
      category: 'weapon',
      icon: 'sword',
      description: '인년, 인월, 인일, 인시에 벼려진 신성한 보검. [좌클릭 / F]로 휘둘러 접근하는 원혼을 즉시 베어 퇴마합니다.',
      actionPrompt: '퇴마 참격 베기 (원혼 즉시 퇴마)',
      unlocked: false,
    },
  ];
  public activeSlotIndex: number = 0; // 시작 시 필수 장비인 회중전등을 들고 시작
  public exorcisedGhostCount: number = 0;
  public hasTalisman: boolean = false;
  public hasSword: boolean = false;
  public isEscaped: boolean = false;
  public escapeMethod: 'relics' | 'kills' | 'boss' = 'relics';

  // Boss Battle State: Eoduksini (어둑시니 보스전)
  public isBossFightActive: boolean = false;
  public bossState: BossState = {
    active: false,
    name: '어둑시니',
    maxHp: 15,
    currentHp: 15,
    phase: 1,
    isStaggered: false,
    isInvulnerable: true,
    staggerHitsLeft: 2,
    isEnraged: false,
    currentPatternName: '흑야의 기운',
    attackWarning: null,
  };
  public bossMesh: THREE.Group | null = null;
  public bossArenaGroup: THREE.Group | null = null;
  public bossPos: THREE.Vector3 = new THREE.Vector3(0, 0, -5.5);
  private bossTimer: number = 0;
  private bossPhaseState: 'IDLE' | 'TELEGRAPH' | 'ATTACKING' | 'GROGGY' = 'IDLE';
  private bossPatternIndex: number = 0;
  private bossPatternTimer: number = 1.2;
  private bossTelegraphTimer: number = 0;
  private bossActionTimer: number = 0;
  private bossStaggerTimer: number = 0;
  private bossTeleportTimer: number = 7.0;
  private bossHitInvulnerableCooldown: number = 0;
  private bossBarrierMesh: THREE.Mesh | null = null;
  private bossStunEffectGroup: THREE.Group | null = null;
  private bossShockwaveMesh: THREE.Mesh | null = null;
  private bossLightningGroup: THREE.Group | null = null;
  private bossMirageMeshes: THREE.Group[] = [];
  private bossVortexCenter: THREE.Vector3 = new THREE.Vector3();

  // Viewmodels
  private viewmodelGroup: THREE.Group;
  private vmFlashlight: THREE.Group;
  private vmTalisman: THREE.Group;
  private vmSword: THREE.Group;
  private vmSwordLight: THREE.PointLight;
  private vmIsAttacking: boolean = false;
  private vmAttackTimer: number = 0;
  private lastAttackTime: number = 0;

  // Configurable Settings
  public brightnessMultiplier: number = 1.4;
  public sensitivityMultiplier: number = 1.5;

  // Lights
  private flashlight: THREE.SpotLight;
  private flashlightTarget: THREE.Object3D;
  private lanternLight: THREE.PointLight;
  private ambientLight: THREE.AmbientLight;
  private dustParticles: THREE.Points | null = null;
  private mistParticles: THREE.Points | null = null;
  private dustPositions: Float32Array | null = null;
  private mistPositions: Float32Array | null = null;
  private particleTime: number = 0;

  // Controls
  private keys: { [key: string]: boolean } = {};
  private baseMouseSensitivity: number = 0.0036;
  public isPointerLocked: boolean = false;
  private isMouseDown: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private virtualMoveVector: { x: number; y: number } = { x: 0, y: 0 };
  private lastWheelTime: number = 0;

  // Touch drag state
  private activeTouchId: number | null = null;
  private lastTouchX: number = 0;
  private lastTouchY: number = 0;

  // World Generation & Chunks (Optimized for ultra-smooth 60fps & zero-lag room transitions on PC/Laptop)
  public chunkSize: number = 8.5; // 8.5m per room
  public chunkRadius: number = 1; // 3x3 active grid (9 rooms) perfectly covers field of view through doorways with 0 hitching
  private activeChunks: Map<string, ChunkInfo> = new Map();
  private chunkCache: Map<string, ChunkInfo> = new Map();
  private lastChunkX: number = 99999;
  private lastChunkZ: number = 99999;

  // Stats & Progress
  public depthMeters: number = 0;
  public roomsExplored: Set<string> = new Set();
  public collectedRelics: RelicItem[] = [];

  // Interactive Doors Map
  public activeDoors: Map<string, ActiveDoor> = new Map();

  // Dynamic Roaming & Chasing Ghosts
  public dynamicGhosts: ActiveGhost[] = [];

  // Interaction & Raycasting
  public hoveredInteractable: { name: string; description: string; distance: number } | null = null;
  private currentRaycastTarget: ChunkInfo['interactables'][0] | null = null;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private centerScreen: THREE.Vector2 = new THREE.Vector2(0, 0);

  // Callbacks
  public onInspectCallback?: (relic: RelicItem | null, title: string, desc: string) => void;
  public onHauntedEvent?: (event: HauntedEvent) => void;
  public onJumpscare?: (event: JumpscareEvent) => void;
  public onStatsUpdate?: () => void;
  public onEscapeVictory?: (data: EscapeVictoryData) => void;

  // Animation & Loop
  private animFrameId: number | null = null;
  private lastTime: number = performance.now();
  private footstepTimer: number = 0;
  private headBobTimer: number = 0;
  private ghostCheckTimer: number = 0;
  private lightningTimer: number = 12;
  private raycastTimer: number = 0;
  private cameraShakeIntensity: number = 0;
  private bossJumpscareCooldown: number = 0;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene & Enhanced Visible Atmosphere (Much clearer and brighter)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1118);
    // Softer fog for better visibility across the expanded rooms
    this.scene.fog = new THREE.FogExp2(0x10141d, 0.030);

    // 2. Camera with expanded far frustum
    this.camera = new THREE.PerspectiveCamera(
      72,
      container.clientWidth / container.clientHeight,
      0.1,
      70
    );
    this.camera.position.copy(this.playerPos);
    this.scene.add(this.camera);

    // 3. Optimized Renderer with high exposure tone mapping & balanced pixel ratio for smooth 60fps on PC/laptops
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'mediump',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap; // Ultra-fast PCF shadow filtering for PC and laptop GPUs
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    container.appendChild(this.renderer.domElement);

    // 4. Enhanced Brighter Lights
    // Ambient Light: Soft illumination across the entire wooden mansion
    this.ambientLight = new THREE.AmbientLight(0x405068, 1.1);
    this.scene.add(this.ambientLight);

    // Flashlight: Wide, powerful beam with anti-acne shadow map
    this.flashlight = new THREE.SpotLight(0xfff3e0, 8.5, 28, Math.PI / 4.2, 0.55, 1.1);
    this.flashlight.castShadow = true;
    this.flashlight.shadow.mapSize.width = 1024;
    this.flashlight.shadow.mapSize.height = 1024;
    this.flashlight.shadow.camera.near = 0.2;
    this.flashlight.shadow.camera.far = 28;
    this.flashlight.shadow.bias = -0.0001;
    this.flashlight.shadow.normalBias = 0.025;

    this.flashlightTarget = new THREE.Object3D();
    this.scene.add(this.flashlightTarget);
    this.flashlight.target = this.flashlightTarget;
    this.scene.add(this.flashlight);

    // Lantern Light: Warm glowing omnidirectional flame
    this.lanternLight = new THREE.PointLight(0xffa544, 5.5, 18, 1.2);
    this.lanternLight.visible = false;
    this.scene.add(this.lanternLight);

    // 5. First-Person Handheld Viewmodels
    this.viewmodelGroup = new THREE.Group();
    this.camera.add(this.viewmodelGroup);

    // Viewmodel Flashlight
    this.vmFlashlight = AbandonedMansionAssets.createFlashlightModel();
    this.vmFlashlight.position.set(0.22, -0.22, -0.42);
    this.vmFlashlight.rotation.set(-0.05, 0.08, 0);
    this.viewmodelGroup.add(this.vmFlashlight);

    // Viewmodel Sealing Talisman (Emissive holy glow)
    this.vmTalisman = new THREE.Group();
    const talMesh = AbandonedMansionAssets.createTalisman(0.24, 0.52);
    talMesh.position.set(0, 0, 0);
    this.vmTalisman.add(talMesh);
    const talGlow = new THREE.Mesh(
      AbandonedMansionAssets.getPlane(0.26, 0.54),
      new THREE.MeshBasicMaterial({ color: 0xffaa22, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    );
    talGlow.position.set(0, 0, -0.002);
    this.vmTalisman.add(talGlow);
    this.vmTalisman.position.set(0.2, -0.18, -0.38);
    this.vmTalisman.rotation.set(0.12, -0.15, 0.05);
    this.vmTalisman.visible = false;
    this.viewmodelGroup.add(this.vmTalisman);

    // Viewmodel Exorcism Sword (사인참사검 1인칭 뷰모델)
    this.vmSword = AbandonedMansionAssets.createExorcismSword();
    this.vmSword.scale.set(0.65, 0.65, 0.65);
    this.vmSword.position.set(0.22, -0.19, -0.38);
    this.vmSword.rotation.set(0.38, -0.24, 0.42);
    this.vmSword.visible = false;

    // 신성한 28수 성광 광원 (검신에 깃든 푸른 검기)
    this.vmSwordLight = new THREE.PointLight(0x38bdf8, 2.6, 5.0);
    this.vmSwordLight.position.set(0, 0.45, 0.05);
    this.vmSword.add(this.vmSwordLight);

    this.viewmodelGroup.add(this.vmSword);

    // 6. Atmospheric Particles (Optimized lightweight count)
    this.createDustMotes();

    // 7. Events & Listeners
    this.bindEvents();

    // 8. Initial Chunk Generation
    this.updateChunks();

    // 9. Pre-warm WebGL Shaders to eliminate runtime pipeline compilation hitching
    try {
      this.renderer.compile(this.scene, this.camera);
    } catch {
      // safe fallback
    }

    // 10. Place Persistent Roaming Ghosts across the mansion
    this.initTenGhosts();

    // 11. Start Loop
    this.animate();
  }

  // Balanced 4 persistent Korean folk ghosts with optimized AI & smooth 60fps
  private initTenGhosts() {
    // Clear any previous ghosts
    for (const g of this.dynamicGhosts) {
      this.scene.remove(g.mesh);
    }
    this.dynamicGhosts = [];

    const ghostConfigs: {
      id: string;
      name: string;
      variant: 'white_robe' | 'shadow_specter';
      gx: number;
      gz: number;
      speed: number;
      bobOffset: number;
    }[] = [
      { id: 'ghost_white_maiden', name: '소복 처녀귀신', variant: 'white_robe', gx: 1, gz: 1, speed: 1.30, bobOffset: 0 },
      { id: 'ghost_shadow_specter', name: '저승 그림자 망령', variant: 'shadow_specter', gx: -1, gz: -1, speed: 1.15, bobOffset: 1.0 },
      { id: 'ghost_water_spirit', name: '원한 서린 물귀신', variant: 'white_robe', gx: 1, gz: -1, speed: 1.25, bobOffset: 2.1 },
      { id: 'ghost_unsealed_evil', name: '봉인 풀린 악령', variant: 'shadow_specter', gx: -1, gz: 1, speed: 1.20, bobOffset: 3.2 },
    ];

    for (const cfg of ghostConfigs) {
      const mesh = AbandonedMansionAssets.createGhostFigure(cfg.variant);
      const gxPos = cfg.gx * this.chunkSize;
      const gzPos = cfg.gz * this.chunkSize;
      mesh.position.set(gxPos, 0, gzPos);
      this.scene.add(mesh);

      const ghost: ActiveGhost = {
        id: cfg.id,
        name: cfg.name,
        variant: cfg.variant,
        mesh,
        pos: new THREE.Vector3(gxPos, 0, gzPos),
        targetPos: new THREE.Vector3(gxPos, 0, gzPos),
        state: 'wandering',
        speed: cfg.speed,
        bobTimer: cfg.bobOffset,
        wanderTimer: 2.5 + Math.random() * 2.0,
        chunkKey: `${cfg.gx}_${cfg.gz}`,
        originX: gxPos,
        originZ: gzPos,
        soundCooldown: 2.0 + Math.random() * 5.0,
        attackCooldown: 4.0 + Math.random() * 3.0,
        isDead: false,
        respawnTimer: 0,
      };
      this.dynamicGhosts.push(ghost);
    }
  }

  // Generate multi-layered horror atmospheric particles (floating glowing dust motes & ground ghost mist)
  private createDustMotes() {
    // 1. Floating dust motes and mold spores (부유하는 고택의 먼지와 곰팡이 포자)
    const dustCount = 280;
    const dustGeo = new THREE.BufferGeometry();
    this.dustPositions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount * 3; i += 3) {
      this.dustPositions[i] = (Math.random() - 0.5) * 22;
      this.dustPositions[i + 1] = 0.1 + Math.random() * 3.0;
      this.dustPositions[i + 2] = (Math.random() - 0.5) * 22;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(this.dustPositions, 3));
    const dustTex = AbandonedMansionTextures.getDustParticleTexture();
    const dustMat = new THREE.PointsMaterial({
      map: dustTex,
      size: 0.1,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.dustParticles = new THREE.Points(dustGeo, dustMat);
    this.scene.add(this.dustParticles);

    // 2. Chilling ground mist / ghost fog (복도 바닥을 기어다니는 음산한 냉기 안개 파티클)
    const mistCount = 90;
    const mistGeo = new THREE.BufferGeometry();
    this.mistPositions = new Float32Array(mistCount * 3);

    for (let i = 0; i < mistCount * 3; i += 3) {
      this.mistPositions[i] = (Math.random() - 0.5) * 24;
      this.mistPositions[i + 1] = 0.12 + Math.random() * 0.75; // Low-lying fog hugging the floor
      this.mistPositions[i + 2] = (Math.random() - 0.5) * 24;
    }

    mistGeo.setAttribute('position', new THREE.BufferAttribute(this.mistPositions, 3));
    const mistTex = AbandonedMansionTextures.getMistSmokeTexture();
    const mistMat = new THREE.PointsMaterial({
      map: mistTex,
      size: 2.8,
      color: 0x88a2a8,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });

    this.mistParticles = new THREE.Points(mistGeo, mistMat);
    this.scene.add(this.mistParticles);
  }

  // Continuous atmospheric particle simulation with subtle drift and player-following wrap
  private updateAtmosphericParticles(delta: number) {
    this.particleTime += delta;
    const t = this.particleTime;

    // 1. Update floating dust motes
    if (this.dustParticles && this.dustPositions) {
      const pos = this.dustPositions;
      const count = pos.length / 3;
      const px = this.playerPos.x;
      const pz = this.playerPos.z;
      const range = 11.0;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        pos[idx] += Math.sin(t * 0.6 + i) * 0.006;
        pos[idx + 1] += Math.cos(t * 0.8 + i * 2) * 0.005 + 0.001; // subtle upward draft
        pos[idx + 2] += Math.cos(t * 0.5 + i * 3) * 0.006;

        // Wrap around player box
        if (pos[idx] - px > range) pos[idx] -= range * 2;
        else if (pos[idx] - px < -range) pos[idx] += range * 2;

        if (pos[idx + 1] > 3.1) pos[idx + 1] = 0.1;
        else if (pos[idx + 1] < 0.1) pos[idx + 1] = 3.1;

        if (pos[idx + 2] - pz > range) pos[idx + 2] -= range * 2;
        else if (pos[idx + 2] - pz < -range) pos[idx + 2] += range * 2;
      }

      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Update chilling ground mist / spectral fog
    if (this.mistParticles && this.mistPositions) {
      const pos = this.mistPositions;
      const count = pos.length / 3;
      const px = this.playerPos.x;
      const pz = this.playerPos.z;
      const range = 13.0;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        pos[idx] += Math.cos(t * 0.25 + i) * 0.01;
        pos[idx + 1] = 0.14 + Math.sin(t * 0.5 + i * 1.3) * 0.12; // stays near floor
        pos[idx + 2] += Math.sin(t * 0.2 + i * 2) * 0.01;

        // Wrap around player box
        if (pos[idx] - px > range) pos[idx] -= range * 2;
        else if (pos[idx] - px < -range) pos[idx] += range * 2;

        if (pos[idx + 2] - pz > range) pos[idx + 2] -= range * 2;
        else if (pos[idx + 2] - pz < -range) pos[idx + 2] += range * 2;
      }

      this.mistParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  // Deterministic edge passageway checks (Guarantees 100% boundary consistency across all chunks)
  public static isHorizontalDoor(gx: number, gz: number): boolean {
    // Center spawn room (0, 0) is open on all 4 sides
    if ((gx === 0 && gz === 0) || (gx === 0 && gz === 1)) return true;
    let h = (gx * 374761393 + gz * 668265263 + 1013904223) ^ 0x5bf03635;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const val = ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    return val < 0.72; // ~72% open doorways with sliding Hanji doors, ~28% solid walls
  }

  public static isVerticalDoor(gx: number, gz: number): boolean {
    if ((gx === 0 && gz === 0) || (gx === 1 && gz === 0)) return true;
    let h = (gx * 2246822519 + gz * 3266489917 + 2654435761) ^ 0x5bf03635;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const val = ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    return val < 0.72;
  }

  // Procedural deterministic hash for room decoration & type generation
  private getChunkHash(gx: number, gz: number): number {
    let h = (gx * 374761393 + gz * 668265263) ^ 0x5bf03635;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  }

  // Generate a chunk room in the endless maze
  private createChunk(gx: number, gz: number): ChunkInfo {
    const group = new THREE.Group();
    const half = this.chunkSize / 2;
    const cx = gx * this.chunkSize;
    const cz = gz * this.chunkSize;
    group.position.set(cx, 0, cz);

    const walls: ChunkInfo['walls'] = [];
    const interactables: ChunkInfo['interactables'] = [];

    const hash = this.getChunkHash(gx, gz);

    // 1. Floor (Shared Geometry)
    const floorGeo = AbandonedMansionAssets.floorGeo || new THREE.PlaneGeometry(this.chunkSize, this.chunkSize);
    const floorMesh = new THREE.Mesh(floorGeo, AbandonedMansionAssets.floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    group.add(floorMesh);

    // 2. Ceiling with rafters (Shared Geometry)
    const ceilGeo = AbandonedMansionAssets.ceilingGeo || new THREE.PlaneGeometry(this.chunkSize, this.chunkSize);
    const ceilMesh = new THREE.Mesh(ceilGeo, AbandonedMansionAssets.ceilingMat);
    ceilMesh.rotation.x = Math.PI / 2;
    ceilMesh.position.y = 3.2;
    group.add(ceilMesh);

    // 3. Unique Top-Left Corner Pillar (prevents 4-way overlapping pillars at cell corners)
    const pillarTopLeft = AbandonedMansionAssets.createWoodPillar(3.2);
    pillarTopLeft.position.set(-half, 1.6, -half);
    group.add(pillarTopLeft);

    const wallThickness = 0.2;

    // 4. Helper to construct a single boundary wall or doorway opening
    const constructEdge = (
      edge: 'north' | 'west' | 'south' | 'east',
      hasDoor: boolean,
      edgeGx: number,
      edgeGz: number
    ) => {
      if (!hasDoor) {
        // Solid wall segment
        const wall = AbandonedMansionAssets.createWallSegment(this.chunkSize, 3.2);
        if (edge === 'north') {
          wall.position.set(0, 0, -half);
          walls.push({ minX: cx - half, maxX: cx + half, minZ: cz - half - wallThickness, maxZ: cz - half + wallThickness });
        } else if (edge === 'west') {
          wall.rotation.y = Math.PI / 2;
          wall.position.set(-half, 0, 0);
          walls.push({ minX: cx - half - wallThickness, maxX: cx - half + wallThickness, minZ: cz - half, maxZ: cz + half });
        } else if (edge === 'south') {
          wall.position.set(0, 0, half);
          walls.push({ minX: cx - half, maxX: cx + half, minZ: cz + half - wallThickness, maxZ: cz + half + wallThickness });
        } else if (edge === 'east') {
          wall.rotation.y = Math.PI / 2;
          wall.position.set(half, 0, 0);
          walls.push({ minX: cx + half - wallThickness, maxX: cx + half + wallThickness, minZ: cz - half, maxZ: cz + half });
        }
        group.add(wall);
      } else {
        // Doorway opening with left/right side walls and top lintel beam
        const sideWidth = (this.chunkSize - 2.0) / 2;
        const leftWall = AbandonedMansionAssets.createWallSegment(sideWidth, 3.2);
        const rightWall = AbandonedMansionAssets.createWallSegment(sideWidth, 3.2);
        const lintel = new THREE.Mesh(
          new THREE.BoxGeometry(2.0, 0.6, 0.2),
          AbandonedMansionAssets.woodPillarMat
        );
        lintel.position.y = 2.9;

        const doorGroup = new THREE.Group();
        leftWall.position.x = -this.chunkSize / 2 + sideWidth / 2;
        rightWall.position.x = this.chunkSize / 2 - sideWidth / 2;
        lintel.position.x = 0;

        doorGroup.add(leftWall);
        doorGroup.add(rightWall);
        doorGroup.add(lintel);

        // Ragged corridor cobwebs draped beneath doorway lintel
        const hangingWebFront = AbandonedMansionAssets.createHangingCobweb(1.95, 0.55);
        hangingWebFront.position.set(0, 2.58, 0.08);
        doorGroup.add(hangingWebFront);

        const hangingWebBack = AbandonedMansionAssets.createHangingCobweb(1.95, 0.55);
        hangingWebBack.rotation.y = Math.PI;
        hangingWebBack.position.set(0, 2.58, -0.08);
        doorGroup.add(hangingWebBack);

        // Canonical ID for this doorway based on edge coordinates
        let doorId = '';
        let doorWallBox = { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };
        if (edge === 'north') {
          doorId = `door_h_${edgeGx}_${edgeGz}`;
          doorWallBox = { minX: cx - 0.95, maxX: cx + 0.95, minZ: cz - half - wallThickness, maxZ: cz - half + wallThickness };
        } else if (edge === 'west') {
          doorId = `door_v_${edgeGx}_${edgeGz}`;
          doorWallBox = { minX: cx - half - wallThickness, maxX: cx - half + wallThickness, minZ: cz - 0.95, maxZ: cz + 0.95 };
        } else if (edge === 'south') {
          doorId = `door_h_${edgeGx}_${edgeGz}`;
          doorWallBox = { minX: cx - 0.95, maxX: cx + 0.95, minZ: cz + half - wallThickness, maxZ: cz + half + wallThickness };
        } else if (edge === 'east') {
          doorId = `door_v_${edgeGx}_${edgeGz}`;
          doorWallBox = { minX: cx + half - wallThickness, maxX: cx + half + wallThickness, minZ: cz - 0.95, maxZ: cz + 0.95 };
        }

        // Create interactive sliding Hanji door
        let activeDoor = this.activeDoors.get(doorId);
        if (!activeDoor) {
          const slidingDoor = AbandonedMansionAssets.createHanjiDoor(1.7, 2.5);
          slidingDoor.position.set(0, 0, 0);
          doorGroup.add(slidingDoor);

          const doorLeaf = (slidingDoor.getObjectByName('door_leaf') as THREE.Group) || slidingDoor;

          activeDoor = {
            id: doorId,
            group: slidingDoor,
            slidingLeaf: doorLeaf,
            isOpen: false,
            slideProgress: 0.0,
            targetSlide: 0.0,
            edge,
            chunkGx: gx,
            chunkGz: gz,
            wallBox: doorWallBox,
          };
          this.activeDoors.set(doorId, activeDoor);
          doorLeaf.position.x = 0;

          interactables.push({
            mesh: slidingDoor,
            type: 'door',
            doorId: doorId,
            name: '한지 미닫이문 (닫힘)',
            description: '[E] 미닫이문 열기 (끼이익...)',
          });
        }

        if (edge === 'north') {
          doorGroup.position.set(0, 0, -half);
          walls.push({ minX: cx - half, maxX: cx - 1.0, minZ: cz - half - wallThickness, maxZ: cz - half + wallThickness });
          walls.push({ minX: cx + 1.0, maxX: cx + half, minZ: cz - half - wallThickness, maxZ: cz - half + wallThickness });
        } else if (edge === 'west') {
          doorGroup.rotation.y = Math.PI / 2;
          doorGroup.position.set(-half, 0, 0);
          walls.push({ minX: cx - half - wallThickness, maxX: cx - half + wallThickness, minZ: cz - half, maxZ: cz - 1.0 });
          walls.push({ minX: cx - half - wallThickness, maxX: cx - half + wallThickness, minZ: cz + 1.0, maxZ: cz + half });
        } else if (edge === 'south') {
          doorGroup.position.set(0, 0, half);
          walls.push({ minX: cx - half, maxX: cx - 1.0, minZ: cz + half - wallThickness, maxZ: cz + half + wallThickness });
          walls.push({ minX: cx + 1.0, maxX: cx + half, minZ: cz + half - wallThickness, maxZ: cz + half + wallThickness });
        } else if (edge === 'east') {
          doorGroup.rotation.y = Math.PI / 2;
          doorGroup.position.set(half, 0, 0);
          walls.push({ minX: cx + half - wallThickness, maxX: cx + half + wallThickness, minZ: cz - half, maxZ: cz - 1.0 });
          walls.push({ minX: cx + half - wallThickness, maxX: cx + half + wallThickness, minZ: cz + 1.0, maxZ: cz + half });
        }
        group.add(doorGroup);
      }
    };

    // 5. Canonical Edge Generation: North (H_gx_gz) and West (V_gx_gz)
    // Every interior edge in the infinite grid is built by exactly ONE chunk with 0 overlap.
    const isNorthDoor = InfiniteMazeEngine.isHorizontalDoor(gx, gz);
    const isWestDoor = InfiniteMazeEngine.isVerticalDoor(gx, gz);
    constructEdge('north', isNorthDoor, gx, gz);
    constructEdge('west', isWestDoor, gx, gz);

    // 5. Room Specialty Decorations, Altars, Sacred Relics & Lore
    const roomDistance = Math.abs(gx) + Math.abs(gz);

    // Sacred Item Rooms (봉인부적 & 사인참사검) - 미로 곳곳에 신비롭게 분산 배치
    // 1. 사인참사검(四寅斬邪劍) 위치: 시작 방 주변을 벗어나 탐색 거리 2 이상의 특별 안치실 및 주기적 출현
    const isSacredSwordRoom = (roomDistance >= 2) && (
      (gx === 2 && gz === 1) || (gx === -2 && gz === 2) || (gx === 1 && gz === -3) || (gx === -3 && gz === -1) ||
      (gx === 4 && gz === 3) || (gx === -4 && gz === 5) || (gx === 5 && gz === -4) || (gx === -5 && gz === -3) ||
      (roomDistance >= 3 && ((Math.abs(gx * 37 + gz * 23)) % 11 === 5))
    );

    // 2. 구천응원 봉인부적(封印符籍): 사인검 방과 겹치지 않게 탐색 거리 2 이상의 제단 및 주기적 출현
    const isSacredTalismanRoom = !isSacredSwordRoom && (roomDistance >= 2) && (
      (gx === 1 && gz === 2) || (gx === -1 && gz === -2) || (gx === 3 && gz === -1) || (gx === -2 && gz === -3) ||
      (gx === 3 && gz === 4) || (gx === -5 && gz === 2) || (gx === 4 && gz === -5) || (gx === -4 && gz === -4) ||
      (roomDistance >= 3 && ((Math.abs(gx * 31 + gz * 17)) % 11 === 4))
    );

    const isStartRoom = (gx === 0 && gz === 0);
    // Guaranteed Sanity Altar every 3 rooms distance (Never in the starting room!)
    const isAltarRoom = !isStartRoom && !isSacredTalismanRoom && !isSacredSwordRoom && (roomDistance > 0 && roomDistance % 3 === 0);

    if (isStartRoom) {
      // 0. Starting Entrance Foyer (시작 대청마루 현관) - 탁 트인 시야 확보
      // 벽면에 붙은 고가구 (중앙 시야 및 통로 완전 개방)
      const sideWardrobe = AbandonedMansionAssets.createWardrobe();
      sideWardrobe.position.set(-2.2, 0, 0);
      sideWardrobe.rotation.y = Math.PI / 2;
      group.add(sideWardrobe);
      walls.push({ minX: cx - 2.6, maxX: cx - 1.8, minZ: cz - 0.8, maxZ: cz + 0.8 });
    } else if (isSacredTalismanRoom) {
      // Sacred Sealing Talisman Altar Room (구천응원 봉인부적 안치실)
      const talPedestal = AbandonedMansionAssets.createSacredTalismanPedestal();
      talPedestal.position.set(0, 0, -1.8);
      group.add(talPedestal);
      walls.push({ minX: cx - 1.2, maxX: cx + 1.2, minZ: cz - 2.6, maxZ: cz - 1.0 });

      interactables.push({
        mesh: talPedestal,
        type: 'talisman_sacred',
        name: '[신물] 구천응원 봉인부적 제단',
        description: '[E] 신비롭게 떠오르는 황금빛 봉인부적을 획득합니다. (원혼 봉인 퇴마)',
      });
    } else if (isSacredSwordRoom) {
      // Sacred Exorcism Sword Shrine (사인참사검 보검 안치실)
      const swordPedestal = AbandonedMansionAssets.createSacredSwordPedestal();
      swordPedestal.position.set(0, 0, -1.8);
      group.add(swordPedestal);
      walls.push({ minX: cx - 1.4, maxX: cx + 1.4, minZ: cz - 2.6, maxZ: cz - 1.0 });

      interactables.push({
        mesh: swordPedestal,
        type: 'sword_sacred',
        name: '[신물] 사인참사검(四寅斬邪劍) 보검대',
        description: '[E] 푸른 성광을 내뿜는 사인참사검을 뽑아듭니다. (원혼 즉각 퇴마)',
      });
    } else if (isAltarRoom) {
      // Shaman Shrine with Folding Screen & Sanity Altar (8폭 병풍과 사당 제사상)
      const shrineAltar = AbandonedMansionAssets.createFoldingScreenAltar();
      shrineAltar.position.set(0, 0, -2.0);
      group.add(shrineAltar);
      walls.push({ minX: cx - 1.6, maxX: cx + 1.6, minZ: cz - 2.8, maxZ: cz - 1.2 });

      const relicId = `relic_altar_${gx}_${gz}`;
      const relicItem: RelicItem = {
        id: relicId,
        name: '안식의 경면주사 부적 (정신력 회복)',
        category: 'talisman',
        description: '타오르는 백색 촛불과 은은한 향내 속에 놓인 영험한 부적. 원혼의 저주를 씻어낸다.',
        lore: '사당에 모셔진 위패와 촛불의 온기가 공포에 떨리는 정신을 온전히 진정시켜 준다.',
        iconName: 'Sparkles',
        collectedAtDepth: Math.round(Math.hypot(cx, cz)),
      };

      interactables.push({
        mesh: shrineAltar,
        relic: relicItem,
        type: 'altar',
        name: '사당 제사상 (정신력 100% 회복)',
        description: '[E] 촛불에 손을 모아 기도하고 정신력을 100% 완전 회복합니다.',
      });
    } else {
      // 12 Unique Specialized Korean Mansion Rooms
      const specificType = hash % 12;

      if (specificType === 0) {
        // 1. Master Bedroom with Wardrobe & Cursed Mask (안방 및 자개장)
        const wardrobe = AbandonedMansionAssets.createWardrobe();
        wardrobe.position.set(-2.2, 0, 0);
        wardrobe.rotation.y = Math.PI / 2;
        group.add(wardrobe);
        walls.push({ minX: cx - 2.6, maxX: cx - 1.8, minZ: cz - 0.8, maxZ: cz + 0.8 });

        const mask = AbandonedMansionAssets.createMask(0.65);
        mask.position.set(2.2, 1.8, 0);
        mask.rotation.y = -Math.PI / 2;
        group.add(mask);

        const relicItem: RelicItem = {
          id: `mask_${gx}_${gz}`,
          name: '눈동자가 떨리는 목각 하회탈',
          category: 'curio',
          description: '눈구멍에서 검붉은 피가 흘러내리는 낡은 목각탈. 가까이 가면 사각거리는 소리가 들린다.',
          lore: '원혼이 깃들어 사람이 지나갈 때마다 시선을 쫓는다는 저주받은 방상시 가면.',
          iconName: 'Ghost',
          collectedAtDepth: Math.round(Math.hypot(cx, cz)),
        };

        interactables.push({
          mesh: mask,
          relic: relicItem,
          type: 'mask',
          name: '벽에 걸린 흉측한 목각탈',
          description: '[E] 기괴한 목각탈을 조사합니다.',
        });
      } else if (specificType === 1) {
        // 2. Flooded Storeroom with Clay Jars (침수된 옹기 헛간)
        const puddle = AbandonedMansionAssets.createPuddle(1.8);
        group.add(puddle);

        const jar1 = AbandonedMansionAssets.createClayJar(1.2);
        jar1.position.set(1.8, 0, 1.8);
        group.add(jar1);

        const jar2 = AbandonedMansionAssets.createClayJar(0.9);
        jar2.position.set(2.1, 0, 0.9);
        group.add(jar2);
        walls.push({ minX: cx + 1.5, maxX: cx + 2.5, minZ: cz + 0.6, maxZ: cz + 2.4 });

        const relicItem: RelicItem = {
          id: `diary_${gx}_${gz}`,
          name: '찢겨진 1978년 일기장 조각',
          category: 'document',
          description: '물에 젖어 잉크가 번진 종이 조각. "더 이상 나갈 수 없다... 벽이 밤마다 움직인다"라고 적혀 있다.',
          lore: '폐가에 들어왔다가 길을 잃고 영원히 헤매던 이전 조난자의 마지막 기록.',
          iconName: 'BookOpen',
          collectedAtDepth: Math.round(Math.hypot(cx, cz)),
        };

        interactables.push({
          mesh: jar1,
          relic: relicItem,
          type: 'relic',
          name: '깨진 옹기 항아리 틈새',
          description: '[E] 항아리 속 젖은 일기장을 줍습니다.',
        });
      } else if (specificType === 2) {
        // 3. Forbidden Library Chamber (금서고 및 고서화 서재)
        const library = AbandonedMansionAssets.createBookshelfChamber();
        group.add(library);
        walls.push({ minX: cx - 1.4, maxX: cx + 1.4, minZ: cz - 2.2, maxZ: cz - 1.4 });

        const relicItem: RelicItem = {
          id: `scroll_${gx}_${gz}`,
          name: '봉인된 묵필 주술서 두루마리',
          category: 'document',
          description: '검은 먹과 붉은 인주로 기이한 귀신 퇴치 진언이 빽빽하게 기록된 두루마리.',
          lore: '조선 후기 퇴마 의식에 사용되던 고문서로, 미로의 비밀이 기록되어 있다.',
          iconName: 'BookOpen',
          collectedAtDepth: Math.round(Math.hypot(cx, cz)),
        };

        interactables.push({
          mesh: library,
          relic: relicItem,
          type: 'relic',
          name: '서탁 위의 봉인된 주술서',
          description: '[E] 주술서 두루마리를 수습합니다.',
        });
      } else if (specificType === 3) {
        // 4. Traditional Kitchen with Iron Cauldron (전통 부뚜막과 가마솥)
        const kitchen = AbandonedMansionAssets.createTraditionalKitchen();
        group.add(kitchen);
        walls.push({ minX: cx - 1.4, maxX: cx + 1.4, minZ: cz - 2.2, maxZ: cz - 0.8 });

        const relicItem: RelicItem = {
          id: `pot_${gx}_${gz}`,
          name: '그을음 묻은 놋쇠 제기 그릇',
          category: 'curio',
          description: '부뚜막 재 속에 묻혀 있던 오래된 놋그릇. 뒤편에 가문의 문양이 음각되어 있다.',
          lore: '오랜 세월 동안 화마와 원혼의 저주를 견뎌낸 가보.',
          iconName: 'Sparkles',
          collectedAtDepth: Math.round(Math.hypot(cx, cz)),
        };

        interactables.push({
          mesh: kitchen,
          relic: relicItem,
          type: 'relic',
          name: '부뚜막 가마솥 주변',
          description: '[E] 재 속에 묻힌 놋그릇 유물을 줍습니다.',
        });
      } else if (specificType === 4) {
        // 5. Herbalist Medicine Apothecary (약초방과 한약 서랍장)
        const herbal = AbandonedMansionAssets.createMedicineCabinet();
        group.add(herbal);
        walls.push({ minX: cx - 1.5, maxX: cx + 1.5, minZ: cz - 2.2, maxZ: cz - 1.4 });

        const relicItem: RelicItem = {
          id: `herb_${gx}_${gz}`,
          name: '말린 천년 백단향 약재 주머니',
          category: 'curio',
          description: '은은한 향을 내뿜는 비단 주머니. 귀신이 싫어하는 향을 머금고 있다.',
          lore: '원혼의 접근을 늦추고 공포심을 진정시키는 약방의 비전 향낭.',
          iconName: 'Sparkles',
          collectedAtDepth: Math.round(Math.hypot(cx, cz)),
        };

        interactables.push({
          mesh: herbal,
          relic: relicItem,
          type: 'relic',
          name: '약초 서랍장 틈새',
          description: '[E] 비단 향낭을 챙깁니다.',
        });
      } else if (specificType === 5) {
        // 6. Inner Courtyard with Stone Pagoda (중정 석등과 고목)
        const courtyard = AbandonedMansionAssets.createStonePagodaCourtyard();
        group.add(courtyard);
        walls.push({ minX: cx - 0.5, maxX: cx + 0.5, minZ: cz - 0.5, maxZ: cz + 0.5 });

        const relicItem: RelicItem = {
          id: `pagoda_${gx}_${gz}`,
          name: '이끼 낀 석등의 사리석 조각',
          category: 'curio',
          description: '석등 내부에서 은은하게 빛나던 신비로운 푸른빛 돌조각.',
          lore: '망자의 넋을 인도하던 정원의 등불 속에 감춰져 있던 수호석.',
          iconName: 'Sparkles',
          collectedAtDepth: Math.round(Math.hypot(cx, cz)),
        };

        interactables.push({
          mesh: courtyard,
          relic: relicItem,
          type: 'relic',
          name: '중정의 타오르는 석등',
          description: '[E] 석등 속 사리석 조각을 수습합니다.',
        });
      } else if (specificType === 6) {
        // 7. Cellar Iron Dungeon Cage (지하실 쇠창살 감옥)
        const dungeon = AbandonedMansionAssets.createIronCageDungeon();
        group.add(dungeon);
        walls.push({ minX: cx - 1.4, maxX: cx + 1.4, minZ: cz - 1.8, maxZ: cz - 1.4 });

        const relicItem: RelicItem = {
          id: `key_${gx}_${gz}`,
          name: '피 묻은 녹슨 감옥 열쇠 다발',
          category: 'key',
          description: '묵직한 쇠로 만들어진 낡은 열쇠 꾸러미. 오래된 혈흔이 말라붙어 있다.',
          lore: '폐가 지하 밀실에 갇혔던 사람들이 탈출하기 위해 필사적으로 쥐고 있던 열쇠.',
          iconName: 'Key',
          collectedAtDepth: Math.round(Math.hypot(cx, cz)),
        };

        interactables.push({
          mesh: dungeon,
          relic: relicItem,
          type: 'relic',
          name: '녹슨 쇠창살 감옥',
          description: '[E] 쇠사슬에 걸린 옥 열쇠를 줍습니다.',
        });
      } else if (specificType === 7) {
        // 8. Embroidery & Sewing Chamber (규수방 자수틀과 목각 경대)
        const embroidery = AbandonedMansionAssets.createEmbroideryChamber();
        group.add(embroidery);
        walls.push({ minX: cx - 2.0, maxX: cx - 1.0, minZ: cz - 1.8, maxZ: cz - 1.0 });

        const relicItem: RelicItem = {
          id: `silk_${gx}_${gz}`,
          name: '피로 수놓은 규수의 비단 자수보',
          category: 'curio',
          description: '붉은 실과 흑실로 정교하게 연꽃 문양이 수놓아진 비단 천. 슬픈 한이 서려 있다.',
          lore: '억울하게 규수방에 갇혀 한 평생을 마감한 아가씨의 유품.',
          iconName: 'Sparkles',
          collectedAtDepth: Math.round(Math.hypot(cx, cz)),
        };

        interactables.push({
          mesh: embroidery,
          relic: relicItem,
          type: 'relic',
          name: '규수방 목각 경대와 자수틀',
          description: '[E] 거울 앞 비단 자수보를 수습합니다.',
        });
      } else if (specificType === 8) {
        // 9. Shaman Ritual Instruments Hall (제례 악기실과 대북 & 징)
        const instruments = AbandonedMansionAssets.createRitualInstrumentsHall();
        group.add(instruments);
        walls.push({ minX: cx - 0.5, maxX: cx + 0.5, minZ: cz - 2.0, maxZ: cz - 1.2 });

        const relicItem: RelicItem = {
          id: `gong_mallet_${gx}_${gz}`,
          name: '귀신을 쫓는 흑단목 제례 북채',
          category: 'ritual',
          description: '신성한 흑단나무를 깎아 옻칠을 입힌 북채. 휘두르면 묵직한 공명음이 난다.',
          lore: '원혼의 기운을 흩뜨리는 퇴마 타악 의식의 핵심 도구.',
          iconName: 'Bell',
          collectedAtDepth: Math.round(Math.hypot(cx, cz)),
        };

        interactables.push({
          mesh: instruments,
          relic: relicItem,
          type: 'relic',
          name: '제례 대북과 징 거치대',
          description: '[E] 대북 거치대 위의 흑단목 북채를 줍습니다.',
        });
      } else if (specificType === 9) {
        // 10. Cursed Stone Well with Bamboo (저주받은 돌우물과 대나무)
        const well = AbandonedMansionAssets.createCursedWellCourtyard();
        group.add(well);
        walls.push({ minX: cx - 1.0, maxX: cx + 1.0, minZ: cz - 1.0, maxZ: cz + 1.0 });

        const relicItem: RelicItem = {
          id: `bucket_talisman_${gx}_${gz}`,
          name: '우물 속에서 건져 올린 백옥 비녀',
          category: 'curio',
          description: '차디찬 우물물 속에서 발견된 은은한 광택의 백옥 비녀.',
          lore: '우물에 빠져 목숨을 잃은 여인이 남긴 유일한 신표.',
          iconName: 'Sparkles',
          collectedAtDepth: Math.round(Math.hypot(cx, cz)),
        };

        interactables.push({
          mesh: well,
          relic: relicItem,
          type: 'relic',
          name: '저주받은 깊은 돌우물',
          description: '[E] 두레박 속 백옥 비녀를 건집니다.',
        });
      } else if (specificType === 10) {
        // 11. Silk Drapery & Tea Incense Chamber (비단 휘장과 차실)
        const teaChamber = AbandonedMansionAssets.createSilkIncenseChamber();
        group.add(teaChamber);
        walls.push({ minX: cx - 0.8, maxX: cx + 0.8, minZ: cz - 1.8, maxZ: cz - 1.0 });

        const relicItem: RelicItem = {
          id: `incense_censer_${gx}_${gz}`,
          name: '용 문양이 새겨진 백동 향로',
          category: 'curio',
          description: '찻상 위에 놓여 있던 고풍스러운 백동 향로. 내부에 마르지 않은 향가루가 남아 있다.',
          lore: '폐가의 안온한 차실에서 불을 밝히던 귀한 백동 공예품.',
          iconName: 'Sparkles',
          collectedAtDepth: Math.round(Math.hypot(cx, cz)),
        };

        interactables.push({
          mesh: teaChamber,
          relic: relicItem,
          type: 'relic',
          name: '비단 휘장 속 찻상과 향로',
          description: '[E] 찻상 위의 백동 향로를 챙깁니다.',
        });
      } else {
        // 12. Talisman Sealed Chamber (부적으로 봉인된 결계방)
        for (let t = -1; t <= 1; t++) {
          const tal = AbandonedMansionAssets.createTalisman(0.35, 0.65);
          tal.position.set(t * 1.4, 1.8, -half + 0.1);
          group.add(tal);
        }

        const relicItem: RelicItem = {
          id: `bell_${gx}_${gz}`,
          name: '무당의 녹슨 칠성방울',
          category: 'ritual',
          description: '흔들면 맑고도 서늘한 쇳소리가 울려 퍼지는 놋쇠 방울 다발.',
          lore: '귀신을 부르거나 쫓아낼 때 쓰이던 주술 도구로, 폐가 속 원혼의 기척을 감지해낸다.',
          iconName: 'Bell',
          collectedAtDepth: Math.round(Math.hypot(cx, cz)),
        };

        interactables.push({
          mesh: group,
          relic: relicItem,
          type: 'talisman',
          name: '부적으로 봉인된 결계 벽면',
          description: '[E] 칠성방울 유물을 수습합니다.',
        });
      }
    }

    this.scene.add(group);

    return {
      gx,
      gz,
      group,
      walls,
      interactables,
    };
  }

  // Zero-Stutter Chunk Disposal (Preserves shared static geometry pools and keeps objects cached)
  private disposeChunk(chunk: ChunkInfo) {
    this.scene.remove(chunk.group);
  }

  // Update active chunks around player with high-performance memory pooling
  public updateChunks() {
    const currentGx = Math.round(this.playerPos.x / this.chunkSize);
    const currentGz = Math.round(this.playerPos.z / this.chunkSize);

    if (currentGx === this.lastChunkX && currentGz === this.lastChunkZ) return;

    this.lastChunkX = currentGx;
    this.lastChunkZ = currentGz;

    const neededKeys = new Set<string>();

    for (let dx = -this.chunkRadius; dx <= this.chunkRadius; dx++) {
      for (let dz = -this.chunkRadius; dz <= this.chunkRadius; dz++) {
        const gx = currentGx + dx;
        const gz = currentGz + dz;
        const key = `${gx}_${gz}`;
        neededKeys.add(key);

        if (!this.activeChunks.has(key)) {
          let chunk = this.chunkCache.get(key);
          if (chunk) {
            this.scene.add(chunk.group);
          } else {
            chunk = this.createChunk(gx, gz);
            this.chunkCache.set(key, chunk);
          }
          this.activeChunks.set(key, chunk);
        }
      }
    }

    // Remove distant chunks from the scene
    this.activeChunks.forEach((chunk, key) => {
      if (!neededKeys.has(key)) {
        this.disposeChunk(chunk);
        this.activeChunks.delete(key);
      }
    });

    // High-performance chunk caching: Retain up to 128 explored rooms in memory for instant 0ms retrieval
    if (this.chunkCache.size > 128) {
      for (const [key] of this.chunkCache) {
        if (!this.activeChunks.has(key)) {
          this.chunkCache.delete(key);
          if (this.chunkCache.size <= 100) break;
        }
      }
    }

    // Record explored room
    const currentRoomKey = `${currentGx},${currentGz}`;
    if (!this.roomsExplored.has(currentRoomKey)) {
      this.roomsExplored.add(currentRoomKey);
      if (this.onStatsUpdate) this.onStatsUpdate();
    }
  }

  // Handle player input and smooth collision
  private updatePlayerMovement(delta: number) {
    // 보스전 중에는 자동 무한 달리기 (Shift 키를 누르지 않아도 자동으로 전력 질주 속도 유지 & 스태미나 무한)
    const isSprint = this.isBossFightActive || this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.isSprinting;
    const speed = this.isBossFightActive ? 4.2 : (isSprint && this.stamina > 10 ? 3.8 : 2.2);

    const keyW = this.keys['KeyW'] || this.keys['ArrowUp'];
    const keyS = this.keys['KeyS'] || this.keys['ArrowDown'];
    const keyA = this.keys['KeyA'];
    const keyD = this.keys['KeyD'];

    if (this.isBossFightActive) {
      // 보스전 중 무한 스태미나
      this.stamina = 100;
    } else if (isSprint && (keyW || keyS || keyA || keyD || this.virtualMoveVector.y !== 0)) {
      this.stamina = Math.max(0, this.stamina - delta * 22);
    } else {
      this.stamina = Math.min(100, this.stamina + delta * 15);
    }

    // Direction vector from keyboard + virtual joystick
    const moveX = (keyD ? 1 : 0) - (keyA ? 1 : 0) + this.virtualMoveVector.x;
    const moveZ = (keyS ? 1 : 0) - (keyW ? 1 : 0) + this.virtualMoveVector.y;

    const inputLen = Math.hypot(moveX, moveZ);
    let targetVelX = 0;
    let targetVelZ = 0;

    if (inputLen > 0.01) {
      const normX = moveX / Math.max(1, inputLen);
      const normZ = moveZ / Math.max(1, inputLen);

      // Forward and right vectors based on yaw
      const forwardX = -Math.sin(this.playerYaw);
      const forwardZ = -Math.cos(this.playerYaw);
      const rightX = Math.cos(this.playerYaw);
      const rightZ = -Math.sin(this.playerYaw);

      targetVelX = (forwardX * -normZ + rightX * normX) * speed;
      targetVelZ = (forwardZ * -normZ + rightZ * normX) * speed;
    }

    // Smooth inertia acceleration
    this.playerVelocity.x += (targetVelX - this.playerVelocity.x) * 14 * delta;
    this.playerVelocity.z += (targetVelZ - this.playerVelocity.z) * 14 * delta;

    // Smooth collision with sliding against walls (Optimized spatial chunk lookup)
    const playerRadius = 0.26;
    const padding = 0.04;
    let nextX = this.playerPos.x + this.playerVelocity.x * delta;
    let nextZ = this.playerPos.z + this.playerVelocity.z * delta;

    const currentGx = Math.round(this.playerPos.x / this.chunkSize);
    const currentGz = Math.round(this.playerPos.z / this.chunkSize);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const chunk = this.activeChunks.get(`${currentGx + dx}_${currentGz + dz}`);
        if (!chunk) continue;

        for (const w of chunk.walls) {
          // Check X axis movement collision
          const inZBand =
            this.playerPos.z + playerRadius > w.minZ + padding &&
            this.playerPos.z - playerRadius < w.maxZ - padding;

          if (inZBand) {
            if (nextX + playerRadius > w.minX && nextX - playerRadius < w.maxX) {
              nextX = this.playerPos.x;
              this.playerVelocity.x = 0;
            }
          }

          // Check Z axis movement collision
          const inXBand =
            this.playerPos.x + playerRadius > w.minX + padding &&
            this.playerPos.x - playerRadius < w.maxX - padding;

          if (inXBand) {
            if (nextZ + playerRadius > w.minZ && nextZ - playerRadius < w.maxZ) {
              nextZ = this.playerPos.z;
              this.playerVelocity.z = 0;
            }
          }
        }
      }
    }

    // Closed doors collision check (blocks passage when door is closed, optimized for local 3x3 doors)
    for (const [, door] of this.activeDoors) {
      if (Math.abs(door.chunkGx - currentGx) > 1 || Math.abs(door.chunkGz - currentGz) > 1) continue;
      if (door.slideProgress < 0.65) {
        const w = door.wallBox;
        // Check X axis movement collision
        const inZBand =
          this.playerPos.z + playerRadius > w.minZ + padding &&
          this.playerPos.z - playerRadius < w.maxZ - padding;

        if (inZBand) {
          if (nextX + playerRadius > w.minX && nextX - playerRadius < w.maxX) {
            nextX = this.playerPos.x;
            this.playerVelocity.x = 0;
          }
        }

        // Check Z axis movement collision
        const inXBand =
          this.playerPos.x + playerRadius > w.minX + padding &&
          this.playerPos.x - playerRadius < w.maxX - padding;

        if (inXBand) {
          if (nextZ + playerRadius > w.minZ && nextZ - playerRadius < w.maxZ) {
            nextZ = this.playerPos.z;
            this.playerVelocity.z = 0;
          }
        }
      }
    }

    this.playerPos.x = nextX;
    this.playerPos.z = nextZ;

    // Boss Arena Boundary Clamping (Keep player within the 12.8m ritual arena)
    if (this.isBossFightActive) {
      const pDist = Math.hypot(this.playerPos.x, this.playerPos.z);
      if (pDist > 12.8) {
        const pAngle = Math.atan2(this.playerPos.z, this.playerPos.x);
        this.playerPos.x = Math.cos(pAngle) * 12.8;
        this.playerPos.z = Math.sin(pAngle) * 12.8;
      }
    }

    // Update Depth from origin
    this.depthMeters = Math.round(Math.hypot(this.playerPos.x, this.playerPos.z));

    // Footstep audio and headbob
    const currentSpeed = Math.hypot(this.playerVelocity.x, this.playerVelocity.z);
    if (currentSpeed > 0.4) {
      this.footstepTimer += delta * (currentSpeed * 1.7);
      this.headBobTimer += delta * (currentSpeed * 2.8);

      if (this.footstepTimer > 1.0) {
        this.footstepTimer = 0;
        mazeAudio.playFootstep(isSprint);
      }

      this.playerPos.y = 1.5 + Math.sin(this.headBobTimer) * 0.04;
    } else {
      this.playerPos.y = 1.5;
    }

    // Update Camera
    this.camera.position.copy(this.playerPos);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.playerYaw;
    this.camera.rotation.x = this.playerPitch;

    // Apply violent trauma camera shake on jumpscare/hit
    if (this.cameraShakeIntensity > 0.001) {
      const shakeX = (Math.random() - 0.5) * 0.22 * this.cameraShakeIntensity;
      const shakeY = (Math.random() - 0.5) * 0.22 * this.cameraShakeIntensity;
      const shakeZ = (Math.random() - 0.5) * 0.22 * this.cameraShakeIntensity;
      this.camera.position.add(new THREE.Vector3(shakeX, shakeY, shakeZ));

      const shakePitch = (Math.random() - 0.5) * 0.14 * this.cameraShakeIntensity;
      const shakeYaw = (Math.random() - 0.5) * 0.14 * this.cameraShakeIntensity;
      const shakeRoll = (Math.random() - 0.5) * 0.18 * this.cameraShakeIntensity;
      this.camera.rotation.x += shakePitch;
      this.camera.rotation.y += shakeYaw;
      this.camera.rotation.z += shakeRoll;

      this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - delta * 2.8);
    }

    // Update Flashlight & Lantern positions
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);

    this.flashlight.position.copy(this.playerPos).add(new THREE.Vector3(0, -0.15, 0));
    this.flashlightTarget.position.copy(this.playerPos).add(dir.clone().multiplyScalar(5));

    this.lanternLight.position.copy(this.playerPos).add(new THREE.Vector3(0, -0.2, 0));

    // Continuously simulate atmospheric dust and cold ground mist particles
    this.updateAtmosphericParticles(delta);
  }

  // Trigger violent ghost jumpscare event with audio screech, camera shake & strobe blackout
  public triggerJumpscare(variant: 'white_maiden' | 'shadow_specter' | 'boss_demon', ghostName: string, damage: number = 20) {
    this.cameraShakeIntensity = 1.45;

    // Flashlight momentary blackout / violent flicker
    if (this.flashlight && this.lightMode === 'flashlight') {
      this.flashlight.intensity = 0.2;
      setTimeout(() => {
        if (this.flashlight && this.lightMode === 'flashlight') {
          const batRatio = Math.max(0.2, this.battery / 100);
          this.flashlight.intensity = 8.5 * this.brightnessMultiplier * batRatio;
        }
      }, 420);
    }

    // Audio jumpscare shriek & impact boom
    mazeAudio.playGhostJumpscareScream(variant);

    // Trigger HUD Jumpscare Overlay
    if (this.onJumpscare) {
      this.onJumpscare({
        id: `jumpscare_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        variant,
        ghostName,
        timestamp: Date.now(),
        damage,
      });
    }
  }

  // Raycast interaction prompt (Strictly precise crosshair raycast, no false proximity triggers)
  private updateRaycast() {
    this.raycaster.setFromCamera(this.centerScreen, this.camera);

    let closestDist = 2.6; // Max 2.6m reach distance (prevents picking items from too far away)
    let targetInteractable: ChunkInfo['interactables'][0] | null = null;

    const currentGx = Math.round(this.playerPos.x / this.chunkSize);
    const currentGz = Math.round(this.playerPos.z / this.chunkSize);

    // Only test interactables in current and immediate 8 neighboring chunks
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const chunk = this.activeChunks.get(`${currentGx + dx}_${currentGz + dz}`);
        if (!chunk) continue;

        for (const item of chunk.interactables) {
          const intersects = this.raycaster.intersectObject(item.mesh, true);
          if (intersects.length > 0 && intersects[0].distance < closestDist) {
            closestDist = intersects[0].distance;
            targetInteractable = item;
          }
        }
      }
    }

    this.currentRaycastTarget = targetInteractable;

    if (targetInteractable) {
      const it = targetInteractable as ChunkInfo['interactables'][0];
      let displayName = it.name;
      let displayDesc = it.description;

      if (it.type === 'door' && it.doorId) {
        const door = this.activeDoors.get(it.doorId);
        if (door) {
          displayName = door.isOpen ? '한지 미닫이문 (열림)' : '한지 미닫이문 (닫힘)';
          displayDesc = door.isOpen ? '[E] 키로 미닫이문 닫기' : '[E] 키로 미닫이문 열기 (끼이익...)';
        }
      }

      this.hoveredInteractable = {
        name: displayName,
        description: displayDesc,
        distance: Math.round(closestDist * 10) / 10,
      };
    } else {
      this.hoveredInteractable = null;
    }
  }

  // Player inspect / interact action on current target
  // Doors are strictly restricted to keyboard 'E' key only!
  public inspectTarget(source: 'keyboard_e' | 'click' = 'keyboard_e') {
    const item = this.currentRaycastTarget;

    // 1. Door interaction: ONLY permitted when pressing 'E' key
    if (item && item.type === 'door') {
      if (source !== 'keyboard_e') {
        // Clicks are ignored for doors
        return;
      }

      let door: ActiveDoor | undefined;
      if (item.doorId) {
        door = this.activeDoors.get(item.doorId);
      }
      if (!door) {
        let minD = 999;
        for (const [, d] of this.activeDoors) {
          const wp = new THREE.Vector3();
          d.group.getWorldPosition(wp);
          const dist = wp.distanceTo(this.playerPos);
          if (dist < minD) {
            minD = dist;
            door = d;
          }
        }
      }

      if (door) {
        door.isOpen = !door.isOpen;
        door.targetSlide = door.isOpen ? 1.0 : 0.0;
        mazeAudio.playDoorCreak(door.isOpen);

        item.name = door.isOpen ? '한지 미닫이문 (열림)' : '한지 미닫이문 (닫힘)';
        item.description = door.isOpen ? '[E] 키로 미닫이문 닫기' : '[E] 키로 미닫이문 열기 (끼이익...)';

        if (this.hoveredInteractable) {
          this.hoveredInteractable.name = item.name;
          this.hoveredInteractable.description = item.description;
        }

        if (this.onStatsUpdate) this.onStatsUpdate();
      }
      return;
    }

    // Fallback: If no raycast item hovered, check if standing directly facing a door within 2.4m on 'E' key
    if (!item) {
      if (source !== 'keyboard_e') return;

      let closestDoor: ActiveDoor | null = null;
      let minD = 2.4;
      for (const [, d] of this.activeDoors) {
        const wp = new THREE.Vector3();
        d.group.getWorldPosition(wp);
        const dist = wp.distanceTo(this.playerPos);
        if (dist < minD) {
          minD = dist;
          closestDoor = d;
        }
      }
      if (closestDoor) {
        closestDoor.isOpen = !closestDoor.isOpen;
        closestDoor.targetSlide = closestDoor.isOpen ? 1.0 : 0.0;
        mazeAudio.playDoorCreak(closestDoor.isOpen);

        if (this.onStatsUpdate) this.onStatsUpdate();
      }
      return;
    }

    // 2. Non-door items (Altar, Relics, Curios, Sacred Items)
    if (item.type === 'talisman_sacred') {
      if (!this.inventory[1].unlocked) {
        this.inventory[1].unlocked = true;
        this.hasTalisman = true;
        this.setActiveSlot(1);
        mazeAudio.playItemAcquire();
        mazeAudio.playTalismanExorcism();
        this.sanity = Math.min(this.maxSanity, this.sanity + 40);

        if (this.onHauntedEvent) {
          this.onHauntedEvent({
            id: `talisman_acquire_${Date.now()}`,
            type: 'item_acquired',
            message: `[신물 획득] '구천응원 봉인부적'을 손에 넣었습니다! [방향키/숫자키]로 교체하고 클릭/F로 원혼을 봉인할 수 있습니다.`,
            sanityDrain: 0,
          });
        }
        if (this.onInspectCallback) {
          this.onInspectCallback(
            null,
            '구천응원 봉인부적 획득',
            '태상노군의 진언이 깃든 영험한 주사 부적이 인벤토리에 추가되었습니다. 원혼을 향해 내지르면 신성한 결계 화염으로 악귀를 봉인 퇴마합니다.'
          );
        }
        item.description = '(이미 제단에서 신물을 회수했습니다)';
        this.checkEscapeVictory();
      }
      if (this.onStatsUpdate) this.onStatsUpdate();
      return;
    } else if (item.type === 'sword_sacred') {
      this.inventory[2].unlocked = true;
      this.hasSword = true;
      this.setActiveSlot(2);
      mazeAudio.playItemAcquire();
      mazeAudio.playSwordSlash();
      this.sanity = this.maxSanity; // 정신력 완전 회복!

      if (this.vmSwordLight) {
        this.vmSwordLight.intensity = 5.0; // 성광 폭발
        setTimeout(() => {
          if (this.vmSwordLight) this.vmSwordLight.intensity = 2.6;
        }, 1200);
      }

      if (this.onHauntedEvent) {
        this.onHauntedEvent({
          id: `sword_acquire_${Date.now()}`,
          type: 'item_acquired',
          message: `[사인참사검 성광 각성] 보검의 28수 성좌가 번쩍이며 진기가 완벽히 충전되었습니다! [좌클릭 / F]로 원혼을 즉시 베어 퇴마하세요.`,
          sanityDrain: 0,
        });
      }
      if (this.onInspectCallback) {
        this.onInspectCallback(
          null,
          '사인참사검(四寅斬邪劍) 성광 각성',
          '인년, 인월, 인일, 인시에 벼려진 신성한 보검에 깃든 영기가 깨어났습니다. 푸른 성광이 사방을 비추며 원혼을 일격에 소멸시킵니다.'
        );
      }
      item.description = '(보검대의 신성한 진기와 공명 완료)';
      this.checkEscapeVictory();
      if (this.onStatsUpdate) this.onStatsUpdate();
      return;
    } else if (item.type === 'altar') {
      mazeAudio.playInspectSound();
      // Restore Sanity to max & Battery +50%
      this.sanity = this.maxSanity;
      this.battery = Math.min(100, this.battery + 50);
      mazeAudio.playShamanBell();
      if (this.onInspectCallback) {
        this.onInspectCallback(
          item.relic || null,
          '사당 제사상 앞의 기도',
          `타오르는 백색 촛불과 은은한 향내 속에서 정신력(SAN ${this.maxSanity})을 완전히 회복하고 회중전등 배터리(+50%)를 충전합니다.`
        );
      }
    } else if (item.relic) {
      mazeAudio.playInspectSound();
      // Collect relic & boost
      const relic = item.relic;
      this.sanity = Math.min(this.maxSanity, this.sanity + 20);
      this.battery = Math.min(100, this.battery + 25);

      if (!this.collectedRelics.some((r) => r.id === relic.id)) {
        this.collectedRelics.push(relic);
        mazeAudio.playShamanBell();

        const currentRelics = this.collectedRelics.length;
        if (this.onHauntedEvent) {
          this.onHauntedEvent({
            id: `relic_anger_${Date.now()}`,
            type: 'ghost_whisper',
            message: `[원혼의 격노] 유물 [${relic.name}] 수습! 귀신의 이동 속도(+${currentRelics * 10}%)와 감지 범위(+${(currentRelics * 0.9).toFixed(1)}m)가 상승했습니다!`,
            sanityDrain: 0,
          });
        }

        // Check 20 relics collection -> Trigger Eoduksini Boss Battle!
        if (this.collectedRelics.length >= 20 && !this.isBossFightActive && !this.isEscaped) {
          if (this.onStatsUpdate) this.onStatsUpdate();
          this.transitionToBossFight();
          return;
        }
      }
      if (this.onInspectCallback) {
        this.onInspectCallback(relic, relic.name, relic.description);
      }
    } else {
      mazeAudio.playInspectSound();
      if (this.onInspectCallback) {
        this.onInspectCallback(null, item.name, item.description);
      }
    }

    if (this.onStatsUpdate) this.onStatsUpdate();
  }

  // Transition into the Boss Arena Realm upon gathering 20 relics
  public transitionToBossFight() {
    if (this.isBossFightActive || this.isEscaped) return;
    this.isBossFightActive = true;

    // 보스전 입장 시 플레이어 정신력 100에서 300으로 대폭 증폭 (보스전 한정) & 스태미나 충전
    this.maxSanity = 300;
    this.sanity = 300;
    this.stamina = 100;

    // Unlock weapons & select Sa-in Sword
    this.inventory[0].unlocked = true;
    this.inventory[1].unlocked = true;
    this.inventory[2].unlocked = true;
    this.hasTalisman = true;
    this.hasSword = true;
    this.activeSlotIndex = 2; // Auto-equip Sa-in sword

    // Clear active mansion chunks from the scene
    this.activeChunks.forEach((chunk) => {
      this.scene.remove(chunk.group);
    });
    this.activeChunks.clear();

    // Disable roaming ghosts
    for (const ghost of this.dynamicGhosts) {
      ghost.isDead = true;
      ghost.mesh.visible = false;
    }

    // Move player to the boss arena south perimeter
    this.playerPos.set(0, 1.5, 9.0);
    this.playerYaw = Math.PI; // Look towards origin/north
    this.playerPitch = 0;
    this.camera.position.copy(this.playerPos);

    // Create & add Boss Arena
    this.bossArenaGroup = AbandonedMansionAssets.createBossArena();
    this.scene.add(this.bossArenaGroup);

    // Create & add Eoduksini Boss Model
    this.bossMesh = AbandonedMansionAssets.createEoduksiniBoss();
    this.bossPos.set(0, 0, -4.5);
    this.bossMesh.position.copy(this.bossPos);
    this.scene.add(this.bossMesh);

    // 1. Invulnerable Dark Barrier Mesh (Translucent shield around boss)
    const barrierGeo = new THREE.SphereGeometry(3.6, 16, 16);
    const barrierMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      wireframe: true,
      transparent: true,
      opacity: 0,
    });
    this.bossBarrierMesh = new THREE.Mesh(barrierGeo, barrierMat);
    this.bossBarrierMesh.position.set(0, 3.5, 0);
    this.bossMesh.add(this.bossBarrierMesh);

    // 2. Groggy / Stun Stars and Golden Trigram Ring Group
    this.bossStunEffectGroup = new THREE.Group();
    this.bossStunEffectGroup.position.set(0, 7.5, 0);
    this.bossStunEffectGroup.visible = false;
    // Golden halo ring
    const stunRingGeo = new THREE.RingGeometry(0.8, 1.3, 16);
    const stunRingMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const stunRing = new THREE.Mesh(stunRingGeo, stunRingMat);
    stunRing.rotation.x = Math.PI / 2;
    this.bossStunEffectGroup.add(stunRing);
    // 4 Dizzy Stars/Spheres
    for (let s = 0; s < 4; s++) {
      const starMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      starMesh.name = `stun_star_${s}`;
      this.bossStunEffectGroup.add(starMesh);
    }
    this.bossMesh.add(this.bossStunEffectGroup);

    // 3. Shockwave Ring (Dark Wave Slam)
    const swGeo = new THREE.RingGeometry(0.3, 0.9, 32);
    const swMat = new THREE.MeshBasicMaterial({
      color: 0xe11d48,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    this.bossShockwaveMesh = new THREE.Mesh(swGeo, swMat);
    this.bossShockwaveMesh.rotation.x = -Math.PI / 2;
    this.bossShockwaveMesh.position.y = 0.05;
    this.scene.add(this.bossShockwaveMesh);

    // 4. Black Lightning Group
    this.bossLightningGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const boltMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.4, 20, 8),
        new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0 })
      );
      boltMesh.position.set(0, 10, 0);
      this.bossLightningGroup.add(boltMesh);
    }
    this.scene.add(this.bossLightningGroup);

    // Arena Atmosphere & Lighting
    this.scene.background = new THREE.Color(0x06050a);
    this.scene.fog = new THREE.FogExp2(0x0d0714, 0.032);
    this.ambientLight.color.setHex(0x5a2d48);
    this.ambientLight.intensity = 1.3;

    // Boss State Initialization (15 HP strictly preserved)
    this.bossState = {
      active: true,
      name: '어둑시니',
      maxHp: 15,
      currentHp: 15,
      phase: 1,
      isStaggered: false,
      isInvulnerable: true,
      staggerHitsLeft: 2,
      isEnraged: false,
      currentPatternName: '공격 준비 중',
      attackWarning: null,
      introMessage: '어둑시니의 흑야 결계가 열렸습니다! 공격 중에는 무적이니, 공격 후 기절(그로기)했을 때 2회씩 타격하십시오! (총 15격)',
    };

    this.bossPhaseState = 'IDLE';
    this.bossPatternTimer = 1.5;
    this.bossPatternIndex = 0;

    // Play Boss Intro and Shaman drum BGM
    mazeAudio.playBossIntro();
    mazeAudio.startBossBgm();

    if (this.onHauntedEvent) {
      this.onHauntedEvent({
        id: `boss_spawn_${Date.now()}`,
        type: 'barrier_broken',
        message: '어둑시니의 흑야 결계가 열렸습니다! [주의: 공격 중 무적 / 공격 후 기절 시에만 2회 타격 가능]',
        sanityDrain: 0,
      });
    }

    if (this.onStatsUpdate) this.onStatsUpdate();
  }

  // Hit Boss with Exorcism Sword (1 HP Damage only during Groggy, max 2 hits per stun)
  public hitBossWithSword() {
    if (!this.bossState.active || this.bossState.currentHp <= 0) return;

    // 1. If Boss is Invulnerable (Attacking / Telegraphing / Not in Groggy)
    if (this.bossPhaseState !== 'GROGGY' || !this.bossState.isStaggered) {
      mazeAudio.playBossInvulnerableBlock();
      if (this.bossBarrierMesh) {
        (this.bossBarrierMesh.material as THREE.MeshBasicMaterial).opacity = 0.9;
      }
      if (this.onHauntedEvent) {
        this.onHauntedEvent({
          id: `boss_invuln_${Date.now()}`,
          type: 'talisman_burn',
          message: '[흑무 방어 - 무적!] 어둑시니가 공격 중에는 무적입니다! 공격 패턴이 끝난 후 기절(그로기)했을 때만 2회 타격할 수 있습니다!',
          sanityDrain: 0,
        });
      }
      return;
    }

    // 2. Boss is in GROGGY state: Process Hit
    if (this.bossState.staggerHitsLeft <= 0) return;

    this.bossState.currentHp = Math.max(0, this.bossState.currentHp - 1);
    this.bossState.staggerHitsLeft = Math.max(0, this.bossState.staggerHitsLeft - 1);

    // Boss recoil & flinch
    const recoilDir = new THREE.Vector3().subVectors(this.bossPos, this.playerPos).normalize();
    this.bossPos.addScaledVector(recoilDir, 0.9);
    const bDist = Math.hypot(this.bossPos.x, this.bossPos.z);
    if (bDist > 11.5) {
      this.bossPos.normalize().multiplyScalar(11.5);
    }
    if (this.bossMesh) {
      this.bossMesh.position.copy(this.bossPos);
    }

    // Hit audio & Sanity recover
    mazeAudio.playBossHit(this.bossState.currentHp);
    this.sanity = Math.min(100, this.sanity + 12);

    // Check Defeat
    if (this.bossState.currentHp <= 0) {
      this.handleBossDefeat();
      return;
    }

    // Check Phase 2 (Enrage) transition at 7 HP
    if (this.bossState.currentHp <= 7 && this.bossState.phase === 1) {
      this.bossState.phase = 2;
      this.bossState.isEnraged = true;
      mazeAudio.playBossRoar();
      if (this.onHauntedEvent) {
        this.onHauntedEvent({
          id: `boss_enraged_${Date.now()}`,
          type: 'shadow_figure',
          message: '[2단계 각성] 어둑시니가 흉폭하게 폭주합니다! 낙뢰와 고속 돌진에 주의하십시오!',
          sanityDrain: 0,
        });
      }
    }

    // Check if 2 Hits limit is reached for this Stun Window
    if (this.bossState.staggerHitsLeft === 0) {
      // 2 Hits Landed! Boss immediately wakes up from Groggy and becomes Invulnerable
      this.bossPhaseState = 'IDLE';
      this.bossState.isStaggered = false;
      this.bossState.isInvulnerable = true;
      this.bossStaggerTimer = 0;
      this.bossPatternTimer = 1.0;
      if (this.bossStunEffectGroup) this.bossStunEffectGroup.visible = false;

      mazeAudio.playBossRoar();

      if (this.onHauntedEvent) {
        this.onHauntedEvent({
          id: `boss_hit_wake_${Date.now()}`,
          type: 'exorcism_success',
          message: `[2타 적중!] 어둑시니가 분노하며 기절에서 깨어났습니다! (남은 체력: ${this.bossState.currentHp} / 15) 다음 공격을 회피하십시오!`,
          sanityDrain: 0,
        });
      }
    } else {
      // 1st Hit Landed
      if (this.onHauntedEvent) {
        this.onHauntedEvent({
          id: `boss_hit_1_${Date.now()}`,
          type: 'exorcism_success',
          message: `[사인참사검 1/2타 적중!] 어둑시니에게 치명타를 입혔습니다! (남은 타격 기회: 1회, 체력: ${this.bossState.currentHp} / 15)`,
          sanityDrain: 0,
        });
      }
    }

    if (this.onStatsUpdate) this.onStatsUpdate();
  }

  // Hit Boss with Sealing Talisman (1 HP Damage + Stun progress)
  public hitBossWithTalisman() {
    this.hitBossWithSword();
  }

  // Boss Defeat & Victory Handler
  public handleBossDefeat() {
    if (this.isEscaped) return;
    this.isEscaped = true;
    this.escapeMethod = 'boss';
    this.bossState.active = false;
    this.bossState.currentHp = 0;
    this.bossState.isStaggered = false;
    this.bossState.isInvulnerable = false;
    this.bossState.attackWarning = null;

    mazeAudio.stopBossBgm();
    mazeAudio.playBossDefeat();

    if (this.bossMesh) {
      this.bossMesh.visible = false;
    }
    if (this.bossShockwaveMesh) this.bossShockwaveMesh.visible = false;
    if (this.bossLightningGroup) this.bossLightningGroup.visible = false;

    if (this.onHauntedEvent) {
      this.onHauntedEvent({
        id: `boss_defeat_${Date.now()}`,
        type: 'exorcism_success',
        message: '[토벌 대성공] 어둠의 군주 어둑시니를 완전히 소멸시키고 미로의 저주를 파괴했습니다!',
        sanityDrain: 0,
      });
    }

    if (this.onEscapeVictory) {
      this.onEscapeVictory({
        method: 'boss',
        exorcisedCount: this.exorcisedGhostCount,
        depthMeters: this.depthMeters,
        roomsExplored: this.roomsExplored.size,
        relicsCount: this.collectedRelics.length,
        bossDefeated: true,
      });
    }

    if (this.onStatsUpdate) this.onStatsUpdate();
  }

  // Boss AI Update & Attack Patterns State Machine Loop
  public updateBoss(delta: number) {
    if (!this.isBossFightActive || !this.bossMesh || this.bossState.currentHp <= 0) return;

    this.bossTimer += delta;
    this.bossJumpscareCooldown -= delta;
    const time = this.bossTimer;

    // Vector from boss to player
    const toPlayer = new THREE.Vector3().subVectors(this.playerPos, this.bossPos);
    toPlayer.y = 0;
    const distToPlayer = toPlayer.length();

    // Look at player smoothly when not in extreme action
    if (distToPlayer > 0.1) {
      const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);
      this.bossMesh.rotation.y = targetAngle;
    }

    // Get sub-components of boss
    const headGroup = this.bossMesh.getObjectByName('boss_head_group') as THREE.Group | undefined;
    const armL = this.bossMesh.getObjectByName('boss_arm_left') as THREE.Group | undefined;
    const armR = this.bossMesh.getObjectByName('boss_arm_right') as THREE.Group | undefined;
    const coreMesh = this.bossMesh.getObjectByName('boss_core_mesh') as THREE.Mesh | undefined;
    const eyeLight = this.bossMesh.getObjectByName('boss_eye_light') as THREE.PointLight | undefined;

    // Barrier Fade
    if (this.bossBarrierMesh) {
      const bMat = this.bossBarrierMesh.material as THREE.MeshBasicMaterial;
      if (bMat.opacity > 0) {
        bMat.opacity = Math.max(0, bMat.opacity - delta * 2.8);
      }
    }

    // Shockwave Ring Animation
    if (this.bossShockwaveMesh && this.bossShockwaveMesh.visible) {
      const swMat = this.bossShockwaveMesh.material as THREE.MeshBasicMaterial;
      this.bossShockwaveMesh.scale.multiplyScalar(1.0 + delta * 7.5);
      swMat.opacity -= delta * 1.8;
      if (swMat.opacity <= 0) {
        this.bossShockwaveMesh.visible = false;
      }
    }

    // Core pulsing animation
    if (coreMesh) {
      const isGroggy = this.bossPhaseState === 'GROGGY';
      const pulseSpeed = isGroggy ? 2.5 : this.bossState.isEnraged ? 9.0 : 6.0;
      const pulse = 1.0 + Math.sin(time * pulseSpeed) * (isGroggy ? 0.35 : 0.2);
      coreMesh.scale.set(pulse, pulse, pulse);
    }

    // Eye light intensity & enrage flare
    if (eyeLight) {
      if (this.bossPhaseState === 'GROGGY') {
        eyeLight.intensity = 1.2 + Math.sin(time * 5.0) * 0.4;
        eyeLight.color.setHex(0xfbbf24); // Dim gold in groggy
      } else {
        eyeLight.intensity = (this.bossState.isEnraged ? 4.5 : 2.5) + Math.sin(time * 8.0) * 0.8;
        eyeLight.color.setHex(0xff1122); // Menacing crimson
      }
    }

    // Looming Scale ("더 크게 자라나는 어둑시니")
    const scaleBase = this.bossState.isEnraged ? 1.25 : 1.05;
    const breathe = Math.sin(time * 2.2) * 0.08;
    const finalScale = scaleBase + breathe;
    this.bossMesh.scale.set(finalScale, finalScale, finalScale);

    // ==========================================
    // BOSS STATE MACHINE
    // ==========================================

    // 1. STATE: GROGGY / STUNNED (무적 해제 - 2회 타격 가능!)
    if (this.bossPhaseState === 'GROGGY') {
      this.bossState.isStaggered = true;
      this.bossState.isInvulnerable = false;
      this.bossState.attackWarning = null;
      this.bossStaggerTimer -= delta;

      // Boss slumps down, head hangs low, arms tremble
      this.bossMesh.position.y = -0.4 + Math.sin(time * 12) * 0.08;
      if (armL) armL.rotation.x = -0.9 + Math.sin(time * 8) * 0.15;
      if (armR) armR.rotation.x = -0.9 + Math.sin(time * 8) * 0.15;
      if (headGroup) headGroup.rotation.x = -0.45;

      // Stun visual effects
      if (this.bossStunEffectGroup) {
        this.bossStunEffectGroup.visible = true;
        this.bossStunEffectGroup.rotation.y += delta * 3.5;
        for (let s = 0; s < 4; s++) {
          const star = this.bossStunEffectGroup.getObjectByName(`stun_star_${s}`);
          if (star) {
            const starAngle = (s / 4) * Math.PI * 2 + time * 3.0;
            star.position.set(Math.cos(starAngle) * 1.1, Math.sin(time * 5 + s) * 0.2, Math.sin(starAngle) * 1.1);
          }
        }
      }

      // Timeout: Boss recovers from stun if 2 hits weren't landed in time
      if (this.bossStaggerTimer <= 0) {
        this.bossPhaseState = 'IDLE';
        this.bossState.isStaggered = false;
        this.bossState.isInvulnerable = true;
        this.bossPatternTimer = 0.8;
        if (this.bossStunEffectGroup) this.bossStunEffectGroup.visible = false;
        mazeAudio.playBossRoar();

        if (this.onHauntedEvent) {
          this.onHauntedEvent({
            id: `boss_stun_end_${Date.now()}`,
            type: 'shadow_figure',
            message: '[기절 회복] 어둑시니가 기운을 차리고 다시 무적 상태로 공격을 준비합니다!',
            sanityDrain: 0,
          });
        }
      }
      return;
    }

    // Non-Groggy: Boss is Invulnerable
    this.bossState.isStaggered = false;
    this.bossState.isInvulnerable = true;
    if (this.bossStunEffectGroup) this.bossStunEffectGroup.visible = false;

    // 2. STATE: IDLE / POSITIONING (다음 공격 준비)
    if (this.bossPhaseState === 'IDLE') {
      this.bossMesh.position.y = 0.25 + Math.sin(time * 3.0) * 0.2;
      this.bossState.attackWarning = null;
      this.bossState.currentPatternName = '공격 태세 전환 중';

      // Move smoothly toward player
      const moveSpeed = this.bossState.isEnraged ? 2.8 : 1.9;
      if (distToPlayer > 3.8) {
        this.bossPos.x += (toPlayer.x / distToPlayer) * moveSpeed * delta;
        this.bossPos.z += (toPlayer.z / distToPlayer) * moveSpeed * delta;
        const bDist = Math.hypot(this.bossPos.x, this.bossPos.z);
        if (bDist > 11.5) {
          this.bossPos.normalize().multiplyScalar(11.5);
        }
        this.bossMesh.position.copy(this.bossPos);
      }

      // Arm idle sway
      if (armL) armL.rotation.x = Math.sin(time * 2.5) * 0.35;
      if (armR) armR.rotation.x = -Math.sin(time * 2.5) * 0.35;
      if (headGroup) headGroup.rotation.x = 0;

      this.bossPatternTimer -= delta;
      if (this.bossPatternTimer <= 0) {
        // Select next pattern (0 to 4)
        this.bossPatternIndex = (this.bossPatternIndex + 1) % (this.bossState.isEnraged ? 5 : 4);
        this.bossPhaseState = 'TELEGRAPH';

        if (this.bossPatternIndex === 0) {
          this.bossTelegraphTimer = 1.6;
          this.bossState.currentPatternName = '흑야 암흑 파동';
          this.bossState.attackWarning = '⚡ [흑야 암흑 파동] 어둑시니가 도약하여 지면을 강타하려 합니다! 뒤로 즉시 물러서십시오!';
        } else if (this.bossPatternIndex === 1) {
          this.bossTelegraphTimer = 1.4;
          this.bossState.currentPatternName = '흑무 촉수 3연격';
          this.bossState.attackWarning = '⚡ [흑무 촉수 난무] 어둑시니가 3연속 고속 돌진 찌르기를 준비합니다! 옆으로 회피하십시오!';
        } else if (this.bossPatternIndex === 2) {
          this.bossTelegraphTimer = 1.5;
          this.bossState.currentPatternName = '그림자 분신 기습';
          this.bossState.attackWarning = '⚡ [그림자 분신 기습] 어둑시니가 등 뒤로 암전 기습합니다! 후방을 주시하고 즉시 피하십시오!';
        } else if (this.bossPatternIndex === 3) {
          this.bossTelegraphTimer = 1.8;
          this.bossState.currentPatternName = '흑천 번개 결계 폭풍';
          this.bossState.attackWarning = '⚡ [흑천 낙뢰 폭풍] 전장에 붉은 번개가 연쇄 폭발합니다! 바닥의 낙뢰 영역을 벗어나십시오!';
        } else {
          this.bossTelegraphTimer = 1.5;
          this.bossState.currentPatternName = '암흑 인력 소용돌이';
          this.bossState.attackWarning = '⚡ [암흑 소용돌이] 어둑시니가 모든 것을 빨아들입니다! 반대 방향으로 전력 질주하십시오!';
        }
      }
      return;
    }

    // 3. STATE: TELEGRAPHING (전조 동작 및 경고)
    if (this.bossPhaseState === 'TELEGRAPH') {
      this.bossTelegraphTimer -= delta;

      if (this.bossPatternIndex === 0) {
        // Dark Wave Slam: Raise high in air
        this.bossMesh.position.y = 0.5 + (1.6 - this.bossTelegraphTimer) * 1.5;
        if (armL) armL.rotation.x = -1.5 + Math.sin(time * 12) * 0.15;
        if (armR) armR.rotation.x = -1.5 + Math.sin(time * 12) * 0.15;
        if (headGroup) headGroup.rotation.x = 0.35;
      } else if (this.bossPatternIndex === 1) {
        // Tentacle Rush: Crouch low, aim claws
        this.bossMesh.position.y = -0.3;
        if (armL) armL.rotation.x = 0.6 + Math.sin(time * 15) * 0.2;
        if (armR) armR.rotation.x = 0.6 + Math.sin(time * 15) * 0.2;
        if (headGroup) headGroup.rotation.x = 0.2;
      } else if (this.bossPatternIndex === 2) {
        // Shadow Mirage: Flicker opacity & sink into floor
        this.bossMesh.position.y = -0.5 - (1.5 - this.bossTelegraphTimer) * 1.2;
      } else if (this.bossPatternIndex === 3) {
        // Black Lightning: Arms spread wide, head tilted skyward
        if (armL) armL.rotation.z = -1.2;
        if (armR) armR.rotation.z = 1.2;
        if (headGroup) headGroup.rotation.x = 0.6;
      } else {
        // Vortex Pull: Pull particles inward
        if (armL) armL.rotation.x = 0.9;
        if (armR) armR.rotation.x = 0.9;
      }

      if (this.bossTelegraphTimer <= 0) {
        this.bossPhaseState = 'ATTACKING';
        if (this.bossPatternIndex === 0) {
          this.bossActionTimer = 0.6;
        } else if (this.bossPatternIndex === 1) {
          this.bossActionTimer = 1.2;
          mazeAudio.playBossTentacleRush();
        } else if (this.bossPatternIndex === 2) {
          this.bossActionTimer = 0.8;
          // Teleport behind player
          const pAngle = this.playerYaw;
          const targetX = this.playerPos.x + Math.sin(pAngle) * 4.2;
          const targetZ = this.playerPos.z + Math.cos(pAngle) * 4.2;
          const cDist = Math.hypot(targetX, targetZ);
          if (cDist < 11.5) {
            this.bossPos.set(targetX, 0, targetZ);
          } else {
            this.bossPos.set(-targetX * 0.5, 0, -targetZ * 0.5);
          }
          this.bossMesh.position.copy(this.bossPos);
          mazeAudio.playBossRoar();
        } else if (this.bossPatternIndex === 3) {
          this.bossActionTimer = 1.6;
          mazeAudio.playBossLightningStorm();
        } else {
          this.bossActionTimer = 1.8;
          mazeAudio.playBossVortexPull();
        }
      }
      return;
    }

    // 4. STATE: ATTACKING (공격 실행 후 -> 바로 기절/그로기 전환)
    if (this.bossPhaseState === 'ATTACKING') {
      this.bossActionTimer -= delta;

      // Pattern 0: Dark Wave Slam Execution
      if (this.bossPatternIndex === 0) {
        this.bossMesh.position.y = Math.max(0, this.bossMesh.position.y - delta * 9.0);
        if (this.bossActionTimer <= 0.3 && !this.bossShockwaveMesh?.visible) {
          mazeAudio.playBossSlam();
          if (this.bossShockwaveMesh) {
            this.bossShockwaveMesh.position.set(this.bossPos.x, 0.05, this.bossPos.z);
            this.bossShockwaveMesh.scale.set(1, 1, 1);
            (this.bossShockwaveMesh.material as THREE.MeshBasicMaterial).opacity = 0.95;
            this.bossShockwaveMesh.visible = true;
          }

          if (distToPlayer < 6.8) {
            const dmg = this.bossState.isEnraged ? 25 : 18;
            this.sanity = Math.max(0, this.sanity - dmg);
            if (this.bossJumpscareCooldown <= 0) {
              this.bossJumpscareCooldown = 5.0;
              this.triggerJumpscare('boss_demon', '어둑시니의 멸살파', dmg);
            } else {
              mazeAudio.playHeartbeat(150);
            }
            const pushDir = new THREE.Vector3().subVectors(this.playerPos, this.bossPos).normalize();
            this.playerPos.addScaledVector(pushDir, 3.2);
            this.camera.position.copy(this.playerPos);
          }
        }
      }
      // Pattern 1: Shadow Tentacle Rush Execution
      else if (this.bossPatternIndex === 1) {
        const rushSpeed = this.bossState.isEnraged ? 8.5 : 6.5;
        this.bossPos.x += (toPlayer.x / (distToPlayer || 1)) * rushSpeed * delta;
        this.bossPos.z += (toPlayer.z / (distToPlayer || 1)) * rushSpeed * delta;
        this.bossMesh.position.copy(this.bossPos);

        if (distToPlayer < 4.2) {
          const dmg = this.bossState.isEnraged ? 24 : 16;
          this.sanity = Math.max(0, this.sanity - dmg);
          if (this.bossJumpscareCooldown <= 0) {
            this.bossJumpscareCooldown = 5.0;
            this.triggerJumpscare('boss_demon', '어둑시니의 돌진', dmg);
          } else {
            mazeAudio.playHeartbeat(140);
          }
          const pushDir = new THREE.Vector3().subVectors(this.playerPos, this.bossPos).normalize();
          this.playerPos.addScaledVector(pushDir, 2.0);
          this.camera.position.copy(this.playerPos);
        }
      }
      // Pattern 2: Shadow Mirage Cross-Slash
      else if (this.bossPatternIndex === 2) {
        this.bossMesh.position.y = 0.2;
        if (armL) armL.rotation.x = 0.8;
        if (armR) armR.rotation.x = 0.8;
        if (distToPlayer < 4.5 && this.bossActionTimer < 0.4) {
          const dmg = this.bossState.isEnraged ? 26 : 18;
          this.sanity = Math.max(0, this.sanity - dmg);
          if (this.bossJumpscareCooldown <= 0) {
            this.bossJumpscareCooldown = 4.0;
            this.triggerJumpscare('boss_demon', '어둑시니의 흉조 참격', dmg);
          } else {
            mazeAudio.playGhostJumpscareScream('boss_demon');
            mazeAudio.playHeartbeat(150);
            this.cameraShakeIntensity = 1.1;
          }
        }
      }
      // Pattern 3: Black Lightning Storm Execution
      else if (this.bossPatternIndex === 3) {
        if (this.bossLightningGroup) {
          this.bossLightningGroup.visible = true;
          this.bossLightningGroup.children.forEach((bolt, idx) => {
            const bMat = (bolt as THREE.Mesh).material as THREE.MeshBasicMaterial;
            bMat.opacity = Math.sin(time * 18 + idx) > 0 ? 0.9 : 0.1;
            const bAngle = (idx / 6) * Math.PI * 2 + time * 1.5;
            bolt.position.set(Math.cos(bAngle) * 6.5, 8, Math.sin(bAngle) * 6.5);
          });
        }
        if (distToPlayer < 5.0 && Math.sin(time * 10) > 0.6) {
          this.sanity = Math.max(0, this.sanity - 8 * delta);
        }
      }
      // Pattern 4: Shadow Vortex Pull Execution
      else {
        // Pull player toward boss center
        const pullDir = new THREE.Vector3().subVectors(this.bossPos, this.playerPos).normalize();
        this.playerPos.addScaledVector(pullDir, 3.5 * delta);
        this.camera.position.copy(this.playerPos);

        if (this.bossActionTimer <= 0.2 && distToPlayer < 5.2) {
          mazeAudio.playBossSlam();
          this.sanity = Math.max(0, this.sanity - (this.bossState.isEnraged ? 28 : 20));
          mazeAudio.playHeartbeat(150);
          const pushDir = new THREE.Vector3().subVectors(this.playerPos, this.bossPos).normalize();
          this.playerPos.addScaledVector(pushDir, 4.0);
          this.camera.position.copy(this.playerPos);
        }
      }

      // Transition to GROGGY state upon attack completion!
      if (this.bossActionTimer <= 0) {
        if (this.bossLightningGroup) this.bossLightningGroup.visible = false;
        this.bossPhaseState = 'GROGGY';
        this.bossState.isStaggered = true;
        this.bossState.isInvulnerable = false;
        this.bossState.staggerHitsLeft = 2; // Exactly 2 hits allowed per stun window!
        this.bossStaggerTimer = 4.2; // 4.2s Groggy window
        this.bossState.attackWarning = null;
        this.bossState.currentPatternName = '기절 / 그로기 상태 (2회 타격 가능!)';

        mazeAudio.playBossStaggerGroggy();

        if (this.onHauntedEvent) {
          this.onHauntedEvent({
            id: `boss_groggy_${Date.now()}`,
            type: 'exorcism_success',
            message: '⚡ [어둑시니 기절!] 공격 후 어둑시니가 힘을 잃고 그로기 상태에 빠졌습니다! 2회 타격하십시오!',
            sanityDrain: 0,
          });
        }
      }
    }
  }

  // Robust Ghost-versus-Wall 2D sliding collision and anti-penetration resolver
  private resolveGhostPosition(
    currX: number,
    currZ: number,
    nextX: number,
    nextZ: number,
    ghostRadius: number = 0.36
  ): { x: number; z: number } {
    let resolvedX = nextX;
    let resolvedZ = nextZ;
    const padding = 0.03;

    const ghostGx = Math.round(currX / this.chunkSize);
    const ghostGz = Math.round(currZ / this.chunkSize);

    // 1. Gather all collision boxes from nearby 3x3 active chunks
    const boxes: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const chunk = this.activeChunks.get(`${ghostGx + dx}_${ghostGz + dz}`);
        if (chunk) {
          boxes.push(...chunk.walls);
        }
      }
    }

    // 2. Gather closed doors (blocks ghost passage through closed Hanji doors, local chunk check)
    for (const [, door] of this.activeDoors) {
      if (Math.abs(door.chunkGx - ghostGx) > 1 || Math.abs(door.chunkGz - ghostGz) > 1) continue;
      if (door.slideProgress < 0.65) {
        boxes.push(door.wallBox);
      }
    }

    // 3. Resolve X axis movement (keeping Z at currZ)
    for (const w of boxes) {
      const inZBand =
        currZ + ghostRadius > w.minZ + padding &&
        currZ - ghostRadius < w.maxZ - padding;

      if (inZBand) {
        if (resolvedX + ghostRadius > w.minX && resolvedX - ghostRadius < w.maxX) {
          if (currX <= w.minX) {
            resolvedX = Math.min(currX, w.minX - ghostRadius);
          } else if (currX >= w.maxX) {
            resolvedX = Math.max(currX, w.maxX + ghostRadius);
          } else {
            resolvedX = currX;
          }
        }
      }
    }

    // 4. Resolve Z axis movement (using resolvedX)
    for (const w of boxes) {
      const inXBand =
        resolvedX + ghostRadius > w.minX + padding &&
        resolvedX - ghostRadius < w.maxX - padding;

      if (inXBand) {
        if (resolvedZ + ghostRadius > w.minZ && resolvedZ - ghostRadius < w.maxZ) {
          if (currZ <= w.minZ) {
            resolvedZ = Math.min(currZ, w.minZ - ghostRadius);
          } else if (currZ >= w.maxZ) {
            resolvedZ = Math.max(currZ, w.maxZ + ghostRadius);
          } else {
            resolvedZ = currZ;
          }
        }
      }
    }

    // 5. Absolute anti-penetration push-out
    for (const w of boxes) {
      if (
        resolvedX + ghostRadius > w.minX &&
        resolvedX - ghostRadius < w.maxX &&
        resolvedZ + ghostRadius > w.minZ &&
        resolvedZ - ghostRadius < w.maxZ
      ) {
        const pushLeft = resolvedX + ghostRadius - w.minX;
        const pushRight = w.maxX - (resolvedX - ghostRadius);
        const pushTop = resolvedZ + ghostRadius - w.minZ;
        const pushBottom = w.maxZ - (resolvedZ - ghostRadius);
        const minPush = Math.min(pushLeft, pushRight, pushTop, pushBottom);

        if (minPush === pushLeft) {
          resolvedX = w.minX - ghostRadius;
        } else if (minPush === pushRight) {
          resolvedX = w.maxX + ghostRadius;
        } else if (minPush === pushTop) {
          resolvedZ = w.minZ - ghostRadius;
        } else {
          resolvedZ = w.maxZ + ghostRadius;
        }
      }
    }

    return { x: resolvedX, z: resolvedZ };
  }

  // Dynamic Ghosts AI update: floating, wandering, wall collision, banishment respawn & slower than player
  private updateGhosts(delta: number) {
    for (let i = 0; i < this.dynamicGhosts.length; i++) {
      const ghost = this.dynamicGhosts[i];

      // Handle Banished Ghost Respawn
      if (ghost.isDead) {
        ghost.respawnTimer -= delta;
        if (ghost.respawnTimer <= 0) {
          // Respawn in a room 16~24m away
          const angle = Math.random() * Math.PI * 2;
          const spawnDist = this.chunkSize * (2.0 + Math.random() * 0.8);
          const rx = this.playerPos.x + Math.cos(angle) * spawnDist;
          const rz = this.playerPos.z + Math.sin(angle) * spawnDist;
          const safePos = this.resolveGhostPosition(this.playerPos.x, this.playerPos.z, rx, rz);

          ghost.pos.set(safePos.x, 0, safePos.z);
          ghost.targetPos.copy(ghost.pos);
          ghost.originX = safePos.x;
          ghost.originZ = safePos.z;
          ghost.isDead = false;
          ghost.mesh.visible = true;
          ghost.state = 'wandering';
          ghost.wanderTimer = 3.0;
          ghost.attackCooldown = 4.0;

          mazeAudio.playGhostPresence();
          if (this.onHauntedEvent) {
            this.onHauntedEvent({
              id: `ghost_respawn_${Date.now()}`,
              type: 'ghost_whisper',
              message: '소멸했던 원혼이 서늘한 한기와 함께 어딘가에서 다시 모습을 드러내며 다가옵니다...',
              sanityDrain: 4,
            });
          }
        }
        continue;
      }

      const dist = ghost.pos.distanceTo(this.playerPos);

      ghost.bobTimer += delta * 3.0;
      ghost.soundCooldown -= delta;
      ghost.attackCooldown -= delta;

      // Vertical floating levitation & swaying
      const floatY = 0.15 + Math.sin(ghost.bobTimer) * 0.16;
      ghost.mesh.rotation.z = Math.sin(ghost.bobTimer * 0.7) * 0.08;

      // Aura light intensity pulsing
      const aura = ghost.mesh.getObjectByName('ghost_aura') as THREE.PointLight;
      if (aura) {
        aura.intensity = 1.2 + Math.sin(ghost.bobTimer * 4.5) * 0.6;
      }

      // If player travelled far away (>26m), reposition ghost into a nearby active room floor safely
      if (dist > 26.0) {
        const angle = (i / this.dynamicGhosts.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const spawnDist = this.chunkSize * (1.6 + (i % 3) * 0.5);
        const targetX = this.playerPos.x + Math.cos(angle) * spawnDist;
        const targetZ = this.playerPos.z + Math.sin(angle) * spawnDist;
        const safePos = this.resolveGhostPosition(targetX, targetZ, targetX, targetZ);

        ghost.pos.set(safePos.x, 0, safePos.z);
        ghost.targetPos.copy(ghost.pos);
        ghost.originX = safePos.x;
        ghost.originZ = safePos.z;
        ghost.state = 'wandering';
        ghost.wanderTimer = 3.0;
        continue;
      }

      // Proximity & Behavioral States: Detection radius and speed scaled by collected relics
      // 유물을 수습할수록 귀신의 스피드와 탐지/추적 범위가 비례하여 대폭 증가!
      const relicCount = this.collectedRelics.length;
      const relicSpeedMultiplier = 1.0 + relicCount * 0.10; // 유물당 속도 10% 증가
      const detectionRadius = 7.0 + relicCount * 0.90; // 유물당 감지 범위 0.9m 확장
      const chargeRadius = 3.5 + relicCount * 0.50; // 유물당 돌진 범위 확장

      if (dist < detectionRadius) {
        const baseSpeed = (ghost.speed || 1.20) * relicSpeedMultiplier;
        ghost.state = dist < chargeRadius ? 'charging' : 'stalking';
        ghost.targetPos.copy(this.playerPos);

        const dir = new THREE.Vector3().subVectors(this.playerPos, ghost.pos);
        dir.y = 0;

        if (dir.length() > 0.1) {
          dir.normalize();

          // Face player smoothly (faster turning as relics increase)
          const targetAngle = Math.atan2(dir.x, dir.z);
          ghost.mesh.rotation.y = THREE.MathUtils.lerp(ghost.mesh.rotation.y, targetAngle, delta * (4.0 + relicCount * 0.15));

          // Move towards player with wall sliding collision
          const moveSpeed = ghost.state === 'charging' ? baseSpeed * 1.3 : baseSpeed;
          const targetNextX = ghost.pos.x + dir.x * moveSpeed * delta;
          const targetNextZ = ghost.pos.z + dir.z * moveSpeed * delta;

          const resolved = this.resolveGhostPosition(ghost.pos.x, ghost.pos.z, targetNextX, targetNextZ);
          ghost.pos.x = resolved.x;
          ghost.pos.z = resolved.z;
        }

        // Play presence sound effect and heartbeat
        if (ghost.soundCooldown <= 0 && dist < (6.5 + relicCount * 0.75)) {
          ghost.soundCooldown = 5.0 + Math.random() * 4.0;
          mazeAudio.playGhostPresence();
          mazeAudio.playHeartbeat(130);
        }

        // Close contact scare / Jumpscare attack (within 1.6m)
        if (dist < 1.6 && ghost.attackCooldown <= 0) {
          ghost.attackCooldown = 8.0;
          this.sanity = Math.max(0, this.sanity - 20);

          const variant = ghost.variant === 'shadow_specter' ? 'shadow_specter' : 'white_maiden';
          const ghostName = ghost.name || '원혼';

          // Trigger terrifying jumpscare (shriek audio, screen strobe, face lunge & camera shake)
          this.triggerJumpscare(variant, ghostName, 20);

          // Recoil ghost backwards along path with collision check
          const recoilDir = new THREE.Vector3().subVectors(ghost.pos, this.playerPos);
          recoilDir.y = 0;
          if (recoilDir.length() < 0.05) recoilDir.set(0, 0, 1);
          recoilDir.normalize();

          let recoilX = ghost.pos.x;
          let recoilZ = ghost.pos.z;
          for (let step = 0; step < 6; step++) {
            const stepTargetX = recoilX + recoilDir.x * 0.4;
            const stepTargetZ = recoilZ + recoilDir.z * 0.4;
            const res = this.resolveGhostPosition(recoilX, recoilZ, stepTargetX, stepTargetZ);
            if (Math.abs(res.x - recoilX) < 0.01 && Math.abs(res.z - recoilZ) < 0.01) {
              break;
            }
            recoilX = res.x;
            recoilZ = res.z;
          }
          ghost.pos.set(recoilX, 0, recoilZ);
          ghost.targetPos.copy(ghost.pos);

          if (this.onHauntedEvent) {
            this.onHauntedEvent({
              id: `ghost_attack_${Date.now()}_${ghost.id}`,
              type: 'shadow_figure',
              message: `${ghostName}이(가) 덮쳤습니다! 등불이 꺼지고 정신력이 급감합니다! (SAN -20%)`,
              sanityDrain: 20,
            });
          }
        }
      } else {
        // Wandering around origin room/chunk area at slow pacing
        ghost.state = 'wandering';
        ghost.wanderTimer -= delta;

        if (ghost.wanderTimer <= 0 || ghost.pos.distanceTo(ghost.targetPos) < 0.4) {
          ghost.wanderTimer = Math.max(1.8, 3.5 - relicCount * 0.1) + Math.random() * 3.5;
          const wanderSpan = (this.chunkSize - 2.0) * (1.0 + Math.min(2.0, relicCount * 0.12));
          const testTargetX = ghost.originX + (Math.random() - 0.5) * wanderSpan;
          const testTargetZ = ghost.originZ + (Math.random() - 0.5) * wanderSpan;
          const valid = this.resolveGhostPosition(ghost.pos.x, ghost.pos.z, testTargetX, testTargetZ);
          ghost.targetPos.set(valid.x, 0, valid.z);
        }

        const dir = new THREE.Vector3().subVectors(ghost.targetPos, ghost.pos);
        dir.y = 0;
        if (dir.length() > 0.1) {
          dir.normalize();
          const targetAngle = Math.atan2(dir.x, dir.z);
          ghost.mesh.rotation.y = THREE.MathUtils.lerp(ghost.mesh.rotation.y, targetAngle, delta * 3.0);

          const stepSpeed = (ghost.speed || 1.20) * relicSpeedMultiplier * 0.50;
          const targetNextX = ghost.pos.x + dir.x * stepSpeed * delta;
          const targetNextZ = ghost.pos.z + dir.z * stepSpeed * delta;

          const resolved = this.resolveGhostPosition(ghost.pos.x, ghost.pos.z, targetNextX, targetNextZ);
          ghost.pos.x = resolved.x;
          ghost.pos.z = resolved.z;
        }
      }

      ghost.mesh.position.set(ghost.pos.x, floatY, ghost.pos.z);
    }
  }

  // Ghost check and sanity drain in pitch darkness
  private updateSanityAndHorror(delta: number) {
    // Battery and light handling (balanced slow drain when flashlight is ON)
    if (this.lightMode === 'flashlight') {
      this.battery = Math.max(0, this.battery - delta * 0.12);
      // Graceful dimming on low battery without forcibly switching light mode
      const batRatio = Math.max(0.2, this.battery / 100);
      this.flashlight.intensity = 8.5 * this.brightnessMultiplier * batRatio;
    }

    // Sanity drain in pitch dark
    if (this.lightMode === 'off') {
      this.sanity = Math.max(0, this.sanity - delta * 2.5);
    }

    // Compute nearest active ghost distance for audio tension & heartbeat
    let nearestGhostDist = 999;
    for (const ghost of this.dynamicGhosts) {
      if (ghost.isDead) continue;
      const dist = ghost.pos.distanceTo(this.playerPos);
      if (dist < nearestGhostDist) {
        nearestGhostDist = dist;
      }
    }

    // Update real-time dynamic heartbeat and horror background sound (active when SAN <= 30% or ghost is near)
    mazeAudio.updateSanityHeartbeat(
      this.sanity,
      nearestGhostDist < (7.0 + this.collectedRelics.length * 0.9),
      this.maxSanity
    );

    // Proximity sanity drain from any nearby ghost
    this.ghostCheckTimer += delta;
    if (this.ghostCheckTimer > 0.8) {
      this.ghostCheckTimer = 0;
      if (nearestGhostDist < 6.5) {
        this.sanity = Math.max(0, this.sanity - 4);
      }
    }

    // Random water drip in maze
    if (Math.random() < 0.015) {
      mazeAudio.playWaterDrip();
    }

    // Occasional lightning outside
    this.lightningTimer -= delta;
    if (this.lightningTimer <= 0) {
      this.lightningTimer = 18 + Math.random() * 20;
      this.ambientLight.color.setHex(0x557799);
      this.ambientLight.intensity = 2.2 * this.brightnessMultiplier;
      setTimeout(() => {
        this.ambientLight.color.setHex(0x405068);
        this.ambientLight.intensity = 1.1 * this.brightnessMultiplier;
      }, 120);
    }
  }

  // Set Dynamic Brightness Multiplier
  public setBrightness(multiplier: number) {
    this.brightnessMultiplier = Math.max(0.6, Math.min(3.0, multiplier));
    this.ambientLight.intensity = 1.1 * this.brightnessMultiplier;
    this.renderer.toneMappingExposure = 1.35 * this.brightnessMultiplier;
    this.flashlight.intensity = 8.5 * this.brightnessMultiplier;
    this.lanternLight.intensity = 5.5 * this.brightnessMultiplier;
  }

  // Set Sensitivity Multiplier
  public setSensitivity(multiplier: number) {
    this.sensitivityMultiplier = Math.max(0.4, Math.min(4.0, multiplier));
  }

  // Toggle Light Modes (Clean ON / OFF)
  public toggleLight() {
    mazeAudio.playFlashlightClick();
    if (this.lightMode === 'off') {
      this.setLightMode('flashlight');
    } else {
      this.setLightMode('off');
    }
  }

  public setLightMode(mode: 'flashlight' | 'lantern' | 'off') {
    this.lightMode = mode;
    this.flashlight.visible = mode === 'flashlight';
    this.lanternLight.visible = mode === 'lantern';
    if (mode === 'flashlight') {
      const batRatio = Math.max(0.2, this.battery / 100);
      this.flashlight.intensity = 8.5 * this.brightnessMultiplier * batRatio;
    }
    if (this.onStatsUpdate) this.onStatsUpdate();
  }

  // Active Hotbar Slot Selection & Weapon Equipping
  public setActiveSlot(index: number) {
    if (index < 0 || index >= this.inventory.length) return;
    const item = this.inventory[index];

    // Cannot equip uncollected/locked relics or weapons
    if (!item.unlocked) {
      if (this.onHauntedEvent) {
        this.onHauntedEvent({
          id: `item_locked_${Date.now()}`,
          type: 'talisman_burn',
          message: item.id === 'exorcism_sword'
            ? '사인참사검(四寅斬邪劍)을 아직 획득하지 못했습니다. 미로 속 보검대에서 뽑아들어야 합니다.'
            : '구천응원 봉인부적을 아직 획득하지 못했습니다. 미로 속 안치실 제단에서 수습해야 합니다.',
          sanityDrain: 0,
        });
      }
      return;
    }

    if (this.activeSlotIndex === index) return; // Prevent duplicate slot trigger sound/glitches
    this.activeSlotIndex = index;

    // Sound effect on equipping
    if (item.id === 'flashlight') {
      mazeAudio.playFlashlightClick();
    } else if (item.id === 'sealing_talisman' && item.unlocked) {
      mazeAudio.playTalismanExorcism();
    } else if (item.id === 'exorcism_sword' && item.unlocked) {
      mazeAudio.playSwordSlash();
    }

    if (this.onStatsUpdate) this.onStatsUpdate();
  }

  public selectNextSlot() {
    let nextIdx = (this.activeSlotIndex + 1) % this.inventory.length;
    let attempts = 0;
    while (!this.inventory[nextIdx].unlocked && attempts < this.inventory.length) {
      nextIdx = (nextIdx + 1) % this.inventory.length;
      attempts++;
    }
    if (this.inventory[nextIdx].unlocked) {
      this.setActiveSlot(nextIdx);
    }
  }

  public nextSlot() {
    this.selectNextSlot();
  }

  public selectPrevSlot() {
    let prevIdx = (this.activeSlotIndex - 1 + this.inventory.length) % this.inventory.length;
    let attempts = 0;
    while (!this.inventory[prevIdx].unlocked && attempts < this.inventory.length) {
      prevIdx = (prevIdx - 1 + this.inventory.length) % this.inventory.length;
      attempts++;
    }
    if (this.inventory[prevIdx].unlocked) {
      this.setActiveSlot(prevIdx);
    }
  }

  public prevSlot() {
    this.selectPrevSlot();
  }

  // Use currently active weapon or tool (Left Click / F / Space)
  public useActiveItem() {
    const item = this.inventory[this.activeSlotIndex];
    if (!item) return;

    if (item.id === 'flashlight') {
      this.toggleLight();
    } else if (item.id === 'sealing_talisman') {
      if (item.unlocked) {
        this.useTalisman();
      } else {
        if (this.onHauntedEvent) {
          this.onHauntedEvent({
            id: `item_locked_${Date.now()}`,
            type: 'talisman_burn',
            message: '구천응원 봉인부적을 아직 획득하지 못했습니다. 미로 속 안치실 제단에서 수습해야 합니다.',
            sanityDrain: 0,
          });
        }
      }
    } else if (item.id === 'exorcism_sword') {
      if (item.unlocked) {
        this.useSword();
      } else {
        if (this.onHauntedEvent) {
          this.onHauntedEvent({
            id: `item_locked_${Date.now()}`,
            type: 'talisman_burn',
            message: '사인참사검(四寅斬邪劍)을 아직 획득하지 못했습니다. 미로 속 보검대에서 뽑아들어야 합니다.',
            sanityDrain: 0,
          });
        }
      }
    }
  }

  // Cast Holy Sealing Talisman
  public useTalisman() {
    if (this.vmIsAttacking) return;
    this.vmIsAttacking = true;
    this.vmAttackTimer = 0.45;
    mazeAudio.playTalismanExorcism();

    // 1. Boss Fight Target Hit
    if (this.isBossFightActive && this.bossState.active && this.bossState.currentHp > 0) {
      const toBoss = new THREE.Vector3().subVectors(this.bossPos, this.playerPos);
      toBoss.y = 0;
      const dist = toBoss.length();

      const forward = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      toBoss.normalize();
      const dot = forward.dot(toBoss);

      if (dist < 11.0 && dot > 0.4) {
        this.hitBossWithTalisman();
        return;
      }
    }

    // 2. Regular Ghost Exorcism (Distance <= 7.5m, in front)
    let exorcisedAny = false;
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    for (const ghost of this.dynamicGhosts) {
      if (ghost.isDead || !ghost.mesh.visible) continue;
      const toGhost = new THREE.Vector3().subVectors(ghost.pos, this.playerPos);
      toGhost.y = 0;
      const dist = toGhost.length();

      if (dist < 7.5) {
        toGhost.normalize();
        const dot = forward.dot(toGhost);
        if (dot > 0.45) {
          this.exorciseGhost(ghost, 'talisman');
          exorcisedAny = true;
          break;
        }
      }
    }

    if (!exorcisedAny && !this.isBossFightActive) {
      if (this.onHauntedEvent) {
        this.onHauntedEvent({
          id: `talisman_cast_${Date.now()}`,
          type: 'talisman_burn',
          message: '[봉인 진언 영창] 주사 부적이 붉은 성광을 내뿜으며 전방의 사악한 기운을 정화합니다.',
          sanityDrain: 0,
        });
      }
    }
  }

  // Strike with Sacred Exorcism Sword
  public useSword() {
    if (this.vmIsAttacking) return;
    this.vmIsAttacking = true;
    this.vmAttackTimer = 0.35;
    mazeAudio.playSwordSlash();

    // 1. Boss Fight Target Hit
    if (this.isBossFightActive && this.bossState.active && this.bossState.currentHp > 0) {
      const toBoss = new THREE.Vector3().subVectors(this.bossPos, this.playerPos);
      toBoss.y = 0;
      const dist = toBoss.length();

      const forward = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      toBoss.normalize();
      const dot = forward.dot(toBoss);

      if (dist < 6.8 && dot > 0.35) {
        this.hitBossWithSword();
        return;
      }
    }

    // 2. Regular Ghost Exorcism (Distance <= 4.6m, in front)
    let exorcisedAny = false;
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    for (const ghost of this.dynamicGhosts) {
      if (ghost.isDead || !ghost.mesh.visible) continue;
      const toGhost = new THREE.Vector3().subVectors(ghost.pos, this.playerPos);
      toGhost.y = 0;
      const dist = toGhost.length();

      if (dist < 4.6) {
        toGhost.normalize();
        const dot = forward.dot(toGhost);
        if (dot > 0.4) {
          this.exorciseGhost(ghost, 'sword');
          exorcisedAny = true;
          break;
        }
      }
    }

    if (!exorcisedAny && !this.isBossFightActive) {
      if (this.onHauntedEvent) {
        this.onHauntedEvent({
          id: `sword_swing_${Date.now()}`,
          type: 'shadow_figure',
          message: '[사인참사검 일격] 28수 성좌의 검기가 허공을 가르며 푸른 파동을 일으킵니다.',
          sanityDrain: 0,
        });
      }
    }
  }

  // Exorcise Regular Ghost and restore player sanity
  public exorciseGhost(ghost: ActiveGhost, weapon: 'sword' | 'talisman') {
    ghost.isDead = true;
    ghost.mesh.visible = false;
    ghost.respawnTimer = 35.0;
    this.exorcisedGhostCount++;

    mazeAudio.playGhostDissipate();
    this.sanity = Math.min(this.maxSanity, this.sanity + 30);

    const weaponName = weapon === 'sword' ? '사인참사검(四寅斬邪劍)' : '구천응원 봉인부적';
    if (this.onHauntedEvent) {
      this.onHauntedEvent({
        id: `exorcise_${Date.now()}`,
        type: 'exorcism_success',
        message: `[원혼 퇴마 완료!] ${weaponName}으로 '${ghost.name}'을(를) 완벽히 정화 퇴마했습니다! (누적 ${this.exorcisedGhostCount}위 정화)`,
        sanityDrain: 0,
      });
    }

    this.checkEscapeVictory();
    if (this.onStatsUpdate) this.onStatsUpdate();
  }

  // Check Regular Escape Victory conditions
  public checkEscapeVictory() {
    if (this.isEscaped) return;

    // Victory Condition 1: Both sacred items collected (봉인부적 + 사인참사검)
    if (this.hasTalisman && this.hasSword) {
      this.isEscaped = true;
      this.escapeMethod = 'relics';
      mazeAudio.playEscapeVictory();
      this.releasePointerLock();

      if (this.onEscapeVictory) {
        this.onEscapeVictory({
          method: 'relics',
          exorcisedCount: this.exorcisedGhostCount,
          depthMeters: this.depthMeters,
          roomsExplored: this.roomsExplored.size,
          relicsCount: this.collectedRelics.length,
        });
      }
      return;
    }

    // Victory Condition 2: Exorcised 10+ roaming ghosts
    if (this.exorcisedGhostCount >= 10) {
      this.isEscaped = true;
      this.escapeMethod = 'kills';
      mazeAudio.playEscapeVictory();
      this.releasePointerLock();

      if (this.onEscapeVictory) {
        this.onEscapeVictory({
          method: 'kills',
          exorcisedCount: this.exorcisedGhostCount,
          depthMeters: this.depthMeters,
          roomsExplored: this.roomsExplored.size,
          relicsCount: this.collectedRelics.length,
        });
      }
    }
  }

  // Controls Binding
  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('wheel', this.handleWheel, { passive: true });

    this.container.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      // 1. 화면 돌리기 위해 처음 클릭할 때는 마우스 락만 획득하고 즉시 반환 (오동작 방지)
      if (!this.isPointerLocked) {
        this.container.requestPointerLock();
        return;
      }

      // 2. 좌클릭 (0): 들고 있는 무기/도구 사용 (회중전등 켜기/끄기, 사인참사검 휘두르기, 봉인부적 투척)
      // 제사상이나 유물 조사창을 띄우지 않고 오직 액션만 수행합니다.
      if (e.button === 0) {
        const now = performance.now();
        if (now - this.lastAttackTime > 160) {
          this.lastAttackTime = now;
          this.useActiveItem();
        }
      } else if (e.button === 2) {
        // 3. 우클릭 (2): 문 열기/닫기 또는 목표물 정밀 상호작용 (키보드 E키와 동일)
        e.preventDefault();
        this.inspectTarget('keyboard_e');
      }
    });

    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    // Native click event placeholder to prevent double firing already handled by mousedown
    this.container.addEventListener('click', (e) => {
      e.preventDefault();
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.container;
      if (!this.isPointerLocked) {
        this.resetKeys();
        this.isMouseDown = false;
      }
    });

    window.addEventListener('mousemove', this.handleMouseMove);

    // Touch screen swipe-to-look binding
    this.container.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.container.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.container.addEventListener('touchend', this.handleTouchEnd);
    this.container.addEventListener('touchcancel', this.handleTouchEnd);
  }

  public resetKeys() {
    this.keys = {};
    this.virtualMoveVector = { x: 0, y: 0 };
  }

  public releasePointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    this.resetKeys();
  }

  private handleBlur = () => {
    this.resetKeys();
  };

  private handleWheel = (e: WheelEvent) => {
    const now = performance.now();
    if (now - this.lastWheelTime < 180) return; // 180ms throttle prevents wild rapid slot cycling
    if (Math.abs(e.deltaY) < 15) return;
    this.lastWheelTime = now;

    if (e.deltaY > 0) {
      this.selectNextSlot();
    } else if (e.deltaY < 0) {
      this.selectPrevSlot();
    }
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    // Ignore input if user is typing or modal is open
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    this.keys[e.code] = true;

    // Number keys and quickkeys for direct weapon/item selection (PC / Laptop universal)
    if (e.code === 'Digit1' || e.code === 'Numpad1' || e.code === 'KeyZ') {
      this.setActiveSlot(0);
      return;
    }
    if (e.code === 'Digit2' || e.code === 'Numpad2' || e.code === 'KeyX') {
      this.setActiveSlot(1);
      return;
    }
    if (e.code === 'Digit3' || e.code === 'Numpad3' || e.code === 'KeyC' || e.code === 'KeyG') {
      // 3번 / 넘버패드3 / C / G : 사인참사검 즉시 손에 쥐기!
      this.setActiveSlot(2);
      return;
    }

    // Single-tap slot switching (Avoid repeat fire on held keys)
    if (!e.repeat) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyQ') {
        this.selectPrevSlot();
        return;
      }
      if (e.code === 'ArrowRight') {
        this.selectNextSlot();
        return;
      }
    }

    // Action execution (F key, Space key, Left Click)
    if (e.code === 'KeyF' || e.code === 'Space') {
      if (!e.repeat) {
        this.useActiveItem();
      }
    } else if (e.code === 'KeyE' || e.code === 'KeyR') {
      if (!e.repeat) {
        this.inspectTarget('keyboard_e');
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private handleMouseMove = (e: MouseEvent) => {
    const sensitivity = this.baseMouseSensitivity * this.sensitivityMultiplier;

    if (this.isPointerLocked) {
      this.playerYaw -= e.movementX * sensitivity;
      this.playerPitch -= e.movementY * sensitivity;
    } else if (this.isMouseDown) {
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.playerYaw -= dx * sensitivity;
      this.playerPitch -= dy * sensitivity;
    } else {
      return;
    }

    this.playerPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.playerPitch));
  };

  // Touch Swipe Camera Rotation
  private handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      // Only capture touch if it starts on the right 65% of screen (so left side is free for dpad)
      if (touch.clientX > window.innerWidth * 0.35) {
        this.activeTouchId = touch.identifier;
        this.lastTouchX = touch.clientX;
        this.lastTouchY = touch.clientY;
      }
    }
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (this.activeTouchId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.activeTouchId) {
        const dx = touch.clientX - this.lastTouchX;
        const dy = touch.clientY - this.lastTouchY;

        this.lastTouchX = touch.clientX;
        this.lastTouchY = touch.clientY;

        const touchSensitivity = 0.0065 * this.sensitivityMultiplier;
        this.playerYaw -= dx * touchSensitivity;
        this.playerPitch -= dy * touchSensitivity;
        this.playerPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.playerPitch));
        break;
      }
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.activeTouchId) {
        this.activeTouchId = null;
        break;
      }
    }
  };

  private handleResize = () => {
    if (!this.container) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  // Virtual Controls for Mobile / Buttons
  public setVirtualMove(x: number, y: number) {
    this.virtualMoveVector.x = x;
    this.virtualMoveVector.y = y;
  }

  public rotateViewBy(deltaYaw: number, deltaPitch: number) {
    const factor = this.sensitivityMultiplier;
    this.playerYaw += deltaYaw * factor;
    this.playerPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.playerPitch + deltaPitch * factor));
  }

  // Main Loop
  private animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;

    // Smooth door opening/closing animations
    this.activeDoors.forEach((door) => {
      if (Math.abs(door.slideProgress - door.targetSlide) > 0.001) {
        door.slideProgress += (door.targetSlide - door.slideProgress) * Math.min(1.0, 8.5 * delta);
        door.slidingLeaf.position.x = door.slideProgress * 1.35;
      }
    });

    this.updatePlayerMovement(delta);
    if (this.isBossFightActive) {
      this.updateBoss(delta);
    } else {
      this.updateChunks();
      this.updateGhosts(delta);
    }

    // Update First-Person Viewmodels & Animations
    const isSlot0 = this.activeSlotIndex === 0;
    const isSlot1 = this.activeSlotIndex === 1 && this.inventory[1].unlocked;
    const isSlot2 = this.activeSlotIndex === 2 && this.inventory[2].unlocked;

    this.vmFlashlight.visible = isSlot0;
    this.vmTalisman.visible = isSlot1;
    this.vmSword.visible = isSlot2;

    const time = performance.now() * 0.002;
    const idleSwayX = Math.sin(time * 1.6) * 0.006;
    const idleSwayY = Math.cos(time * 3.2) * 0.005;

    if (this.vmIsAttacking) {
      this.vmAttackTimer -= delta;
      if (this.vmAttackTimer <= 0) {
        this.vmIsAttacking = false;
      }
    }

    if (isSlot1) {
      // Sealing Talisman thrust forward
      if (this.vmIsAttacking) {
        const attackProgress = 1.0 - Math.max(0, this.vmAttackTimer / 0.45);
        this.vmTalisman.position.set(0.14, -0.12, -0.52 - Math.sin(attackProgress * Math.PI) * 0.12);
        this.vmTalisman.rotation.set(0.28, -0.05, 0.02);
      } else {
        this.vmTalisman.position.set(0.2 + idleSwayX, -0.18 + idleSwayY, -0.38);
        this.vmTalisman.rotation.set(0.12, -0.15, 0.05);
      }
    } else if (isSlot2) {
      // Exorcism Sword slash swing (사인참사검 시원한 대각선 검격 궤적)
      if (this.vmSwordLight) {
        this.vmSwordLight.intensity = this.vmIsAttacking ? 5.2 : 2.6;
      }
      if (this.vmIsAttacking) {
        const progress = 1.0 - Math.max(0, this.vmAttackTimer / 0.35);
        this.vmSword.position.set(
          0.22 - progress * 0.44,
          -0.19 + Math.sin(progress * Math.PI) * 0.20,
          -0.38 - progress * 0.12
        );
        this.vmSword.rotation.set(
          0.38 + progress * 1.3,
          -0.24 - progress * 1.5,
          0.42 - progress * 1.8
        );
      } else {
        this.vmSword.position.set(0.22 + idleSwayX, -0.19 + idleSwayY, -0.38);
        this.vmSword.rotation.set(0.38, -0.24, 0.42);
      }
    } else {
      this.vmFlashlight.position.set(0.22 + idleSwayX, -0.22 + idleSwayY, -0.42);
    }

    // Throttle interaction raycasting to 20Hz (every 50ms) to maintain rock-solid 60fps
    this.raycastTimer += delta;
    if (this.raycastTimer >= 0.05) {
      this.raycastTimer = 0;
      this.updateRaycast();
    }

    this.updateSanityAndHorror(delta);

    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('wheel', this.handleWheel);
    window.removeEventListener('mousemove', this.handleMouseMove);
    this.container.removeEventListener('touchstart', this.handleTouchStart);
    this.container.removeEventListener('touchmove', this.handleTouchMove);
    this.container.removeEventListener('touchend', this.handleTouchEnd);
    this.container.removeEventListener('touchcancel', this.handleTouchEnd);

    mazeAudio.stopBossBgm();
    if (this.bossMesh) {
      this.scene.remove(this.bossMesh);
    }
    if (this.bossArenaGroup) {
      this.scene.remove(this.bossArenaGroup);
    }

    this.dynamicGhosts.forEach((ghost) => {
      this.scene.remove(ghost.mesh);
    });
    this.dynamicGhosts = [];

    if (this.dustParticles) {
      this.scene.remove(this.dustParticles);
      this.dustParticles.geometry.dispose();
      (this.dustParticles.material as THREE.Material).dispose();
      this.dustParticles = null;
    }
    if (this.mistParticles) {
      this.scene.remove(this.mistParticles);
      this.mistParticles.geometry.dispose();
      (this.mistParticles.material as THREE.Material).dispose();
      this.mistParticles = null;
    }

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
