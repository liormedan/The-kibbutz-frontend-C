/**
 * הקיבוץ – Auth Store
 * מנהל: מצב אימות, token, סוג משתמש
 *
 * איפה נשמר מה (מדויק נכון להיום — ראה BACKEND_CONTRACT.md):
 *   • ה-JWT נשמר כאן, ב-sessionStorage תחת המפתח `kibbutz-auth`.
 *     הוא **לא** ב-httpOnly cookie. המשמעות: הוא נמחק בסגירת הטאב, אבל
 *     JavaScript שרץ בדף יכול לקרוא אותו — כלומר XSS חושף אותו. מעבר ל-
 *     httpOnly cookie ידרוש שהבקאנד יגיש Set-Cookie ויקבל אימות מהעוגייה.
 *   • העוגיות `kibbutz-session` / `kibbutz-role` הן דגלוני ניווט בלבד
 *     ("1" ותפקיד), נכתבות ב-document.cookie ואינן httpOnly. src/proxy.ts
 *     קורא אותן כדי להחליט על הפניות — הן לא מאמתות מול השרת.
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
