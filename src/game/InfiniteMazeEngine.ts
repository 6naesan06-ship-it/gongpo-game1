import * as THREE from 'three';
import { AbandonedMansionAssets } from './proceduralAssets';
import { mazeAudio } from '../audio/mazeHorrorAudio';
import { RelicItem, HauntedEvent, InventorySlotItem, EscapeVictoryData, BossState } from '../types';

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
      description: '인년, 인월, 인일, 인시에 벼려진 신성한 보검. 칼날의 28수 별자리가 빛을 발하며 접근하는 원혼을 즉시 베어 정화합니다.',
      actionPrompt: '퇴마 참격 베기 (퇴마)',
      unlocked: false,
    },
  ];
  public activeSlotIndex: number = 0;
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
    isEnraged: false,
    attackWarning: null,
  };
  public bossMesh: THREE.Group | null = null;
  public bossArenaGroup: THREE.Group | null = null;
  public bossPos: THREE.Vector3 = new THREE.Vector3(0, 0, -5.5);
  private bossTimer: number = 0;
  private bossAttackTimer: number = 4.2;
  private bossTeleportTimer: number = 8.0;
  private bossStaggerTimer: number = 0;
  private bossRoarCooldown: number = 0;

  // Viewmodels
  private viewmodelGroup: THREE.Group;
  private vmFlashlight: THREE.Group;
  private vmTalisman: THREE.Group;
  private vmSword: THREE.Group;
  private vmIsAttacking: boolean = false;
  private vmAttackTimer: number = 0;

  // Configurable Settings
  public brightnessMultiplier: number = 1.4;
  public sensitivityMultiplier: number = 1.5;

  // Lights
  private flashlight: THREE.SpotLight;
  private flashlightTarget: THREE.Object3D;
  private lanternLight: THREE.PointLight;
  private ambientLight: THREE.AmbientLight;
  private dustParticles: THREE.Points | null = null;

  // Controls
  private keys: { [key: string]: boolean } = {};
  private baseMouseSensitivity: number = 0.0036;
  public isPointerLocked: boolean = false;
  private isMouseDown: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private virtualMoveVector: { x: number; y: number } = { x: 0, y: 0 };

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
    const talMesh = AbandonedMansionAssets.createTalisman(0.48);
    this.vmTalisman.add(talMesh);
    this.vmTalisman.position.set(0.2, -0.18, -0.38);
    this.vmTalisman.rotation.set(0.12, -0.15, 0.05);
    this.vmTalisman.visible = false;
    this.viewmodelGroup.add(this.vmTalisman);

    // Viewmodel Exorcism Sword
    this.vmSword = AbandonedMansionAssets.createExorcismSword();
    this.vmSword.scale.set(0.45, 0.45, 0.45);
    this.vmSword.position.set(0.24, -0.26, -0.42);
    this.vmSword.rotation.set(0.35, -0.22, 0.45);
    this.vmSword.visible = false;
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

  // Generate floating dust motes catching light beams
  private createDustMotes() {
    const count = 80;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = Math.random() * 3.2;
      positions[i + 2] = (Math.random() - 0.5) * 20;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xd0c4b0,
      size: 0.04,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    this.dustParticles = new THREE.Points(geometry, material);
    this.scene.add(this.dustParticles);
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

    // Sacred Item Rooms (봉인부적 & 사인참사검)
    // 1. 사인참사검(四寅斬邪劍) 위치 유지: 원거리 및 특정 좌표에 고정 유지
    const isSacredSwordRoom = ((gx === -1 && gz === 1) || (gx === 2 && gz === 1) || (gx === -2 && gz === -2) || (roomDistance >= 4 && ((Math.abs(gx * 37 + gz * 23)) % 11 === 7)));

    // 2. 구천응원 봉인부적(封印符籍): 저택의 아주 깊숙한 밀실(거리 8~10 이상의 은밀한 방)에만 배치
    const isSacredTalismanRoom = !isSacredSwordRoom && (
      (gx === 5 && gz === 4) || (gx === -6 && gz === 5) || (gx === 4 && gz === -6) || (gx === -5 && gz === -5) ||
      (roomDistance >= 9 && ((Math.abs(gx * 31 + gz * 17)) % 13 === 4))
    );

    // Guaranteed Sanity Altar every 3 rooms distance
    const isAltarRoom = !isSacredTalismanRoom && !isSacredSwordRoom && (roomDistance % 3 === 0);

    if (isSacredTalismanRoom) {
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
    const isSprint = this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.isSprinting;
    const speed = isSprint && this.stamina > 10 ? 3.8 : 2.2;

    if (isSprint && (this.keys['KeyW'] || this.keys['KeyS'] || this.keys['KeyA'] || this.keys['KeyD'] || this.virtualMoveVector.y !== 0)) {
      this.stamina = Math.max(0, this.stamina - delta * 22);
    } else {
      this.stamina = Math.min(100, this.stamina + delta * 15);
    }

    // Direction vector from keyboard + virtual joystick
    const moveX = (this.keys['KeyD'] ? 1 : 0) - (this.keys['KeyA'] ? 1 : 0) + this.virtualMoveVector.x;
    const moveZ = (this.keys['KeyS'] ? 1 : 0) - (this.keys['KeyW'] ? 1 : 0) + this.virtualMoveVector.y;

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

    // Update Flashlight & Lantern positions
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);

    this.flashlight.position.copy(this.playerPos).add(new THREE.Vector3(0, -0.15, 0));
    this.flashlightTarget.position.copy(this.playerPos).add(dir.clone().multiplyScalar(5));

    this.lanternLight.position.copy(this.playerPos).add(new THREE.Vector3(0, -0.2, 0));

    // Move dust particles with player
    if (this.dustParticles) {
      this.dustParticles.position.copy(this.playerPos);
    }
  }

  // Raycast interaction prompt (Optimized to test only adjacent 9 chunks)
  private updateRaycast() {
    this.raycaster.setFromCamera(this.centerScreen, this.camera);

    let closestDist = 3.6; // Max 3.6m interaction distance
    let targetInteractable: ChunkInfo['interactables'][0] | null = null;

    const currentGx = Math.round(this.playerPos.x / this.chunkSize);
    const currentGz = Math.round(this.playerPos.z / this.chunkSize);

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
        this.sanity = Math.min(100, this.sanity + 40);

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
      if (!this.inventory[2].unlocked) {
        this.inventory[2].unlocked = true;
        this.hasSword = true;
        this.setActiveSlot(2);
        mazeAudio.playItemAcquire();
        mazeAudio.playSwordSlash();
        this.sanity = Math.min(100, this.sanity + 40);

        if (this.onHauntedEvent) {
          this.onHauntedEvent({
            id: `sword_acquire_${Date.now()}`,
            type: 'item_acquired',
            message: `[신물 획득] '사인참사검'을 뽑아들었습니다! [방향키/숫자키]로 교체하고 클릭/F로 원혼을 즉각 베어 퇴마할 수 있습니다.`,
            sanityDrain: 0,
          });
        }
        if (this.onInspectCallback) {
          this.onInspectCallback(
            null,
            '사인참사검(四寅斬邪劍) 획득',
            '인년, 인월, 인일, 인시에 벼려진 신성한 보검이 인벤토리에 추가되었습니다. 칼날의 28수 별자리가 빛을 발하며 접근하는 원혼을 즉시 베어 정화합니다.'
          );
        }
        item.description = '(이미 보검대에서 신물을 회수했습니다)';
        this.checkEscapeVictory();
      }
      if (this.onStatsUpdate) this.onStatsUpdate();
      return;
    } else if (item.type === 'altar') {
      mazeAudio.playInspectSound();
      // Restore Sanity to 100% & Battery +50%
      this.sanity = 100;
      this.battery = Math.min(100, this.battery + 50);
      mazeAudio.playShamanBell();
      if (this.onInspectCallback) {
        this.onInspectCallback(
          item.relic || null,
          '사당 제사상 앞의 기도',
          '타오르는 백색 촛불과 은은한 향내 속에서 정신력(SAN 100%)을 완전히 회복하고 회중전등 배터리(+50%)를 충전합니다.'
        );
      }
    } else if (item.relic) {
      mazeAudio.playInspectSound();
      // Collect relic & boost
      const relic = item.relic;
      this.sanity = Math.min(100, this.sanity + 20);
      this.battery = Math.min(100, this.battery + 25);

      if (!this.collectedRelics.some((r) => r.id === relic.id)) {
        this.collectedRelics.push(relic);
        mazeAudio.playShamanBell();

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

    // Arena Atmosphere & Lighting
    this.scene.background = new THREE.Color(0x06050a);
    this.scene.fog = new THREE.FogExp2(0x0d0714, 0.032);
    this.ambientLight.color.setHex(0x5a2d48);
    this.ambientLight.intensity = 1.3;

    // Boss State Initialization (15 Hits required)
    this.bossState = {
      active: true,
      name: '어둑시니',
      maxHp: 15,
      currentHp: 15,
      phase: 1,
      isStaggered: false,
      isEnraged: false,
      attackWarning: null,
      introMessage: '20개의 신성한 유물이 공명하며 어둑시니의 흑야 결계가 열렸습니다! 사인참사검(四寅斬邪劍)으로 어둑시니를 베어내십시오! (총 15격 필요)',
    };

    // Play Boss Intro and Shaman drum BGM
    mazeAudio.playBossIntro();
    mazeAudio.startBossBgm();

    if (this.onHauntedEvent) {
      this.onHauntedEvent({
        id: `boss_spawn_${Date.now()}`,
        type: 'barrier_broken',
        message: '20개의 유물이 공명하여 어둑시니의 흑야 결계가 열렸습니다! 사인참사검으로 어둑시니를 토벌하십시오!',
        sanityDrain: 0,
      });
    }

    if (this.onStatsUpdate) this.onStatsUpdate();
  }

  // Hit Boss with Exorcism Sword (1 HP Damage)
  public hitBossWithSword() {
    if (!this.bossState.active || this.bossState.currentHp <= 0) return;

    this.bossState.currentHp = Math.max(0, this.bossState.currentHp - 1);
    this.bossStaggerTimer = 0.55;
    this.bossState.isStaggered = true;

    // Recoil boss position slightly backwards
    const recoilDir = new THREE.Vector3().subVectors(this.bossPos, this.playerPos).normalize();
    this.bossPos.addScaledVector(recoilDir, 1.2);
    const bDist = Math.hypot(this.bossPos.x, this.bossPos.z);
    if (bDist > 11.5) {
      this.bossPos.normalize().multiplyScalar(11.5);
    }
    if (this.bossMesh) {
      this.bossMesh.position.copy(this.bossPos);
    }

    // Play hit sound with remaining HP voice/sound pitch
    mazeAudio.playBossHit(this.bossState.currentHp);

    // Sanity recovery on hit
    this.sanity = Math.min(100, this.sanity + 10);

    // Check Phase 2 (Enrage) transition at 7 HP
    if (this.bossState.currentHp <= 7 && this.bossState.phase === 1) {
      this.bossState.phase = 2;
      this.bossState.isEnraged = true;
      this.bossAttackTimer = 2.5;
      mazeAudio.playBossRoar();

      if (this.onHauntedEvent) {
        this.onHauntedEvent({
          id: `boss_enraged_${Date.now()}`,
          type: 'shadow_figure',
          message: '[2단계 각성] 어둑시니가 흉폭하게 폭주합니다! 순간이동과 흑야 참격에 주의하십시오!',
          sanityDrain: 5,
        });
      }
    }

    // Check Defeat
    if (this.bossState.currentHp <= 0) {
      this.handleBossDefeat();
    } else {
      if (this.onHauntedEvent) {
        this.onHauntedEvent({
          id: `boss_hit_${Date.now()}`,
          type: 'exorcism_success',
          message: `[사인참사검 명중!] 어둑시니에게 신성한 타격을 입혔습니다! (남은 체력: ${this.bossState.currentHp} / 15)`,
          sanityDrain: 0,
        });
      }
    }

    if (this.onStatsUpdate) this.onStatsUpdate();
  }

  // Hit Boss with Sealing Talisman (Stun + 1 HP Damage)
  public hitBossWithTalisman() {
    if (!this.bossState.active || this.bossState.currentHp <= 0) return;

    this.bossState.currentHp = Math.max(0, this.bossState.currentHp - 1);
    this.bossStaggerTimer = 1.8; // Extended stun from sacred talisman
    this.bossState.isStaggered = true;

    mazeAudio.playBossHit(this.bossState.currentHp);
    this.sanity = Math.min(100, this.sanity + 15);

    if (this.bossState.currentHp <= 7 && this.bossState.phase === 1) {
      this.bossState.phase = 2;
      this.bossState.isEnraged = true;
      mazeAudio.playBossRoar();
    }

    if (this.bossState.currentHp <= 0) {
      this.handleBossDefeat();
    } else {
      if (this.onHauntedEvent) {
        this.onHauntedEvent({
          id: `boss_talisman_${Date.now()}`,
          type: 'exorcism_success',
          message: `[봉인부적 결계 작렬] 어둑시니를 일시 기절시켰습니다! (남은 체력: ${this.bossState.currentHp} / 15)`,
          sanityDrain: 0,
        });
      }
    }

    if (this.onStatsUpdate) this.onStatsUpdate();
  }

  // Boss Defeat & Victory Handler
  public handleBossDefeat() {
    if (this.isEscaped) return;
    this.isEscaped = true;
    this.escapeMethod = 'boss';
    this.bossState.active = false;
    this.bossState.currentHp = 0;
    this.bossState.isStaggered = false;
    this.bossState.attackWarning = null;

    mazeAudio.stopBossBgm();
    mazeAudio.playBossDefeat();

    if (this.bossMesh) {
      this.bossMesh.visible = false;
    }

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

  // Boss AI Update & Animation Loop
  public updateBoss(delta: number) {
    if (!this.isBossFightActive || !this.bossMesh || this.bossState.currentHp <= 0) return;

    this.bossTimer += delta;
    const time = this.bossTimer;

    // Vector from boss to player
    const toPlayer = new THREE.Vector3().subVectors(this.playerPos, this.bossPos);
    toPlayer.y = 0;
    const distToPlayer = toPlayer.length();

    // Look at player smoothly
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

    // Core pulsing animation
    if (coreMesh) {
      const pulse = 1.0 + Math.sin(time * 6.0) * 0.25;
      coreMesh.scale.set(pulse, pulse, pulse);
    }

    // Eye light intensity & enrage flare
    if (eyeLight) {
      eyeLight.intensity = (this.bossState.isEnraged ? 4.5 : 2.5) + Math.sin(time * 8.0) * 0.8;
    }

    // Looming Scale ("더 크게 자라나는 어둑시니")
    const scaleBase = this.bossState.isEnraged ? 1.25 : 1.05;
    const breathe = Math.sin(time * 2.2) * 0.08;
    const finalScale = scaleBase + breathe;
    this.bossMesh.scale.set(finalScale, finalScale, finalScale);

    // Stagger handling
    if (this.bossStaggerTimer > 0) {
      this.bossStaggerTimer -= delta;
      this.bossState.isStaggered = true;
      this.bossMesh.position.y = Math.sin(time * 20) * 0.15;

      if (armL) armL.rotation.x = -0.6 + Math.sin(time * 15) * 0.2;
      if (armR) armR.rotation.x = -0.6 + Math.sin(time * 15) * 0.2;
      if (headGroup) headGroup.rotation.x = -0.3;

      if (this.bossStaggerTimer <= 0) {
        this.bossState.isStaggered = false;
      }
      return;
    }

    this.bossState.isStaggered = false;

    // Hover floating height
    this.bossMesh.position.y = 0.25 + Math.sin(time * 3.0) * 0.2;

    // Boss Phase 2 Teleportation
    if (this.bossState.isEnraged) {
      this.bossTeleportTimer -= delta;
      if (this.bossTeleportTimer <= 0) {
        this.bossTeleportTimer = 7.5;
        // Teleport behind player or flank
        const pAngle = this.playerYaw;
        const offsetDist = 5.0;
        const targetX = this.playerPos.x + Math.sin(pAngle) * offsetDist;
        const targetZ = this.playerPos.z + Math.cos(pAngle) * offsetDist;

        // Keep inside arena 11m
        const clampedDist = Math.hypot(targetX, targetZ);
        if (clampedDist < 11.5) {
          this.bossPos.set(targetX, 0, targetZ);
        } else {
          this.bossPos.set(-targetX * 0.5, 0, -targetZ * 0.5);
        }
        this.bossMesh.position.copy(this.bossPos);

        mazeAudio.playBossRoar();
        mazeAudio.playGhostPresence();

        if (this.onHauntedEvent) {
          this.onHauntedEvent({
            id: `boss_teleport_${Date.now()}`,
            type: 'ghost_whisper',
            message: '[흑무 이동] 어둑시니가 그림자 속으로 숨어들어 뒤편에 출현했습니다!',
            sanityDrain: 3,
          });
        }
      }
    }

    // Movement toward player (Maintain 3.2m distance)
    const moveSpeed = this.bossState.isEnraged ? 2.8 : 1.9;
    if (distToPlayer > 3.4) {
      this.bossPos.x += (toPlayer.x / distToPlayer) * moveSpeed * delta;
      this.bossPos.z += (toPlayer.z / distToPlayer) * moveSpeed * delta;

      // Keep within arena radius 12m
      const bDist = Math.hypot(this.bossPos.x, this.bossPos.z);
      if (bDist > 12.0) {
        this.bossPos.normalize().multiplyScalar(12.0);
      }
      this.bossMesh.position.copy(this.bossPos);
    }

    // Arm idle sway
    if (armL) armL.rotation.x = Math.sin(time * 2.5) * 0.35;
    if (armR) armR.rotation.x = -Math.sin(time * 2.5) * 0.35;

    // Ground Slam Attack Cycle
    this.bossAttackTimer -= delta;

    // Telegraphing warning (1.2s before slam)
    if (this.bossAttackTimer <= 1.2 && this.bossAttackTimer > 0) {
      this.bossState.attackWarning = '어둑시니가 거대한 그림자 강타를 내리치려 합니다! 즉시 물러나세요!';
      // Raise arms high
      if (armL) armL.rotation.x = -1.4 + Math.sin(time * 10) * 0.1;
      if (armR) armR.rotation.x = -1.4 + Math.sin(time * 10) * 0.1;
      if (headGroup) headGroup.rotation.x = 0.3;
    } else if (this.bossAttackTimer <= 0) {
      // Execute Ground Slam
      this.bossAttackTimer = this.bossState.isEnraged ? 3.8 : 5.2;
      this.bossState.attackWarning = null;

      // Arm slam down
      if (armL) armL.rotation.x = 0.8;
      if (armR) armR.rotation.x = 0.8;

      mazeAudio.playBossSlam();

      // Check distance to player for damage
      if (distToPlayer < 5.6) {
        // Player caught in slam shockwave
        this.sanity = Math.max(0, this.sanity - (this.bossState.isEnraged ? 22 : 15));
        mazeAudio.playHeartbeat(150);

        // Push player away
        const pushDir = new THREE.Vector3().subVectors(this.playerPos, this.bossPos).normalize();
        this.playerPos.addScaledVector(pushDir, 2.5);
        this.camera.position.copy(this.playerPos);

        if (this.onHauntedEvent) {
          this.onHauntedEvent({
            id: `boss_slam_hit_${Date.now()}`,
            type: 'screamer',
            message: '[그림자 강타 피격] 어둑시니의 암흑 충격파에 휩쓸렸습니다! (정신력 대폭 감소)',
            sanityDrain: 0,
          });
        }
      }
    } else {
      this.bossState.attackWarning = null;
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

      // Proximity & Behavioral States: Detection radius 7.0 meters
      if (dist < 7.0) {
        const baseSpeed = ghost.speed || 1.20;
        ghost.state = dist < 3.5 ? 'charging' : 'stalking';
        ghost.targetPos.copy(this.playerPos);

        const dir = new THREE.Vector3().subVectors(this.playerPos, ghost.pos);
        dir.y = 0;

        if (dir.length() > 0.1) {
          dir.normalize();

          // Face player smoothly
          const targetAngle = Math.atan2(dir.x, dir.z);
          ghost.mesh.rotation.y = THREE.MathUtils.lerp(ghost.mesh.rotation.y, targetAngle, delta * 4.0);

          // Move towards player with wall sliding collision
          const moveSpeed = ghost.state === 'charging' ? baseSpeed * 1.2 : baseSpeed;
          const targetNextX = ghost.pos.x + dir.x * moveSpeed * delta;
          const targetNextZ = ghost.pos.z + dir.z * moveSpeed * delta;

          const resolved = this.resolveGhostPosition(ghost.pos.x, ghost.pos.z, targetNextX, targetNextZ);
          ghost.pos.x = resolved.x;
          ghost.pos.z = resolved.z;
        }

        // Play presence sound effect and heartbeat
        if (ghost.soundCooldown <= 0 && dist < 6.5) {
          ghost.soundCooldown = 5.0 + Math.random() * 4.0;
          mazeAudio.playGhostPresence();
          mazeAudio.playHeartbeat(130);
        }

        // Close contact scare / Jumpscare attack (within 1.6m)
        if (dist < 1.6 && ghost.attackCooldown <= 0) {
          ghost.attackCooldown = 8.0;
          this.sanity = Math.max(0, this.sanity - 20);
          mazeAudio.playHeartbeat(160);
          mazeAudio.playGhostPresence();

          // Flashlight malfunction
          if (this.lightMode === 'flashlight') {
            this.setLightMode('off');
          }

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

          const ghostName = ghost.name || '원혼';
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
          ghost.wanderTimer = 3.5 + Math.random() * 4.0;
          const testTargetX = ghost.originX + (Math.random() - 0.5) * (this.chunkSize - 2.0);
          const testTargetZ = ghost.originZ + (Math.random() - 0.5) * (this.chunkSize - 2.0);
          const valid = this.resolveGhostPosition(ghost.pos.x, ghost.pos.z, testTargetX, testTargetZ);
          ghost.targetPos.set(valid.x, 0, valid.z);
        }

        const dir = new THREE.Vector3().subVectors(ghost.targetPos, ghost.pos);
        dir.y = 0;
        if (dir.length() > 0.1) {
          dir.normalize();
          const targetAngle = Math.atan2(dir.x, dir.z);
          ghost.mesh.rotation.y = THREE.MathUtils.lerp(ghost.mesh.rotation.y, targetAngle, delta * 3.0);

          const stepSpeed = (ghost.speed || 1.20) * 0.45;
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
    // Battery and light handling (balanced slow drain)
    if (this.lightMode === 'flashlight') {
      this.battery = Math.max(0, this.battery - delta * 0.18);
      if (this.battery <= 0) {
        this.setLightMode('lantern'); // fallback to lantern instead of forced pitch black
      }
    }

    // Sanity drain in pitch dark
    if (this.lightMode === 'off') {
      this.sanity = Math.max(0, this.sanity - delta * 3.0);
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
    mazeAudio.updateSanityHeartbeat(this.sanity, nearestGhostDist < 7.0);

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

  // Toggle Light Modes
  public toggleLight() {
    mazeAudio.playFlashlightClick();
    if (this.lightMode === 'flashlight') {
      this.setLightMode('lantern');
    } else if (this.lightMode === 'lantern') {
      this.setLightMode('off');
    } else {
      this.setLightMode('flashlight');
    }
  }

  public setLightMode(mode: 'flashlight' | 'lantern' | 'off') {
    this.lightMode = mode;
    this.flashlight.visible = mode === 'flashlight';
    this.lanternLight.visible = mode === 'lantern';
    if (this.onStatsUpdate) this.onStatsUpdate();
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
      if (!this.isPointerLocked) {
        this.container.requestPointerLock();
      }
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    this.container.addEventListener('click', () => {
      if (this.isPointerLocked) {
        // If pointing at an inspectable object (Altar, Mask, Relic, Sacred Item), inspect it
        if (this.hoveredInteractable && this.currentRaycastTarget && this.currentRaycastTarget.type !== 'door') {
          this.inspectTarget('click');
        } else {
          // Otherwise, perform action of active inventory item
          this.useActiveItem();
        }
      }
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

    // Arrow Key Inventory Switching (User requested: 인벤토리 칸은 화살표로 바꿀 수 있고)
    if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
      this.selectPrevSlot();
      return;
    }
    if (e.code === 'ArrowRight' || e.code === 'ArrowDown') {
      this.selectNextSlot();
      return;
    }

    // Number keys for direct inventory slot selection
    if (e.code === 'Digit1') {
      this.setActiveSlot(0);
      return;
    }
    if (e.code === 'Digit2') {
      this.setActiveSlot(1);
      return;
    }
    if (e.code === 'Digit3') {
      this.setActiveSlot(2);
      return;
    }

    // Action execution (F key, Space key)
    if (e.code === 'KeyF' || e.code === 'Space') {
      this.useActiveItem();
    } else if (e.code === 'KeyE') {
      this.inspectTarget('keyboard_e');
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

    this.vmFlashlight.visible = isSlot0 && this.lightMode === 'flashlight';
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
      // Exorcism Sword slash swing
      if (this.vmIsAttacking) {
        const progress = 1.0 - Math.max(0, this.vmAttackTimer / 0.35);
        this.vmSword.position.set(
          0.24 - progress * 0.42,
          -0.26 + Math.sin(progress * Math.PI) * 0.16,
          -0.42 - progress * 0.12
        );
        this.vmSword.rotation.set(
          0.35 + progress * 1.2,
          -0.22 - progress * 1.4,
          0.45 - progress * 1.6
        );
      } else {
        this.vmSword.position.set(0.24 + idleSwayX, -0.26 + idleSwayY, -0.42);
        this.vmSword.rotation.set(0.35, -0.22, 0.45);
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

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
