import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [], // { id, type, message, data, read, createdAt }

  addNotification: (notif) =>
    set((s) => ({
      notifications: [{ ...notif, read: false, createdAt: new Date() }, ...s.notifications].slice(0, 50),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  clearAll: () => set({ notifications: [] }),
}));
