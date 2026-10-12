import React, { useState } from 'react';
import { GameTurn } from '../types/game';
import { formatTurnAsMarkdown } from '../game/gameEngine';
import { Copy, Check, Terminal, Sparkles } from 'lucide-react';

interface TurnDisplayProps {
  turn: GameTurn;
  onActionClick: (action: string) => void;
  showRawMarkdownToggle?: boolean;
}

export const TurnDisplay: React.FC<TurnDisplayProps> = ({
  turn,
  onActionClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [rawView, setRawView] = useState(false);

  const handleCopy = () => {
    const text = formatTurnAsMarkdown(turn);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono shadow-xl">
      {/* Top bar with Turn and Copy */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-emerald-400 text-sm">
            TURN #{turn.turnNumber}
          </span>
          {turn.actionTaken && (
            <span className="text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
              Input: &quot;{turn.actionTaken}&quot;
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRawView(!rawView)}
            className="text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700 bg-neutral-900 px-2 py-1 rounded transition-colors"
          >
            {rawView ? 'Formatted View' : 'Raw Text View'}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-950/20 px-2.5 py-1 rounded transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Turn!' : 'Copy Turn'}
          </button>
        </div>
      </div>

      {rawView ? (
        <pre className="p-4 bg-black rounded-lg border border-neutral-800 text-xs md:text-sm text-neutral-300 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed select-all">
          {formatTurnAsMarkdown(turn)}
        </pre>
      ) : (
        <div className="space-y-4 text-xs md:text-sm">
          {/* Section 1 */}
          <div>
            <div className="text-emerald-400 font-bold mb-1 tracking-wide">
              1. MAP DISPLAY:
            </div>
            <pre className="p-3 bg-black/90 rounded-lg border border-neutral-800/90 text-neutral-200 font-mono tracking-widest text-xs md:text-sm overflow-x-auto select-all leading-snug">
              {turn.mapAscii}
            </pre>
          </div>

          {/* Section 2 */}
          <div>
            <div className="text-emerald-400 font-bold mb-1 tracking-wide">
              2. STATUS BOARD:
            </div>
            <div className="bg-neutral-900/60 rounded-lg p-3 border border-neutral-800 space-y-1 text-neutral-200">
              <div>- Player HP: [{turn.statusBoard.hp}]</div>
              <div>- Gold: [{turn.statusBoard.gold}]</div>
              <div>- Weapon: [{turn.statusBoard.weapon}]</div>
              <div>
                - Inventory: [
                {turn.statusBoard.inventory.length > 0
                  ? turn.statusBoard.inventory.join(', ')
                  : 'Empty'}
                ]
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <div className="text-emerald-400 font-bold mb-1 tracking-wide">
              3. SCENE DESCRIPTION:
            </div>
            <div className="bg-neutral-900/60 rounded-lg p-3 border border-neutral-800 text-neutral-300 leading-relaxed italic">
              &quot;{turn.sceneDescription}&quot;
            </div>
            {turn.combatEvent && (
              <div className="mt-2 text-xs text-amber-300 bg-amber-950/30 border border-amber-800/40 p-2 rounded flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{turn.combatEvent}</span>
              </div>
            )}
          </div>

          {/* Section 4 */}
          <div>
            <div className="text-emerald-400 font-bold mb-1.5 tracking-wide">
              4. ACTIONS:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {turn.actions.map((act, i) => (
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
