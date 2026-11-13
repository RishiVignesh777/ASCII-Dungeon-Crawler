import { useEffect, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  description: string;
  handler: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
  allowInModal?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  isModalOpen?: boolean;
  shortcuts: KeyboardShortcut[];
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toUpperCase();
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    target.isContentEditable
  );
}

/**
 * Custom hook that registers global keyboard shortcuts while respecting
 * text inputs, browser modifier combos (Ctrl/Cmd/Alt), and modal state.
 */
export function useKeyboardShortcuts({
  enabled = true,
  isModalOpen = false,
  shortcuts,
}: UseKeyboardShortcutsOptions): void {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Never hijack browser/OS modifier combinations
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      // Do not trigger shortcuts while typing in inputs or textareas
      if (isEditableElement(event.target)) {
        return;
      }

      const pressedKey = event.key.toLowerCase();

      for (const shortcut of shortcutsRef.current) {
        if (shortcut.key.toLowerCase() === pressedKey) {
          if (isModalOpen && !shortcut.allowInModal) {
            return;
          }
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.handler(event);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, isModalOpen]);
}
