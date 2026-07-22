// הקיבוץ – User domain types (matches .NET backend User entity)

export type UserRole = "participant" | "entrepreneur" | "admin";
export type ExpLevel = "1-2" | "3-5" | "5+";

export interface Skill {
  name: string;
  level: ExpLevel;
}

/** A personal site or public profile the user chooses to display. */
export interface ProfileLink {
  url: string;
  label?: string;
}

/** Preferred payment method — a label only, never card/account numbers. Used
 *  for the (upcoming) paid NDA flow; actual charging will go through a provider. */
export type PaymentMethod = "" | "bit" | "paypal" | "card";

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

/** Full user profile (GET /users/me) */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  role: string;           // free-text title e.g. "מפתח פולסטאק"
  avatar: string;
  links: string;          // legacy single link — superseded by profileLinks
  profileLinks: ProfileLink[];
  preferredPayment: PaymentMethod;
  skills: Skill[];
  canCreateProjects: boolean;
  canJoinProjects: boolean;
  isProfileComplete: boolean;
  emailVerified: boolean;
  successCount: number;
  createdAt: string;
}

/** Minimal user stored in auth token / session */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  canCreateProjects: boolean;
  canJoinProjects: boolean;
  isProfileComplete: boolean;
  emailVerified: boolean;
}

/** Onboarding wizard input */
export interface OnboardingInput {
  userType: UserRole;
  name: string;
  bio: string;
  role: string;
  links: string;
  skills: Skill[];
}

export interface UserSummary {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  skills: Skill[];
  successCount: number;
}

export type ConnectionRequestStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface ConnectionRequest {
  id: string;
  from: UserSummary;
  to: UserSummary;
  status: ConnectionRequestStatus;
  createdAt: string;
}
