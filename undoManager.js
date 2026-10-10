let currentUndo = null;
const listeners = new Set();

export const undoManager = {
  push(label, restoreFn, item) {
    currentUndo = { label, restoreFn, item, startTime: Date.now() };
    listeners.forEach(l => l(currentUndo));

    const timeoutId = setTimeout(() => {
      if (currentUndo && currentUndo.timeoutId === timeoutId) {
        currentUndo = null;
        listeners.forEach(l => l(null));
      }
    }, 10000);
    currentUndo.timeoutId = timeoutId;
  },

  undo() {
    if (currentUndo) {
      const item = currentUndo;
      if (item.timeoutId) clearTimeout(item.timeoutId);
      try {
        item.restoreFn(item.item);
      } catch (e) {
        console.error('Undo restore failed:', e);
      }
      currentUndo = null;
      listeners.forEach(l => l(null));
    }
  },

  dismiss() {
    if (currentUndo && currentUndo.timeoutId) clearTimeout(currentUndo.timeoutId);
    currentUndo = null;
    listeners.forEach(l => l(null));
  },

  subscribe(listener) {
    listeners.add(listener);
    listener(currentUndo);
    return () => listeners.delete(listener);
  },
};