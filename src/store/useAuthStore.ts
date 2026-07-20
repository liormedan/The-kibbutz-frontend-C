/**
 * הקיבוץ – Auth Store
 * מנהל: מצב אימות, token, סוג משתמש
 *
 * TODO backend:
 *   login()  → קרא ל-POST /auth/login ושמור token
 *   logout() → קרא ל-POST /auth/logout (אופציונלי) + נקה state
 *   Token נשמר ב-httpOnly cookie — לא ב-localStorage
 *   אימות ב-layout.tsx: בדוק token תקף בכל טעינה
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────

export type UserRole = "participant" | "entrepreneur" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  canCreateProjects: boolean;
  canJoinProjects: boolean;
  isProfileComplete: boolean;   // ← מפעיל Onboarding אם false
  emailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (token: string, refreshToken: string, user: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  markProfileComplete: () => void;
}

// ─── Store ────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: (token, refreshToken, user) => set({
        token,
        refreshToken,
        user,
        isAuthenticated: true,
        isLoading: false,
      }),

      logout: () => set({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
      }),

      setUser: (user) => set({ user }),

      setToken: (token) => set({ token }),

      setLoading: (isLoading) => set({ isLoading }),

      markProfileComplete: () => set((state) => ({
        user: state.user
          ? { ...state.user, isProfileComplete: true }
          : null,
      })),
    }),
    {
      name: "kibbutz-auth",
      storage: createJSONStorage(() => sessionStorage), // sessionStorage — לא localStorage
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ─── Selectors (שימוש יעיל — מונע re-renders מיותרים) ─────────

export const selectUser          = (s: AuthState) => s.user;
export const selectToken         = (s: AuthState) => s.token;
export const selectIsAuth        = (s: AuthState) => s.isAuthenticated;
export const selectIsAdmin       = (s: AuthState) => s.user?.role === "admin";
export const selectIsEntrepreneur= (s: AuthState) => s.user?.canCreateProjects === true;
export const selectNeedsOnboard  = (s: AuthState) => s.isAuthenticated && !s.user?.isProfileComplete;
export const selectEmailVerified = (s: AuthState) => s.user?.emailVerified === true;
