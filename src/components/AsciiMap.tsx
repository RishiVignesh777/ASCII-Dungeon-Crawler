import React from 'react';

interface AsciiMapProps {
  mapAscii: string;
  theme: 'amber' | 'green' | 'cyan' | 'matrix';
  colorized: boolean;
  onTileClick?: (x: number, y: number) => void;
  playerPos: { x: number; y: number };
}

export const AsciiMap: React.FC<AsciiMapProps> = ({
  mapAscii,
  theme,
  colorized,
  onTileClick,
  playerPos,
}) => {
  const lines = mapAscii.split('\n');

  const getThemeBorder = () => {
    switch (theme) {
      case 'amber':
        return 'border-amber-500/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]';
      case 'cyan':
        return 'border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]';
      case 'matrix':
        return 'border-lime-500/40 text-lime-400 shadow-[0_0_20px_rgba(132,204,22,0.15)]';
      case 'green':
      default:
        return 'border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]';
    }
  };

  const getCharColor = (char: string) => {
    if (!colorized) return '';
    switch (char) {
      case '@':
        return 'text-amber-300 font-extrabold drop-shadow-[0_0_6px_rgba(252,211,77,0.9)] animate-pulse';
      case '#':
        return 'text-neutral-500 select-none';
      case '.':
        return 'text-neutral-600/70 select-none';
      case '~':
        return 'text-orange-500 font-bold drop-shadow-[0_0_4px_rgba(249,115,22,0.8)]';
      case '+':
        return 'text-amber-500 font-bold';
      case '/':
        return 'text-emerald-400 font-bold';
      case '>':
        return 'text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(103,232,249,0.8)]';
      case '$':
        return 'text-yellow-300 font-bold drop-shadow-[0_0_5px_rgba(253,224,71,0.8)]';
      case 'P':
        return 'text-rose-400 font-bold drop-shadow-[0_0_4px_rgba(251,113,133,0.8)]';
      case 'K':
        return 'text-amber-400 font-bold drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]';
      case 'W':
        return 'text-sky-300 font-bold drop-shadow-[0_0_4px_rgba(125,211,252,0.8)]';
      case 'A':
        return 'text-indigo-300 font-bold drop-shadow-[0_0_4px_rgba(165,180,252,0.8)]';
      case '?':
        return 'text-fuchsia-400 font-bold drop-shadow-[0_0_5px_rgba(232,121,249,0.9)]';
      case 'g':
        return 'text-emerald-400 font-semibold';
      case 'S':
        return 'text-neutral-300 font-bold';
      case 'O':
        return 'text-orange-400 font-bold';
      case 'D':
        return 'text-rose-500 font-extrabold drop-shadow-[0_0_8px_rgba(244,63,94,1)] animate-bounce';
      default:
        return '';
    }
  };

  return (
    <div className={`relative rounded-xl border bg-neutral-950/95 p-3.5 font-mono ${getThemeBorder()}`}>
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2 text-xs uppercase tracking-wider font-semibold text-neutral-400">
        <span className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          1. MAP DISPLAY (20x20 GRID)
        </span>
        <span className="text-neutral-500 font-mono text-[11px]">
          POS: ({playerPos.x}, {playerPos.y})
        </span>
      </div>

      {/* 20x20 Grid Display */}
      <div className="flex justify-center items-center py-1 overflow-x-auto">
        <div className="inline-block bg-black p-2 md:p-3 rounded-lg border border-neutral-800/90 shadow-inner font-mono text-xs md:text-sm leading-none tracking-widest select-none">
          {lines.map((line, y) => (
            <div key={y} className="flex whitespace-pre">
              {line.split('').map((char, x) => {
                const isAdjacent =
                  Math.abs(x - playerPos.x) + Math.abs(y - playerPos.y) === 1;

                return (
                  <button
                    key={`${x}-${y}`}
                    type="button"
                    onClick={() => onTileClick && onTileClick(x, y)}
                    title={`(${x}, ${y}): ${char}`}
                    className={`w-4 h-4 md:w-5 md:h-5 flex items-center justify-center transition-colors text-center ${
                      getCharColor(char) || 'text-neutral-300'
                    } ${
                      isAdjacent
                        ? 'hover:bg-neutral-800 hover:ring-1 hover:ring-emerald-400/50 cursor-pointer'
                        : 'cursor-default'
                    }`}
                  >
                    {char}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend Grid */}
      <div className="mt-3 pt-2.5 border-t border-neutral-800/80 grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[11px]">
        <div className="flex items-center gap-1">
          <span className="text-amber-300 font-bold bg-neutral-900 px-1 rounded">@</span>
          <span className="text-neutral-300">Player</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-orange-500 font-bold bg-neutral-900 px-1 rounded">~</span>
          <span className="text-neutral-300">Lava</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-amber-500 font-bold bg-neutral-900 px-1 rounded">+/</span>
          <span className="text-neutral-300">Door</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-cyan-300 font-bold bg-neutral-900 px-1 rounded">&gt;</span>
          <span className="text-neutral-300">Stairs</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-300 font-bold bg-neutral-900 px-1 rounded">$</span>
          <span className="text-neutral-300">Gold</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-rose-400 font-bold bg-neutral-900 px-1 rounded">P</span>
          <span className="text-neutral-300">Potion</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-amber-400 font-bold bg-neutral-900 px-1 rounded">K</span>
          <span className="text-neutral-300">Key</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sky-300 font-bold bg-neutral-900 px-1 rounded">W</span>
          <span className="text-neutral-300">Weapon</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-indigo-300 font-bold bg-neutral-900 px-1 rounded">A</span>
          <span className="text-neutral-300">Armor</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-fuchsia-400 font-bold bg-neutral-900 px-1 rounded">?</span>
          <span className="text-neutral-300">Shrine</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-emerald-400 font-bold bg-neutral-900 px-1 rounded">g/S</span>
          <span className="text-neutral-300">Gob/Skel</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-rose-500 font-bold bg-neutral-900 px-1 rounded">O/D</span>
          <span className="text-neutral-300">Orc/Dragon</span>
        </div>
      </div>
    </div>
  );
};
