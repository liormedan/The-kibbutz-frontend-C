/**
 * הקיבוץ – Project Store
 * מנהל: פרויקטים בפיד, סינון, פרויקט נבחר, מועמדויות
 *
 * TODO backend:
 *   fetchProjects()    → query GetProjects($filter, $tags, $search)
 *   fetchProject(id)   → query GetProject($id)
 *   createProject()    → mutation CreateProject($input)
 *   applyToProject()   → mutation CreateApplication($projectId, $message, $role)
 *   leaveProject()     → mutation LeaveProject($projectId)
 *   closeProject()     → mutation CloseProject($projectId)
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ProjectMedia } from "@/types/project.types";

const TTL_MS = 10 * 60 * 1000; // 10 דקות

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

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  maxMembers: number;
  members: string[];
  memberRoles: Record<string, string>;
  owner: { id: string; name: string; avatar: string; };
  iconType: "leaf" | "cpu" | "database" | "globe";
  statusText: string;
  status: "open" | "closed";
  isPromoted: boolean;
  comments: Comment[];
  coverImageUrl?: string;
  attachments?: { name: string; url: string; }[];
  websiteUrl?: string;
  visualUrl?: string;
  media?: ProjectMedia[];
  createdAt: string;
}

export interface Application {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  message: string;
  requestedRole: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export type ProjectFilter = "all" | "my" | "joined";

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  applications: Application[];          // מועמדויות לפרויקטים של היזם
  myApplications: Application[];        // מועמדויות שהמשתמש שלח
  searchTerm: string;
  selectedTag: string;
  activeFilter: ProjectFilter;
  isLoading: boolean;
  isLoadingProject: boolean;

  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, partial: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setSelectedProject: (project: Project | null) => void;
  setApplications: (apps: Application[]) => void;
  setMyApplications: (apps: Application[]) => void;
  addComment: (projectId: string, comment: Comment) => void;
  setSearchTerm: (term: string) => void;
  setSelectedTag: (tag: string) => void;
  setActiveFilter: (filter: ProjectFilter) => void;
  setLoading: (v: boolean) => void;
  setLoadingProject: (v: boolean) => void;
  joinProject: (projectId: string, userId: string, role: string) => void;
  leaveProject: (projectId: string, userId: string) => void;
}

// ─── Store ────────────────────────────────────────────────────

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
  projects: [],
  selectedProject: null,
  applications: [],
  myApplications: [],
  searchTerm: "",
  selectedTag: "הכל",
  activeFilter: "all",
  isLoading: false,
  isLoadingProject: false,

  setProjects: (projects) => set({ projects }),

  addProject: (project) => set((state) => ({
    projects: [project, ...state.projects],
  })),

  updateProject: (id, partial) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...partial } : p),
    selectedProject: state.selectedProject?.id === id
      ? { ...state.selectedProject, ...partial }
      : state.selectedProject,
  })),

  removeProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id),
    selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
  })),

  setSelectedProject: (project) => set({ selectedProject: project }),

  setApplications: (applications) => set({ applications }),

  setMyApplications: (myApplications) => set({ myApplications }),

  addComment: (projectId, comment) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === projectId ? { ...p, comments: [...p.comments, comment] } : p
    ),
    selectedProject: state.selectedProject?.id === projectId
      ? { ...state.selectedProject, comments: [...state.selectedProject.comments, comment] }
      : state.selectedProject,
  })),

  setSearchTerm: (searchTerm) => set({ searchTerm }),

  setSelectedTag: (selectedTag) => set({ selectedTag }),

  setActiveFilter: (activeFilter) => set({ activeFilter }),

  setLoading: (isLoading) => set({ isLoading }),

  setLoadingProject: (isLoadingProject) => set({ isLoadingProject }),

  joinProject: (projectId, userId, role) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === projectId
        ? { ...p, members: [...p.members, userId], memberRoles: { ...p.memberRoles, [userId]: role } }
        : p
    ),
  })),

  leaveProject: (projectId, userId) => set((state) => ({
    projects: state.projects.map(p => {
      if (p.id !== projectId) return p;
      const { [userId]: _, ...roles } = p.memberRoles;
      return { ...p, members: p.members.filter(m => m !== userId), memberRoles: roles };
    }),
  })),
    }),
    {
      name: "kibbutz-projects",
      storage: createJSONStorage(() => timedStorage(TTL_MS)),
      partialize: (state) => ({
        projects: state.projects,
        selectedProject: state.selectedProject,
      }),
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────

export const selectAllProjects = (s: ProjectState) => s.projects;
export const selectSelectedProject = (s: ProjectState) => s.selectedProject;
export const selectSearchTerm = (s: ProjectState) => s.searchTerm;
export const selectSelectedTag = (s: ProjectState) => s.selectedTag;

export const selectFilteredProjects = (userId: string) => (s: ProjectState) => {
  return s.projects.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(s.searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(s.searchTerm.toLowerCase());
    const matchesTag = s.selectedTag === "הכל" || s.selectedTag === "All" || p.tags.includes(s.selectedTag);
    const matchesFilter =
      s.activeFilter === "all" ||
      (s.activeFilter === "my" && p.owner.id === userId) ||
      (s.activeFilter === "joined" && p.members.includes(userId));
    return matchesSearch && matchesTag && matchesFilter;
  });
};

export const selectAllTags = (lang: "he" | "en") => (s: ProjectState) => {
  const all = lang === "he" ? "הכל" : "All";
  return [all, ...Array.from(new Set(s.projects.flatMap(p => p.tags)))];
};
