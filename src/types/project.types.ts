// הקיבוץ – Project domain types (matches .NET backend Project entity)

export type ProjectIconType = "leaf" | "cpu" | "database" | "globe";
/** Matches backend schema: ProjectStatus enum { OPEN, CLOSED } */
export type ProjectStatus = "open" | "closed";
export type ProjectFilter = "all" | "my" | "joined";
export type ApplicationStatus = "pending" | "accepted" | "rejected";
export type RoleStatus = "open" | "filled" | "closed";
export type PermissionLevel = "owner" | "admin" | "member" | "viewer";
export type TeamStatus = "forming" | "active" | "inactive" | "completed";
export type ActivityType =
  | "member_joined"
  | "role_opened"
  | "project_updated"
  | "message_posted"
  | "milestone_completed";

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface Attachment {
  name: string;
  url: string;
}

export interface ProjectMedia {
  id: string;
  type: "image" | "video" | "document";
  name: string;
  url: string;
  sortOrder: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  maxMembers: number;
  members: string[];
  memberRoles: Record<string, string>;
  projectMembers: ProjectMember[];
  owner: { id: string; name: string; avatar: string };
  iconType: ProjectIconType;
  statusText: string;
  status: ProjectStatus;
  isPromoted: boolean;
  comments: Comment[];
  coverImageUrl?: string;
  attachments?: Attachment[];
  websiteUrl?: string;
  visualUrl?: string;
  media: ProjectMedia[];
  createdAt: string;
  /** Open roles the project is recruiting for (item 31) */
  openRoles?: ProjectRole[];
  /** Commitment level the project expects (item 31) */
  commitmentLevel?: "low" | "medium" | "high";
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
  status: ApplicationStatus;
  createdAt: string;
}

export interface ProjectRole {
  id: string;
  projectId: string;
  title: string;
  description: string;
  requiredSkills: string[];
  slots: number;
  filledSlots: number;
  status: RoleStatus;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  roleId: string;
  joinedAt: string;
  permissionLevel: PermissionLevel;
}

export interface Team {
  id: string;
  projectId: string;
  createdAt: string;
  teamStatus: TeamStatus;
  members: ProjectMember[];
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  actorId: string;
  type: ActivityType;
  payload: Record<string, unknown>;
  createdAt: string;
}

/** Input for creating a new project */
export interface CreateProjectInput {
  title: string;
  description: string;
  tags: string[];
  maxMembers: number;
  iconType: ProjectIconType;
  websiteUrl?: string;
  visualUrl?: string;
}

/** Input for submitting a project application */
export interface ApplyToProjectInput {
  projectId: string;
  message: string;
  requestedRole: string;
}

/** NDA document linked to a project */
export interface NdaDocument {
  id: string;
  projectId: string;
  senderId: string;
  recipientId: string;
  entrepreneurId: string;
  juniorId: string;
  confidentialityPeriod: string;
  formData?: Record<string, string>;
  pdfUrl?: string;
  status: "pending" | "signed" | "rejected";
  signedAt?: string;
  createdAt: string;
}
