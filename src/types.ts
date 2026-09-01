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

export interface EscapeVictoryData {
  method: 'relics' | 'kills';
  exorcisedCount: number;
  depthMeters: number;
  roomsExplored: number;
  relicsCount: number;
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
}

export interface MazeChunkCoordinate {
  gx: number;
  gz: number;
}

