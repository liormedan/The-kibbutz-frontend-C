import { pendingRead } from "@/lib/api/pending";
import type { Project } from "@/types/project.types";

export interface MatchedUser {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  skills: { name: string; level: string }[];
  successCount: number;
}

export async function fetchMatchingProjects(): Promise<Project[]> {
  return await pendingRead<Project[]>("התאמות", []);
}

export async function fetchMatchingUsers(projectId: string): Promise<MatchedUser[]> {
  return await pendingRead<MatchedUser[]>("התאמות", []);
}
