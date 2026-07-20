import { notImplemented, pendingRead } from "@/lib/api/pending";
import { useProjectStore } from "@/store/useProjectStore";
import type { Project, CreateProjectInput, ApplyToProjectInput, ProjectStatus } from "@/types/project.types";

type ProjectStore = ReturnType<typeof useProjectStore.getState>;
type StoreProject = ProjectStore["projects"][number];
type StoreApplication = ProjectStore["applications"][number];

export async function fetchProjects(): Promise<void> {
  const { setProjects, setLoading } = useProjectStore.getState();
  setLoading(true);
  try {
    setProjects(await pendingRead<StoreProject[]>("פרויקטים", []));
  } finally { setLoading(false); }
}

export async function fetchProject(id: string): Promise<void> {
  const { setSelectedProject, setLoadingProject } = useProjectStore.getState();
  setLoadingProject(true);
  try {
    setSelectedProject(await pendingRead<StoreProject | null>("פרויקטים", null));
  } finally { setLoadingProject(false); }
}

export async function createProject(input: CreateProjectInput): Promise<void> {
  return notImplemented("פרויקטים");
}

export async function applyToProject(input: ApplyToProjectInput): Promise<void> {
  return notImplemented("פרויקטים");
}

export async function leaveProject(projectId: string, userId: string): Promise<void> {
  return notImplemented("פרויקטים");
}

export async function closeProject(projectId: string): Promise<void> {
  return notImplemented("פרויקטים");
}

export async function addComment(projectId: string, text: string, user: { id: string; name: string; avatar: string }): Promise<void> {
  return notImplemented("פרויקטים");
}

export async function fetchApplications(projectId: string): Promise<void> {
  useProjectStore.getState().setApplications(await pendingRead<StoreApplication[]>("פרויקטים", []));
}

export async function respondToApplication(id: string, accept: boolean): Promise<void> {
  return notImplemented("פרויקטים");
}

export async function approveProjectSuccess(projectId: string, userId: string): Promise<void> {
  return notImplemented("פרויקטים");
}

export async function updateProject(
  id: string,
  input: Partial<Omit<Project, 'id' | 'members' | 'owner' | 'comments' | 'media'>> & { status?: ProjectStatus }
): Promise<void> {
  return notImplemented("פרויקטים");
}

export async function uploadProjectMedia(projectId: string, file: File): Promise<void> {
  return notImplemented("פרויקטים");
}

export async function removeProjectMedia(projectId: string, mediaId: string): Promise<void> {
  return notImplemented("פרויקטים");
}
