import React from 'react';
import { Heart, Sparkles, Shield, Sword, Coins, Key, Flame } from 'lucide-react';

interface StatusBoardProps {
  location: string;
  statsText: string;
  gearText: string;
  bagText: string;
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
  onUsePotion?: () => void;
}

export const StatusBoard: React.FC<StatusBoardProps> = ({
  location,
  statsText,
  gearText,
  bagText,
  raw,
  onUsePotion,
}) => {
  const hpRatio = raw.maxHp > 0 ? Math.max(0, Math.min(100, (raw.hp / raw.maxHp) * 100)) : 0;
  const mpRatio = raw.maxMp > 0 ? Math.max(0, Math.min(100, (raw.mp / raw.maxMp) * 100)) : 0;
  const expRatio = raw.maxExp > 0 ? Math.max(0, Math.min(100, (raw.exp / raw.maxExp) * 100)) : 0;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/90 p-4 font-mono shadow-md">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3 text-xs tracking-wider uppercase font-semibold text-neutral-400">
        <span className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          2. STATUS & INVENTORY BOARD
        </span>
        <span className="text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded text-[11px]">
          {location}
        </span>
      </div>

      {/* Structured Text representation */}
      <div className="bg-black/70 rounded-lg p-3 border border-neutral-800/80 text-xs text-neutral-300 space-y-1 mb-3">
        <div>
          <span className="text-neutral-400">- Location:</span> [{location}]
        </div>
        <div>
          <span className="text-neutral-400">- Stats:</span> {statsText}
        </div>
        <div>
          <span className="text-neutral-400">- Gear:</span> {gearText}
        </div>
        <div>
          <span className="text-neutral-400">- Bag:</span> {bagText}
        </div>
      </div>

      {/* Visual Status Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {/* HP Meter */}
        <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-rose-400 font-semibold">
              <Heart className="w-3.5 h-3.5 fill-rose-500/20" /> HP
            </span>
            <span className="text-rose-300 font-bold">
              {raw.hp}/{raw.maxHp}
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                hpRatio > 40 ? 'bg-rose-500' : 'bg-red-600 animate-pulse'
              }`}
              style={{ width: `${hpRatio}%` }}
            />
          </div>
        </div>

        {/* MP Meter */}
        <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-sky-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> MP
            </span>
            <span className="text-sky-300 font-bold">
              {raw.mp}/{raw.maxMp}
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{ width: `${mpRatio}%` }}
            />
          </div>
        </div>

        {/* EXP Meter */}
        <div className="bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Flame className="w-3.5 h-3.5" /> Lvl {raw.level}
            </span>
            <span className="text-amber-300 font-bold">
              {raw.exp}/{raw.maxExp} XP
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${expRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Bag / Gear Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-neutral-800/80 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-yellow-400">
            <Coins className="w-3.5 h-3.5" /> {raw.gold} Gold
          </span>
          <span className="flex items-center gap-1 text-amber-300">
            <Key className="w-3.5 h-3.5" /> {raw.keys} Keys
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <Sword className="w-3.5 h-3.5" /> +{raw.weapon.damage} ATK
          </span>
          <span className="flex items-center gap-1 text-indigo-400">
            <Shield className="w-3.5 h-3.5" /> +{raw.armor.defense} DEF
          </span>
        </div>

        {raw.potions > 0 && onUsePotion && (
          <button
            type="button"
            onClick={onUsePotion}
            className="flex items-center gap-1 text-xs px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/60 text-rose-300 rounded transition-colors cursor-pointer"
          >
            🧪 Drink Potion ({raw.potions})
          </button>
        )}
      </div>
    </div>
  );
};
