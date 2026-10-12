/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import {
  createInitialGameState,
  executeTurnAction,
  GameState,
  formatTurnOutput,
} from './game/gameEngine';
import { AsciiMap } from './components/AsciiMap';
import { StatusBoard } from './components/StatusBoard';
import { TurnDisplay } from './components/TurnDisplay';
import { ControlsPanel } from './components/ControlsPanel';
import { HistoryLog } from './components/HistoryLog';
import { soundFx } from './audio/soundFx';
import {
  Skull,
  Trophy,
  HelpCircle,
  Share2,
  Check,
  Compass,
  Scroll,
} from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());
  const [theme, setTheme] = useState<'green' | 'amber' | 'cyan' | 'matrix'>('green');
  const [colorized, setColorized] = useState(true);
  const [copiedLatest, setCopiedLatest] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const latestTurn = gameState.turns[gameState.turns.length - 1];

  // Action dispatcher
  const handleExecuteAction = useCallback((actionText: string) => {
    setGameState((prev) => {
      const { newState, soundType } = executeTurnAction(prev, actionText);
      if (soundType && soundFx[soundType]) {
        soundFx[soundType]();
      }
      return newState;
    });
  }, []);

  // Adjacent tile click movement
  const handleTileClick = useCallback(
    (x: number, y: number) => {
      const px = gameState.playerPos.x;
      const py = gameState.playerPos.y;
      const dx = x - px;
      const dy = y - py;

      if (Math.abs(dx) + Math.abs(dy) === 1) {
        if (dx === 1) handleExecuteAction('East');
        else if (dx === -1) handleExecuteAction('West');
        else if (dy === 1) handleExecuteAction('South');
        else if (dy === -1) handleExecuteAction('North');
      }
    },
    [gameState.playerPos, handleExecuteAction]
  );

  // Reset Game
  const handleReset = useCallback(() => {
    soundFx.step();
    setGameState(createInitialGameState());
  }, []);

  // Use Potion shortcut
  const handleUsePotion = useCallback(() => {
    handleExecuteAction('Use Health/Mana Potion');
  }, [handleExecuteAction]);

  // Copy current GM turn for Chat
  const handleCopyCurrentTurn = useCallback(() => {
    if (!latestTurn) return;
    const text = formatTurnOutput(latestTurn);
    navigator.clipboard.writeText(text);
    setCopiedLatest(true);
    setTimeout(() => setCopiedLatest(false), 2000);
  }, [latestTurn]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-mono selection:bg-emerald-500/30">
      {/* Top Header */}
      <header className="border-b border-neutral-800 bg-black/90 backdrop-blur sticky top-0 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-lg shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              @
            </div>
            <div>
              <h1 className="text-sm md:text-base font-bold text-neutral-100 tracking-wider flex items-center gap-2">
                ADVANCED ASCII RPG
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded font-mono font-medium">
                  20x20 GM ENGINE
                </span>
              </h1>
              <p className="text-xs text-neutral-400 flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-neutral-500" />
                <span>{gameState.floorData.name}</span>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-400">Turn #{gameState.turnCount}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCurrentTurn}
              className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-emerald-300 bg-neutral-900 border border-neutral-700/80 hover:border-emerald-500 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
              title="Copy the current 4-section GM turn text in Markdown to paste into chat"
            >
              {copiedLatest ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{copiedLatest ? 'Copied GM Output!' : 'Copy Turn (Chat)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Help & Legend Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 20x20 Map & Status Board */}
        <section className="lg:col-span-6 space-y-6">
          <AsciiMap
            mapAscii={latestTurn.mapAscii}
            theme={theme}
            colorized={colorized}
            onTileClick={handleTileClick}
            playerPos={gameState.playerPos}
          />

          <StatusBoard
            location={latestTurn.statusBoard.location}
            statsText={latestTurn.statusBoard.stats}
            gearText={latestTurn.statusBoard.gear}
            bagText={latestTurn.statusBoard.bag}
            raw={latestTurn.statusBoard.raw}
            onUsePotion={handleUsePotion}
          />
        </section>

        {/* Right Column: GM Turn Display & Interactive Controls */}
        <section className="lg:col-span-6 space-y-6">
          <TurnDisplay
            turn={latestTurn}
            onActionClick={handleExecuteAction}
          />

          <ControlsPanel
            currentActions={latestTurn.availableActions}
            onExecuteAction={handleExecuteAction}
            onReset={handleReset}
            theme={theme}
            onThemeChange={setTheme}
            colorized={colorized}
            onToggleColorized={() => setColorized(!colorized)}
          />

          <HistoryLog turns={gameState.turns} />
        </section>
      </main>

      {/* Game Over Modal */}
      {gameState.gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-rose-600/50 rounded-2xl max-w-md w-full p-6 text-center shadow-[0_0_50px_rgba(225,29,72,0.3)]">
            <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-500/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <Skull className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-rose-400 mb-2 font-mono">
              YOU HAVE PERISHED
            </h2>
            <p className="text-xs text-neutral-300 mb-6 leading-relaxed">
              The darkness of {gameState.floorData.name} claims your soul.
            </p>
            <div className="bg-black/80 rounded-xl p-4 border border-neutral-800 text-xs font-mono mb-6 space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-neutral-400">Depth Reached:</span>
                <span className="text-neutral-200">Floor {gameState.floorData.floorNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Hero Level:</span>
                <span className="text-neutral-200">Level {gameState.playerStats.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Gold Plundered:</span>
                <span className="text-yellow-400 font-bold">{gameState.playerStats.gold}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-950"
            >
              Awaken on Floor 1 Again
            </button>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {gameState.gameWon && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/50 rounded-2xl max-w-md w-full p-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.3)]">
            <div className="w-16 h-16 rounded-full bg-amber-950/80 border border-amber-500/50 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-amber-400 mb-2 font-mono">
              THE DRAGON IS SLAIN!
            </h2>
            <p className="text-xs text-neutral-300 mb-6 leading-relaxed">
              You defeated the infernal horrors and claimed the grand dungeon treasure!
            </p>
            <div className="bg-black/80 rounded-xl p-4 border border-neutral-800 text-xs font-mono mb-6 space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-neutral-400">Final Level:</span>
                <span className="text-neutral-200">Level {gameState.playerStats.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Gold Plundered:</span>
                <span className="text-yellow-400 font-bold">{gameState.playerStats.gold}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Legendary Weapon:</span>
                <span className="text-cyan-300">{gameState.playerStats.weapon.name}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-950"
            >
              Begin New Delve
            </button>
          </div>
        </div>
      )}

      {/* Guide & Legend Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h3 className="font-bold text-neutral-100 flex items-center gap-2">
                <Scroll className="w-4 h-4 text-emerald-400" />
                DUNGEON RULES & 20x20 LEGEND
              </h3>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-neutral-300 leading-relaxed max-h-96 overflow-y-auto pr-1">
              <div>
                <strong className="text-emerald-400 block mb-1">
                  Output Structure (4 Sections Every Turn):
                </strong>
                <ol className="list-decimal list-inside space-y-1 text-neutral-400">
                  <li><strong>MAP DISPLAY</strong>: Complete 20x20 top-down ASCII grid.</li>
                  <li><strong>STATUS & INVENTORY BOARD</strong>: Location, Stats (HP/MP/EXP), Gear, Bag.</li>
                  <li><strong>SCENE & COMBAT LOG</strong>: 2–3 descriptive sentences.</li>
                  <li><strong>AVAILABLE ACTIONS</strong>: 4–5 specific action choices.</li>
                </ol>
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <strong className="text-emerald-400 block mb-1">Complete 20x20 Legend:</strong>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div><span className="text-amber-300 font-bold">@</span> : Player Hero</div>
                  <div><span className="text-neutral-400 font-bold">#</span> : Solid Wall</div>
                  <div><span className="text-neutral-500 font-bold">.</span> : Open Floor</div>
                  <div><span className="text-orange-500 font-bold">~</span> : Lava Hazard (-5 HP)</div>
                  <div><span className="text-amber-500 font-bold">+</span> : Closed Door (Locked)</div>
                  <div><span className="text-emerald-400 font-bold">/</span> : Open Door</div>
                  <div><span className="text-cyan-300 font-bold">&gt;</span> : Stairs Down (Next Floor)</div>
                  <div><span className="text-yellow-300 font-bold">$</span> : Gold / Treasure</div>
                  <div><span className="text-rose-400 font-bold">P</span> : Health/Mana Potion</div>
                  <div><span className="text-amber-400 font-bold">K</span> : Door Key</div>
                  <div><span className="text-sky-300 font-bold">W</span> : Weapon Upgrade</div>
                  <div><span className="text-indigo-300 font-bold">A</span> : Armor Upgrade</div>
                  <div><span className="text-fuchsia-400 font-bold">?</span> : Mysterious Shrine</div>
                  <div><span className="text-emerald-400 font-bold">g</span> : Goblin (Fast, low HP)</div>
                  <div><span className="text-neutral-300 font-bold">S</span> : Skeleton (Medium HP)</div>
                  <div><span className="text-orange-400 font-bold">O</span> : Orc (High HP, heavy hits)</div>
                  <div><span className="text-rose-500 font-bold">D</span> : Boss Dragon (Deep Guardian)</div>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <strong className="text-emerald-400 block mb-1">Controls:</strong>
                <p className="text-neutral-400">
                  - Keyboard: WASD / Arrow Keys to move, Keys [1] through [5] for actions.<br />
                  - Adjacent tiles can be clicked directly.<br />
                  - Type any command into the prompt (e.g. &quot;attack goblin&quot;, &quot;unlock door&quot;, &quot;descend stairs&quot;).
                </p>
              </div>
            </div>
            <div className="mt-6 pt-3 border-t border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded-lg text-xs font-bold"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
