import { notImplemented, pendingRead } from "@/lib/api/pending";
import { useTeamStore } from "@/store/useTeamStore";
import type { Team, TeamStatus } from "@/types/project.types";

export async function fetchTeam(projectId: string): Promise<void> {
  const { setActiveTeam, setLoading } = useTeamStore.getState();
  setLoading(true);
  try {
    const team = await pendingRead<Team | null>("צוותים", null);
    setActiveTeam(team);
  } finally {
    setLoading(false);
  }
}

export async function updateTeamStatus(teamId: string, status: TeamStatus): Promise<void> {
  return notImplemented("צוותים");
}
