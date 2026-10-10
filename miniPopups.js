let popups = [];
let popupId = 0;
const listeners = new Set();

export const miniPopupManager = {
  show({ type = 'info', title, message, duration = 4000 }) {
    const id = ++popupId;
    popups = [...popups, { id, type, title, message, createdAt: Date.now() }];
    listeners.forEach(l => l(popups));
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  },
  dismiss(id) {
    popups = popups.filter(p => p.id !== id);
    listeners.forEach(l => l(popups));
  },
  subscribe(listener) {
    listeners.add(listener);
    listener(popups);
    return () => listeners.delete(listener);
  },
};

export function showPopup(opts) {
  return miniPopupManager.show(opts);
}