export type InventoryItemId = 'flashlight' | 'sealing_talisman' | 'exorcism_sword';

export interface InventorySlotItem {
  id: InventoryItemId;
  name: string;
  category?: 'tool' | 'talisman' | 'weapon';
  icon?: 'flashlight' | 'scroll' | 'sword';
  iconType?: string;
  description: string;
  actionPrompt?: string;
  unlocked: boolean;
}

export type InventoryItem = InventorySlotItem;

export interface RelicItem {
  id: string;
  name: string;
  category: 'talisman' | 'document' | 'curio' | 'key' | 'ritual';
  description: string;
  lore: string;
  iconName: string;
  collectedAtDepth: number;
}

export interface HauntedEvent {
  id: string;
  type: 'ghost_whisper' | 'flicker' | 'door_creak' | 'talisman_burn' | 'shadow_figure' | 'mask_weep' | 'exorcism_success' | 'item_acquired' | 'barrier_broken';
  message: string;
  sanityDrain: number;
}

export interface BossState {
  active: boolean;
  name: string;
  maxHp: number; // 15
  currentHp: number; // 0 ~ 15
  phase: number; // 1 | 2
  isStaggered: boolean;
  isEnraged: boolean;
  attackWarning?: string | null;
  introMessage?: string;
}

export interface EscapeVictoryData {
  method: 'boss' | 'relics' | 'kills';
  exorcisedCount: number;
  depthMeters: number;
  roomsExplored: number;
  relicsCount: number;
  bossDefeated?: boolean;
}

export interface PlayerStats {
  sanity: number; // 0 ~ 100
  stamina: number; // 0 ~ 100
  battery: number; // 0 ~ 100
  lightMode: 'flashlight' | 'lantern' | 'off';
  depthMeters: number;
  roomsExplored: number;
  relics: RelicItem[];
  isSprinting: boolean;
  isInspecting: boolean;
  inventory: InventorySlotItem[];
  activeSlotIndex: number;
  exorcisedGhostCount: number;
  bossState?: BossState | null;
}

export interface MazeChunkCoordinate {
  gx: number;
  gz: number;
}

