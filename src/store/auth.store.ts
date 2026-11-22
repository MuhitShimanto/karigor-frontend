import { create } from 'zustand';
import { SafeUser } from '@/types/auth';

interface AuthState {
  user: SafeUser | null;
  isLoading: boolean;
  setUser: (user: SafeUser | null) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  logout: async () => {
    try {
      await fetch('/api/session', { method: 'DELETE' });
    } catch {
      // ignore
    } finally {
      set({ user: null, isLoading: false });
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/');
    }
  },
  checkSession: async () => {
    try {
      const res = await fetch('/api/session');
      if (res.ok) {
        const json = await res.json();
        set({ user: json.data?.user || null, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
