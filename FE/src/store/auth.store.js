import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isInitialized: false,

  setSession: (user, accessToken) => set({ user, accessToken, isInitialized: true }),
  setToken: (accessToken) => set({ accessToken }),
  setInitialized: () => set({ isInitialized: true }),
  logout: () => set({ user: null, accessToken: null, isInitialized: true }),
}));
