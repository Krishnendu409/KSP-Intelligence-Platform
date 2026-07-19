import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Role = 'SHO' | 'IO' | 'Analyst' | 'SCRB' | 'SP';

export interface AuthenticatedEmployee {
  firstName: string;
  rank: string | null;
  designation: string | null;
  unitName: string | null;
  unitId: number | null;
  districtName: string | null;
  districtId: number | null;
}

export interface AuthUser {
  username: string;
  role: Role;
  employee: AuthenticatedEmployee;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isHydrating: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hydrateUser: () => Promise<void>;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isHydrating: false,

      login: async (username: string, password: string) => {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Login failed');
        }
        const { token } = await res.json();
        set({ token });
        await get().hydrateUser();
      },

      logout: () => set({ token: null, user: null }),

      hydrateUser: async () => {
        const { token } = get();
        if (!token) return;
        set({ isHydrating: true });
        try {
          const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            set({ token: null, user: null });
            return;
          }
          const user = await res.json();
          set({ user });
        } finally {
          set({ isHydrating: false });
        }
      },
    }),
    {
      name: 'ksp-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
    }
  )
);
