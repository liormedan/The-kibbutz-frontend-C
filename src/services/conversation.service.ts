// הקיבוץ – Conversations Service (REST)
// Backend MessagesController: /api/messages/*
// The backend models chat by conversationId (not by peer user id) and has no
// realtime hub — connectChatHub() is replaced with polling. The id passed to
// fetchMessages / sendMessage / connectChatHub is treated as a CONVERSATION id.

import { api } from "@/lib/api/client";
import { mapMessage, mapConversation } from "@/lib/api/mappers";
import { useConversationStore } from "@/store/useConversationStore";
import type {
  PaginatedResponse,
  MessageDto,
  ConversationDto,
  SendMessageDto,
  CreateConversationDto,
} from "@/lib/api/types";

const POLL_MS = 5_000;

export async function fetchConversations(): Promise<void> {
  const { setConversations, setLoading } = useConversationStore.getState();
  setLoading(true);
  try {
    const page = await api.get<PaginatedResponse<ConversationDto>>(
      "/api/messages/conversations",
      { pageNumber: 1, pageSize: 50 },
    );
    setConversations((page?.items ?? []).map(mapConversation));
  } finally {
    setLoading(false);
  }
}

export async function fetchMessages(conversationId: string): Promise<void> {
  const { setMessages, setLoading } = useConversationStore.getState();
  setLoading(true);
  try {
    const page = await api.get<PaginatedResponse<MessageDto>>(
      `/api/messages/conversations/${conversationId}`,
      { pageNumber: 1, pageSize: 50 },
    );
    setMessages(conversationId, (page?.items ?? []).map(mapMessage));
  } finally {
    setLoading(false);
  }
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<void> {
  const body: SendMessageDto = { conversationId, content };
  const dto = await api.post<MessageDto>("/api/messages", body);
  useConversationStore.getState().addMessage(mapMessage(dto));
}

export async function createConversation(
  participantIds: string[],
  name?: string,
): Promise<string> {
  const body: CreateConversationDto = { participantIds, name };
  const dto = await api.post<ConversationDto>(
    "/api/messages/conversations",
    body,
  );
  const conv = mapConversation(dto);
  const { conversations, setConversations } = useConversationStore.getState();
  if (!conversations.some((c) => c.id === conv.id)) {
    setConversations([...conversations, conv]);
  }
  return conv.id;
}

export async function markConversationRead(
  conversationId: string,
): Promise<void> {
  try {
    await api.put<boolean>(`/api/messages/conversations/${conversationId}/read`);
  } catch {
    /* ignore */
  }
}

/**
 * Polling replacement for the old SignalR chat hub.
 * Re-fetches the conversation's messages on an interval.
 */
export function connectChatHub(conversationId: string): () => void {
  void fetchMessages(conversationId);
  const timer = setInterval(() => void fetchMessages(conversationId), POLL_MS);
  return () => clearInterval(timer);
}
