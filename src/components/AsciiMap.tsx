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

  // Theme styling for terminal background and text
  const getThemeClass = () => {
    switch (theme) {
      case 'amber':
        return 'text-amber-400 border-amber-500/30 shadow-[0_0_25px_rgba(251,191,36,0.15)]';
      case 'cyan':
        return 'text-cyan-400 border-cyan-500/30 shadow-[0_0_25px_rgba(34,211,238,0.15)]';
      case 'matrix':
        return 'text-lime-400 border-lime-500/30 shadow-[0_0_25px_rgba(163,230,53,0.15)]';
      case 'green':
      default:
        return 'text-emerald-400 border-emerald-500/30 shadow-[0_0_25px_rgba(52,211,153,0.15)]';
    }
  };

  const getCharStyle = (char: string) => {
    if (!colorized) return '';
    switch (char) {
      case '@':
        return 'text-amber-300 font-bold animate-pulse drop-shadow-[0_0_6px_rgba(252,211,77,0.8)]';
      case 'M':
        return 'text-rose-400 font-bold drop-shadow-[0_0_6px_rgba(251,113,133,0.8)]';
      case '$':
        return 'text-yellow-300 font-bold drop-shadow-[0_0_6px_rgba(253,224,71,0.8)]';
      case '^':
        return 'text-purple-400 font-semibold drop-shadow-[0_0_4px_rgba(192,132,252,0.8)]';
      case '+':
        return 'text-orange-400 font-semibold';
      case '#':
        return 'text-neutral-500 select-none';
      case '.':
        return 'text-neutral-600/70 select-none';
      default:
        return '';
    }
  };

  return (
    <div className={`relative rounded-xl border bg-neutral-950/90 p-4 font-mono transition-all duration-300 ${getThemeClass()}`}>
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3 text-xs tracking-wider uppercase font-semibold text-neutral-400">
        <span className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          1. MAP DISPLAY (12x12 GRID)
        </span>
        <span className="font-mono text-neutral-500">
          POS: ({playerPos.x}, {playerPos.y})
        </span>
      </div>

      {/* 12x12 Grid Container */}
      <div className="flex justify-center items-center py-2">
        <div className="inline-block bg-black/80 p-3 rounded-lg border border-neutral-800/80 shadow-inner font-mono text-base md:text-lg leading-none select-none tracking-widest">
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
                    title={`Coordinate: (${x}, ${y}) - Symbol: ${char}`}
                    className={`w-6 h-6 flex items-center justify-center transition-colors text-center ${
                      getCharStyle(char) || 'hover:bg-neutral-800/60'
                    } ${isAdjacent ? 'hover:ring-1 hover:ring-emerald-400/50 cursor-pointer' : 'cursor-default'}`}
                  >
                    {char}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-neutral-800/70 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-amber-300 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">@</span>
          <span className="text-neutral-300">Player</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">#</span>
          <span className="text-neutral-400">Wall / Barrier</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">.</span>
          <span className="text-neutral-400">Floor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-orange-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">+</span>
          <span className="text-neutral-300">Door</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-yellow-300 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">$</span>
          <span className="text-neutral-300">Treasure / Loot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-rose-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">M</span>
          <span className="text-neutral-300">Monster</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-purple-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">^</span>
          <span className="text-neutral-300">Trap</span>
        </div>
      </div>
    </div>
  );
};
