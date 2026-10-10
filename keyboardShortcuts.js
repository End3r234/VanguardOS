import { base44 } from '@/api/base44Client';

export const DEFAULT_SHORTCUTS = [
  { id: 'new-call', label: 'New Call', ctrl: true, key: 'n' },
  { id: 'open-dispatch', label: 'Open Dispatch', ctrl: true, key: 'd' },
  { id: 'open-map', label: 'Open Live Map', ctrl: true, key: 'm' },
  { id: 'open-radio', label: 'Open Radio', ctrl: true, key: 'r' },
  { id: 'search', label: 'Search', ctrl: true, key: 'k' },
  { id: 'notifications', label: 'Open Notifications', ctrl: true, key: 'b' },
  { id: 'messages', label: 'Open Messages', ctrl: true, key: 'j' },
  { id: 'toggle-sidebar', label: 'Toggle Sidebar', ctrl: true, key: '\\' },
];

const STORAGE_KEY = 'vos-keyboard-shortcuts';

export function loadShortcuts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_SHORTCUTS.map(s => ({ ...s }));
}

export function saveShortcuts(shortcuts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
  try {
    base44.auth.updateMe({ custom_shortcuts: shortcuts });
  } catch (e) {}
}

export function resetShortcuts() {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_SHORTCUTS.map(s => ({ ...s }));
}

export function formatShortcut(s) {
  const parts = [];
  if (s.ctrl) parts.push('Ctrl');
  if (s.alt) parts.push('Alt');
  if (s.shift) parts.push('Shift');
  if (s.key === ' ') parts.push('Space');
  else parts.push(s.key.toUpperCase());
  return parts.join(' + ');
}