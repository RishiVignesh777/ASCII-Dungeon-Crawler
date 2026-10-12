import React from 'react';
import { Heart, Coins, Sword, Backpack } from 'lucide-react';

interface StatusBoardProps {
  hpText: string;
  gold: number;
  weapon: string;
  inventory: string[];
  onUseItem?: (item: string) => void;
}

export const StatusBoard: React.FC<StatusBoardProps> = ({
  hpText,
  gold,
  weapon,
  inventory,
  onUseItem,
}) => {
  // Parse HP e.g. "20/24"
  const [currentHp, maxHp] = hpText.split('/').map(Number);
  const hpRatio = maxHp > 0 ? Math.max(0, Math.min(100, (currentHp / maxHp) * 100)) : 0;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 font-mono shadow-md backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3 text-xs tracking-wider uppercase font-semibold text-neutral-400">
        <span className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          2. STATUS BOARD
        </span>
        <span className="text-neutral-500 font-mono text-[11px]">ACTIVE STATS</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* HP */}
        <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/30" />
              Player HP
            </span>
            <span className="font-bold text-rose-300 text-sm">
              [{hpText}]
            </span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden border border-neutral-700/50">
            <div
              className={`h-full transition-all duration-300 ${
                hpRatio > 50
                  ? 'bg-rose-500'
                  : hpRatio > 25
                  ? 'bg-amber-500'
                  : 'bg-red-600 animate-pulse'
              }`}
              style={{ width: `${hpRatio}%` }}
            />
          </div>
        </div>

        {/* Gold */}
        <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Coins className="w-4 h-4 text-yellow-400" />
              Gold
            </span>
            <span className="font-bold text-yellow-300 text-sm">
              [{gold}]
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Dungeon coin pouch</p>
        </div>

        {/* Weapon */}
        <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Sword className="w-4 h-4 text-cyan-400" />
              Weapon
            </span>
            <span className="font-semibold text-cyan-300 text-xs text-right truncate max-w-[160px]" title={weapon}>
              [{weapon}]
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Equipped armament</p>
        </div>

        {/* Inventory */}
        <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Backpack className="w-4 h-4 text-emerald-400" />
              Inventory
            </span>
            <span className="text-[11px] text-neutral-500">
              {inventory.length} item{inventory.length === 1 ? '' : 's'}
            </span>
          </div>
          {inventory.length === 0 ? (
            <span className="text-xs text-neutral-600 italic">[Empty]</span>
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-1 max-h-16 overflow-y-auto pr-1">
              {inventory.map((item, idx) => {
                const isPotion = item.toLowerCase().includes('potion');
                return (
                  <button
                    key={`${item}-${idx}`}
                    type="button"
                    onClick={() => isPotion && onUseItem && onUseItem(item)}
                    title={isPotion ? 'Click to drink' : item}
                    className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                      isPotion
                        ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/60 cursor-pointer'
                        : 'bg-neutral-800/60 border-neutral-700/60 text-neutral-300 cursor-default'
                    }`}
                  >
                    {item} {isPotion && '🧪'}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
