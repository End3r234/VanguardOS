import { useEffect } from 'react';

export function useKeyboardShortcuts(shortcuts, handlers) {
  useEffect(() => {
    if (!shortcuts || shortcuts.length === 0) return;

    const handleKey = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;

      for (const shortcut of shortcuts) {
        const ctrlMatch = !!e.ctrlKey === !!shortcut.ctrl;
        const altMatch = !!e.altKey === !!shortcut.alt;
        const shiftMatch = !!e.shiftKey === !!shortcut.shift;
        const keyMatch = e.key.toLowerCase() === (shortcut.key || '').toLowerCase();

        if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
          e.preventDefault();
          const handler = handlers[shortcut.id];
          if (handler) {
            handler();
          } else {
            window.dispatchEvent(new CustomEvent('vos-shortcut', { detail: { id: shortcut.id } }));
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [shortcuts, handlers]);
}