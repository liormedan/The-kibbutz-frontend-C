// הקיבוץ – Generic API / GraphQL types

import type { AuthUser } from "./user.types";

// ─── GraphQL primitives ────────────────────────────────────────

export interface GqlError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: Record<string, unknown>;
}

export interface GqlResponse<T> {
  data: T | null;
  errors?: GqlError[];
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface PaginatedResult<T> {
  nodes: T[];
  pageInfo: PageInfo;
  totalCount: number;
}

// ─── Auth ──────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: "participant" | "entrepreneur";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;       // seconds
}

/** Returned by Login / Register mutations */
export interface AuthPayload {
  tokens: AuthTokens;
  user: AuthUser;
}

/** Returned by RefreshToken mutation */
export interface RefreshPayload {
  accessToken: string;
  expiresIn: number;
}

// ─── Notification ──────────────────────────────────────────────

// Aligned to the backend NotificationType enum (KibbutzBackend/Entities.cs).
export type NotifType =
  | "post_like"
  | "post_comment"
  | "comment_reply"
  | "friend_request"
  | "friend_request_accepted"
  | "new_follower"
  | "portfolio_like"
  | "new_message"
  | "mention"
  | "system_announcement"
  | "event_reminder";

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  meta?: Record<string, string>;
  actorName?: string;
  timeAgo?: string;
}
