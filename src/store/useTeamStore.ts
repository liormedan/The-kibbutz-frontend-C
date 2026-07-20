import { create } from "zustand";
import type { Team, TeamStatus } from "@/types/project.types";

export type { Team, TeamStatus } from "@/types/project.types";

interface TeamState {
  teams: Team[];
  activeTeam: Team | null;
  isLoading: boolean;

  setTeams: (teams: Team[]) => void;
  setActiveTeam: (team: Team | null) => void;
  updateTeamStatus: (teamId: string, status: TeamStatus) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useTeamStore = create<TeamState>()((set) => ({
  teams: [],
  activeTeam: null,
  isLoading: false,

  setTeams: (teams) => set({ teams }),
  setActiveTeam: (activeTeam) => set({ activeTeam }),
  updateTeamStatus: (teamId, teamStatus) => set((state) => ({
    teams: state.teams.map(team =>
      team.id === teamId ? { ...team, teamStatus } : team
    ),
    activeTeam: state.activeTeam?.id === teamId
      ? { ...state.activeTeam, teamStatus }
      : state.activeTeam,
  })),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const selectActiveTeam = (s: TeamState) => s.activeTeam;
export const selectTeamByProjectId = (projectId: string) => (s: TeamState) =>
  s.teams.find(team => team.projectId === projectId) ?? null;
