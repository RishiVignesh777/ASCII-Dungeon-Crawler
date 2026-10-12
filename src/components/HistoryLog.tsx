import React from 'react';
import { GameTurn } from '../types/game';
import { History, Copy, Check } from 'lucide-react';
import { formatTurnAsMarkdown } from '../game/gameEngine';

interface HistoryLogProps {
  turns: GameTurn[];
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ turns }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (turn: GameTurn, idx: number) => {
    const text = formatTurnAsMarkdown(turn);
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 font-mono">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3 text-xs tracking-wider uppercase font-semibold text-neutral-400">
        <span className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-neutral-400" />
          CHRONICLE LOG ({turns.length} TURNS)
        </span>
        <span className="text-[11px] text-neutral-500">PAST ACTIONS</span>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {turns
          .slice()
          .reverse()
          .map((turn, i) => {
            const actualIndex = turns.length - 1 - i;
            return (
              <div
                key={turn.turnNumber}
                className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800/80 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">
                      Turn #{turn.turnNumber}
                    </span>
                    {turn.actionTaken && (
                      <span className="text-neutral-400 bg-neutral-800/80 px-1.5 py-0.5 rounded text-[10px]">
                        Action: {turn.actionTaken}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(turn, actualIndex)}
                    className="text-neutral-400 hover:text-emerald-400 text-[10px] flex items-center gap-1 border border-neutral-800 px-1.5 py-0.5 rounded hover:border-neutral-700"
                  >
                    {copiedIndex === actualIndex ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-neutral-300 italic text-[11px] leading-relaxed line-clamp-2">
                  &quot;{turn.sceneDescription}&quot;
                </p>
                {turn.combatEvent && (
                  <p className="text-amber-300/90 text-[11px]">
                    ⚔️ {turn.combatEvent}
                  </p>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
