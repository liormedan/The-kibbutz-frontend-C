/**
 * הקיבוץ – User Store
 * מנהל: פרופיל מורחב, כישורים, Badges, פרויקטים של המשתמש
 *
 * TODO backend:
 *   fetchProfile()  → GET /users/me
 *   updateProfile() → PATCH /users/me
 *   fetchBadges()   → GET /users/me/badges
 *   fetchProjects() → GET /users/me/projects
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const TTL_MS = 30 * 60 * 1000; // 30 דקות

const timedStorage = (ttl: number) => ({
  getItem: (name: string): string | null => {
    try {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      const { value, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp > ttl) { localStorage.removeItem(name); return null; }
      return value;
    } catch { return null; }
  },
  setItem: (name: string, value: string) => {
    localStorage.setItem(name, JSON.stringify({ value, timestamp: Date.now() }));
  },
  removeItem: (name: string) => localStorage.removeItem(name),
});

// ─── Types ────────────────────────────────────────────────────

export type ExpLevel = "1-2" | "3-5" | "5+";

export interface Skill {
  name: string;
  level: ExpLevel;
}

export interface SuccessBadge {
  id: string;
  projectId: string;
  projectName: string;
  entrepreneurId: string;
  entrepreneurName: string;
  approvedAt: string;
}

export interface UserProject {
  id: string;
  title: string;
  role: "owner" | "member";
  status: "open" | "closed";
  tags: string[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  bio: string;
  role: string;           // תפקיד (טקסט חופשי)
  avatar: string;
  links: string;
  skills: Skill[];
  canCreateProjects: boolean;
  successCount: number;
}

interface UserState {
  profile: UserProfile | null;
  badges: SuccessBadge[];
  projects: UserProject[];
  isLoadingProfile: boolean;
  isLoadingBadges: boolean;
  isLoadingProjects: boolean;

  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  addSkill: (skill: Skill) => void;
  removeSkill: (skillName: string) => void;
  setBadges: (badges: SuccessBadge[]) => void;
  setProjects: (projects: UserProject[]) => void;
  setLoadingProfile: (v: boolean) => void;
  setLoadingBadges: (v: boolean) => void;
  setLoadingProjects: (v: boolean) => void;
  reset: () => void;
}

// ─── Store ────────────────────────────────────────────────────

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
  profile: null,
  badges: [],
  projects: [],
  isLoadingProfile: false,
  isLoadingBadges: false,
  isLoadingProjects: false,

  setProfile: (profile) => set({ profile }),

  updateProfile: (partial) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...partial } : null,
  })),

  addSkill: (skill) => set((state) => ({
    profile: state.profile
      ? { ...state.profile, skills: [...state.profile.skills.filter(s => s.name !== skill.name), skill] }
      : null,
  })),

  removeSkill: (skillName) => set((state) => ({
    profile: state.profile
      ? { ...state.profile, skills: state.profile.skills.filter(s => s.name !== skillName) }
      : null,
  })),

  setBadges: (badges) => set({ badges }),

  setProjects: (projects) => set({ projects }),

  setLoadingProfile: (v) => set({ isLoadingProfile: v }),
  setLoadingBadges: (v) => set({ isLoadingBadges: v }),
  setLoadingProjects: (v) => set({ isLoadingProjects: v }),

  reset: () => set({
    profile: null, badges: [], projects: [],
    isLoadingProfile: false, isLoadingBadges: false, isLoadingProjects: false,
  }),
    }),
    {
      name: "kibbutz-user",
      storage: createJSONStorage(() => timedStorage(TTL_MS)),
      partialize: (state) => ({
        profile: state.profile,
        badges: state.badges,
        projects: state.projects,
      }),
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────

export const selectProfile        = (s: UserState) => s.profile;
export const selectSkills         = (s: UserState) => s.profile?.skills ?? [];
export const selectBadges         = (s: UserState) => s.badges;
export const selectProjects       = (s: UserState) => s.projects;
export const selectOwnedProjects  = (s: UserState) => s.projects.filter(p => p.role === "owner");
export const selectJoinedProjects = (s: UserState) => s.projects.filter(p => p.role === "member");
export const selectSuccessCount   = (s: UserState) => s.badges.length;
