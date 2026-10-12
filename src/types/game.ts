export type TileType = '#' | '.' | '+' | '$' | 'M' | '^' | '@';

export interface Monster {
  id: string;
  name: string;
  symbol: 'M';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  xp: number;
  gold: number;
  alive: boolean;
  flavor: string;
}

export interface Chest {
  id: string;
  x: number;
  y: number;
  opened: boolean;
  gold: number;
  item?: string;
  weapon?: {
    name: string;
    atk: number;
  };
  description: string;
}

export interface Trap {
  id: string;
  x: number;
  y: number;
  name: string;
  damage: number;
  disarmed: boolean;
  triggered: boolean;
}

export interface Door {
  id: string;
  x: number;
  y: number;
  locked: boolean;
  keyRequired?: string;
  name: string;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  gold: number;
  weapon: {
    name: string;
    atkBonus: number;
  };
  inventory: string[];
}

export interface GameTurn {
  turnNumber: number;
  mapAscii: string;
  statusBoard: {
    hp: string;
    gold: number;
    weapon: string;
    inventory: string[];
  };
  sceneDescription: string;
  actions: string[];
  combatEvent?: string;
  actionTaken?: string;
  timestamp: number;
}

export interface DungeonLevel {
  id: number;
  title: string;
  startDescription: string;
  baseGrid: string[]; // 12 strings of length 12
  playerStart: { x: number; y: number };
  exitPos?: { x: number; y: number };
  monsters: Monster[];
  chests: Chest[];
  traps: Trap[];
  doors: Door[];
}
