export type ConversationType = "direct" | "project_room" | "team_room";

export interface Conversation {
  id: string;
  type: ConversationType;
  participants: string[];
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
