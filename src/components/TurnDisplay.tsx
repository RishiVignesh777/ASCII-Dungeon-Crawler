import React, { useState } from 'react';
import { GameTurn } from '../types/game';
import { formatTurnOutput } from '../game/gameEngine';
import { Copy, Check, Terminal, Compass } from 'lucide-react';

interface TurnDisplayProps {
  turn: GameTurn;
  onActionClick: (action: string) => void;
}

export const TurnDisplay: React.FC<TurnDisplayProps> = ({
  turn,
  onActionClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [rawView, setRawView] = useState(false);

  const handleCopy = () => {
    const text = formatTurnOutput(turn);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono shadow-xl">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-emerald-400 text-sm">
            TURN #{turn.turnNumber}
          </span>
          <span className="text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded flex items-center gap-1">
            <Compass className="w-3 h-3 text-neutral-500" />
            Floor {turn.floor}
          </span>
          {turn.actionTaken && (
            <span className="text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded truncate max-w-[200px]">
              &quot;{turn.actionTaken}&quot;
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRawView(!rawView)}
            className="text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700 bg-neutral-900 px-2.5 py-1 rounded transition-colors"
          >
            {rawView ? 'Formatted Mode' : 'Raw Text Mode'}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-950/20 px-3 py-1 rounded transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Turn!' : 'Copy Turn'}
          </button>
        </div>
      </div>

      {rawView ? (
        <pre className="p-4 bg-black rounded-lg border border-neutral-800 text-xs md:text-sm text-neutral-300 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed select-all">
          {formatTurnOutput(turn)}
        </pre>
      ) : (
        <div className="space-y-4 text-xs md:text-sm">
          {/* 1. MAP DISPLAY */}
          <div>
            <div className="text-emerald-400 font-bold mb-1 tracking-wide">
              1. MAP DISPLAY:
            </div>
            <pre className="p-3 bg-black rounded-lg border border-neutral-800 text-neutral-200 font-mono tracking-widest text-[11px] md:text-xs overflow-x-auto select-all leading-tight">
              {turn.mapAscii}
            </pre>
          </div>

          {/* 2. STATUS & INVENTORY BOARD */}
          <div>
            <div className="text-emerald-400 font-bold mb-1 tracking-wide">
              2. STATUS & INVENTORY BOARD:
            </div>
            <div className="bg-neutral-900/70 rounded-lg p-3 border border-neutral-800 space-y-1 text-neutral-200">
              <div>- Location: [{turn.statusBoard.location}]</div>
              <div>- Stats: {turn.statusBoard.stats}</div>
              <div>- Gear: {turn.statusBoard.gear}</div>
              <div>- Bag: {turn.statusBoard.bag}</div>
            </div>
          </div>

          {/* 3. SCENE & COMBAT LOG */}
          <div>
            <div className="text-emerald-400 font-bold mb-1 tracking-wide">
              3. SCENE & COMBAT LOG:
            </div>
            <div className="bg-neutral-900/70 rounded-lg p-3 border border-neutral-800 text-neutral-300 leading-relaxed italic">
              &quot;{turn.sceneAndCombatLog}&quot;
            </div>
          </div>

          {/* 4. AVAILABLE ACTIONS */}
          <div>
            <div className="text-emerald-400 font-bold mb-1.5 tracking-wide">
              4. AVAILABLE ACTIONS:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {turn.availableActions.map((act, i) => (
                <button
                  key={`${act}-${i}`}
                  type="button"
                  onClick={() => onActionClick(act)}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-neutral-700/80 bg-neutral-900/90 hover:bg-emerald-950/40 hover:border-emerald-500/60 text-neutral-200 hover:text-emerald-300 text-left transition-all group font-mono cursor-pointer"
                >
                  <span className="w-5 h-5 rounded bg-neutral-800 group-hover:bg-emerald-800/80 text-neutral-300 group-hover:text-emerald-200 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-xs md:text-sm font-medium">{act}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
