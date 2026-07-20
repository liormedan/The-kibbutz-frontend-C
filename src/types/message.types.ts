export type ConversationType = "direct" | "project_room" | "team_room";

export interface ParticipantInfo {
  id: string;
  name: string;
  avatar?: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  participants: string[];
  /** Display info for participants (names/avatars) — from the backend DTO. */
  participantsInfo?: ParticipantInfo[];
  /** Optional group/room name. */
  title?: string;
  unreadCount?: number;
  lastMessage?: Message;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
}
