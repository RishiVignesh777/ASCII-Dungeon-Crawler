export type TileType =
  | '#'
  | '.'
  | '~'
  | '+'
  | '/'
  | '>'
  | '$'
  | 'P'
  | 'K'
  | 'W'
  | 'A'
  | '?'
  | 'g'
  | 'S'
  | 'O'
  | 'D'
  | '@';

export type MonsterType = 'g' | 'S' | 'O' | 'D';

export interface Monster {
  id: string;
  name: string;
  type: MonsterType;
  symbol: MonsterType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  exp: number;
  gold: number;
  alive: boolean;
  flavor: string;
}

export interface GroundItem {
  id: string;
  x: number;
  y: number;
  type: '$' | 'P' | 'K' | 'W' | 'A' | '?';
  name: string;
  value?: number; // gold amount, heal amount, bonus
  weaponData?: { name: string; damage: number };
  armorData?: { name: string; defense: number };
  description: string;
}

export interface Door {
  id: string;
  x: number;
  y: number;
  isOpen: boolean; // if true, '/' else '+'
  requiresKey: boolean;
  name: string;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  level: number;
  exp: number;
  maxExp: number;
  weapon: {
    name: string;
    damage: number;
  };
  armor: {
    name: string;
    defense: number;
  };
  gold: number;
  keys: number;
  potions: number;
  keyItems: string[];
}

export interface GameTurn {
  turnNumber: number;
  floor: number;
  mapAscii: string; // 20x20
  statusBoard: {
    location: string;
    stats: string;
    gear: string;
    bag: string;
    // Raw numeric values for rich UI rendering
    raw: {
      hp: number;
      maxHp: number;
      mp: number;
      maxMp: number;
      level: number;
      exp: number;
      maxExp: number;
      weapon: { name: string; damage: number };
      armor: { name: string; defense: number };
      gold: number;
      keys: number;
      potions: number;
      keyItems: string[];
    };
  };
  sceneAndCombatLog: string;
  availableActions: string[];
  actionTaken?: string;
  timestamp: number;
}

export interface FloorData {
  floorNumber: number;
  name: string;
  themeDescription: string;
  baseGrid: string[]; // 20 rows of length 20
  playerStart: { x: number; y: number };
  stairsPos: { x: number; y: number };
  monsters: Monster[];
  items: GroundItem[];
  doors: Door[];
}
