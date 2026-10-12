import React, { useState, useEffect } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Palette,
} from 'lucide-react';
import { soundFx } from '../audio/soundFx';

interface ControlsPanelProps {
  currentActions: string[];
  onExecuteAction: (action: string) => void;
  onReset: () => void;
  theme: 'green' | 'amber' | 'cyan' | 'matrix';
  onThemeChange: (theme: 'green' | 'amber' | 'cyan' | 'matrix') => void;
  colorized: boolean;
  onToggleColorized: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  currentActions,
  onExecuteAction,
  onReset,
  theme,
  onThemeChange,
  colorized,
  onToggleColorized,
}) => {
  const [inputText, setInputText] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(soundFx.enabled);

  const toggleSound = () => {
    soundFx.enabled = !soundFx.enabled;
    setSoundEnabled(soundFx.enabled);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Check if numeric input 1..5
    const num = parseInt(inputText.trim(), 10);
    if (!isNaN(num) && num >= 1 && num <= currentActions.length) {
      onExecuteAction(currentActions[num - 1]);
    } else {
      onExecuteAction(inputText.trim());
    }
    setInputText('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          onExecuteAction('North');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          onExecuteAction('South');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onExecuteAction('West');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onExecuteAction('East');
          break;
        case '1':
          if (currentActions[0]) {
            e.preventDefault();
            onExecuteAction(currentActions[0]);
          }
          break;
        case '2':
          if (currentActions[1]) {
            e.preventDefault();
            onExecuteAction(currentActions[1]);
          }
          break;
        case '3':
          if (currentActions[2]) {
            e.preventDefault();
            onExecuteAction(currentActions[2]);
          }
          break;
        case '4':
          if (currentActions[3]) {
            e.preventDefault();
            onExecuteAction(currentActions[3]);
          }
          break;
        case '5':
          if (currentActions[4]) {
            e.preventDefault();
            onExecuteAction(currentActions[4]);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentActions, onExecuteAction]);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/90 p-4 font-mono shadow-md">
      {/* Top action header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3 text-xs tracking-wider uppercase font-semibold text-neutral-400">
        <span className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          COMMAND CONSOLE & CONTROLS
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleSound}
            title={soundEnabled ? 'Mute 8-bit sound' : 'Enable 8-bit sound'}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-500" />}
          </button>
          <button
            type="button"
            onClick={onToggleColorized}
            title={colorized ? 'Switch to pure monochrome CRT' : 'Switch to colorized symbols'}
            className="text-[11px] px-1.5 py-0.5 rounded border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200"
          >
            {colorized ? 'Color' : 'Mono'}
          </button>
          <button
            type="button"
            onClick={onReset}
            title="Restart adventure on Floor 1"
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Action Buttons (4 to 5 options) */}
      <div className="space-y-1.5 mb-4">
        <div className="text-[11px] text-neutral-400 uppercase font-semibold flex items-center justify-between">
          <span>Available Actions for Turn:</span>
          <span className="text-neutral-500 text-[10px]">Hotkeys [1-{currentActions.length}]</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {currentActions.map((action, idx) => (
            <button
              key={`${action}-${idx}`}
              type="button"
              onClick={() => onExecuteAction(action)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-700/80 bg-neutral-900 hover:bg-neutral-800 hover:border-emerald-500 text-xs text-neutral-200 hover:text-emerald-300 transition-all font-mono text-left cursor-pointer active:scale-[0.98]"
            >
              <kbd className="px-1.5 py-0.5 text-[10px] bg-neutral-800 border border-neutral-700 text-emerald-400 rounded font-bold">
                {idx + 1}
              </kbd>
              <span className="truncate">{action}</span>
            </button>
          ))}
        </div>
      </div>

      {/* D-Pad Navigation & Command Input */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-neutral-800/80">
        {/* D-Pad Buttons */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-2 bg-neutral-900/60 rounded-lg border border-neutral-800">
          <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1.5 font-bold">
            Movement (WASD / Arrows)
          </div>
          <div className="grid grid-cols-3 gap-1.5 w-32">
            <div />
            <button
              type="button"
              onClick={() => onExecuteAction('North')}
              title="Move North (W / Up Arrow)"
              className="w-10 h-10 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 active:bg-emerald-950 text-neutral-300 rounded border border-neutral-700 text-xs font-bold transition-all shadow cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div />
            <button
              type="button"
              onClick={() => onExecuteAction('West')}
              title="Move West (A / Left Arrow)"
              className="w-10 h-10 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 active:bg-emerald-950 text-neutral-300 rounded border border-neutral-700 text-xs font-bold transition-all shadow cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onExecuteAction('Rest')}
              title="Rest / Wait turn (Space)"
              className="w-10 h-10 flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 active:bg-emerald-950 text-neutral-400 rounded border border-neutral-800 text-[10px] font-bold transition-all shadow cursor-pointer"
            >
              REST
            </button>
            <button
              type="button"
              onClick={() => onExecuteAction('East')}
              title="Move East (D / Right Arrow)"
              className="w-10 h-10 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 active:bg-emerald-950 text-neutral-300 rounded border border-neutral-700 text-xs font-bold transition-all shadow cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <div />
            <button
              type="button"
              onClick={() => onExecuteAction('South')}
              title="Move South (S / Down Arrow)"
              className="w-10 h-10 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 active:bg-emerald-950 text-neutral-300 rounded border border-neutral-700 text-xs font-bold transition-all shadow cursor-pointer"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <div />
          </div>
        </div>

        {/* Text Prompt input & Themes */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-2">
          <form onSubmit={handleSubmit} className="space-y-1.5">
            <label className="block text-[11px] text-neutral-400 uppercase font-semibold">
              Type Custom Command or Choice (1-{currentActions.length}):
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-emerald-500 font-bold select-none text-xs">
                  &gt;
                </span>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g. 1, North, attack, spell, unlock..."
                  className="w-full bg-black border border-neutral-700 rounded-lg pl-7 pr-3 py-2 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-neutral-950 font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </form>

          {/* Phosphor Theme selector */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs text-neutral-400">
            <span className="flex items-center gap-1 text-[11px]">
              <Palette className="w-3.5 h-3.5 text-neutral-500" />
              Phosphor:
            </span>
            <div className="flex gap-1.5">
              {(['green', 'amber', 'cyan', 'matrix'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onThemeChange(t)}
                  className={`capitalize text-[11px] px-2 py-0.5 rounded border transition-colors ${
                    theme === t
                      ? 'bg-neutral-800 text-neutral-100 border-neutral-600 font-bold'
                      : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
