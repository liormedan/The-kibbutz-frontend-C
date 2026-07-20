// הקיבוץ – Backend → Frontend mappers
// The single place where backend REST DTOs are translated into the UI's
// existing view types, so pages/components stay untouched. Where the backend
// has no equivalent field, we fill sensible defaults and log the gap in
// BACKEND_GAPS.md.

import type {
  UserProfileDto,
  NotificationDto,
  MessageDto,
  ConversationDto,
  FriendshipDto,
} from "./types";
import {
  UserRole as BeUserRole,
  NotificationType,
  FriendshipStatus,
} from "./types";
import type {
  AuthUser,
  UserProfile,
  UserSummary,
  ConnectionRequest,
  ConnectionRequestStatus,
} from "@/types/user.types";
import type { UserRole as FeUserRole } from "@/types/user.types";
import type { Notification, NotifType } from "@/types/api.types";
import type { Message, Conversation } from "@/types/message.types";

// ─── Users ─────────────────────────────────────────────────────

/** Backend role enum → frontend role union (lossy — backend has no "entrepreneur"). */
export function mapRole(role: BeUserRole): FeUserRole {
  return role === BeUserRole.Administrator ? "admin" : "participant";
}

const displayName = (u: UserProfileDto): string =>
  u.fullName?.trim() || `${u.firstName} ${u.lastName}`.trim() || u.username;

export function mapAuthUser(u: UserProfileDto): AuthUser {
  return {
    id: u.userId,
    name: displayName(u),
    email: u.email,
    avatar: u.profilePictureUrl ?? "",
    role: mapRole(u.role),
    // Backend has no capability/onboarding/verification flags — default open.
    canCreateProjects: true,
    canJoinProjects: true,
    isProfileComplete: true,
    emailVerified: true,
  };
}

export function mapUserProfile(u: UserProfileDto): UserProfile {
  return {
    id: u.userId,
    name: displayName(u),
    email: u.email,
    bio: u.bio ?? "",
    role: "", // backend has no free-text professional title
    avatar: u.profilePictureUrl ?? "",
    links: "",
    skills: [], // no backend concept
    canCreateProjects: true,
    canJoinProjects: true,
    isProfileComplete: true,
    emailVerified: true,
    successCount: 0, // no backend concept
    createdAt: u.createdAt,
  };
}

export function mapUserSummary(u: UserProfileDto): UserSummary {
  return {
    id: u.userId,
    name: displayName(u),
    avatar: u.profilePictureUrl ?? undefined,
    role: undefined,
    skills: [],
    successCount: 0,
  };
}

/** The /api/auth/me endpoint returns the raw User entity, not UserProfileDto. */
export interface MeEntity {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profilePictureUrl?: string | null;
  coverImageUrl?: string | null;
  bio?: string | null;
  role: BeUserRole;
  createdAt: string;
}

export function meToUserProfileDto(e: MeEntity): UserProfileDto {
  return {
    userId: e.userId,
    firstName: e.firstName,
    lastName: e.lastName,
    fullName: `${e.firstName} ${e.lastName}`.trim(),
    username: e.username,
    email: e.email,
    profilePictureUrl: e.profilePictureUrl,
    coverImageUrl: e.coverImageUrl,
    bio: e.bio,
    role: e.role,
    followersCount: 0,
    followingCount: 0,
    friendsCount: 0,
    createdAt: e.createdAt,
  };
}

// ─── Notifications ─────────────────────────────────────────────

const NOTIF_TYPE_MAP: Record<NotificationType, NotifType> = {
  [NotificationType.PostLike]: "post_like",
  [NotificationType.PostComment]: "post_comment",
  [NotificationType.CommentReply]: "comment_reply",
  [NotificationType.FriendRequest]: "friend_request",
  [NotificationType.FriendRequestAccepted]: "friend_request_accepted",
  [NotificationType.NewFollower]: "new_follower",
  [NotificationType.PortfolioLike]: "portfolio_like",
  [NotificationType.NewMessage]: "new_message",
  [NotificationType.Mention]: "mention",
  [NotificationType.SystemAnnouncement]: "system_announcement",
  [NotificationType.EventReminder]: "event_reminder",
};

export function mapNotification(n: NotificationDto): Notification {
  return {
    id: n.notificationId,
    type: NOTIF_TYPE_MAP[n.type] ?? "system_announcement",
    title: n.text,
    body: "",
    isRead: n.isRead,
    createdAt: n.createdAt,
    actorName: n.actorName ?? undefined,
    timeAgo: n.timeAgo,
    meta:
      n.relatedEntityId && n.relatedEntityType
        ? { entityId: n.relatedEntityId, entityType: n.relatedEntityType }
        : undefined,
  };
}

// ─── Messages / Conversations ──────────────────────────────────

export function mapMessage(m: MessageDto): Message {
  return {
    id: m.messageId,
    conversationId: m.conversationId,
    senderId: m.senderId,
    content: m.content,
    attachmentUrl: m.mediaUrl ?? undefined,
    createdAt: m.sentAt,
  };
}

export function mapConversation(c: ConversationDto): Conversation {
  const participants = c.participants ?? [];
  return {
    id: c.conversationId,
    type: c.type === 1 ? "team_room" : "direct",
    participants: participants.map((p) => p.userId),
    participantsInfo: participants.map((p) => ({
      id: p.userId,
      name: p.fullName || `${p.firstName} ${p.lastName}`.trim() || p.username,
      avatar: p.profilePictureUrl ?? undefined,
    })),
    title: c.name ?? undefined,
    unreadCount: c.unreadCount,
    lastMessage: c.lastMessage ? mapMessage(c.lastMessage) : undefined,
    createdAt: c.lastMessageAt ?? new Date(0).toISOString(),
  };
}

// ─── Friendships → ConnectionRequest / UserSummary ─────────────

function mapFriendshipStatus(s: FriendshipStatus): ConnectionRequestStatus {
  switch (s) {
    case FriendshipStatus.Accepted:
      return "ACCEPTED";
    case FriendshipStatus.Rejected:
    case FriendshipStatus.Blocked:
      return "DECLINED";
    default:
      return "PENDING";
  }
}

export function mapConnectionRequest(f: FriendshipDto): ConnectionRequest {
  return {
    id: f.friendshipId,
    from: mapUserSummary(f.requester),
    to: mapUserSummary(f.addressee),
    status: mapFriendshipStatus(f.status),
    createdAt: f.requestedAt,
  };
}

export { type FriendshipDto };
