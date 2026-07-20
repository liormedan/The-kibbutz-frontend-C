import { create } from "zustand";
import type { Conversation, Message } from "@/types/message.types";

export type { Conversation, ConversationType, Message } from "@/types/message.types";

interface ConversationState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messagesByConversation: Record<string, Message[]>;
  isLoading: boolean;

  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (conversationId: string | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useConversationStore = create<ConversationState>()((set) => ({
  conversations: [],
  activeConversationId: null,
  messagesByConversation: {},
  isLoading: false,

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (activeConversationId) => set({ activeConversationId }),
  addMessage: (message) => set((state) => {
    const currentMessages = state.messagesByConversation[message.conversationId] ?? [];

    return {
      conversations: state.conversations.map(conversation =>
        conversation.id === message.conversationId
          ? { ...conversation, lastMessage: message }
          : conversation
      ),
      messagesByConversation: {
        ...state.messagesByConversation,
        [message.conversationId]: [...currentMessages, message],
      },
    };
  }),
  setMessages: (conversationId, messages) => set((state) => ({
    messagesByConversation: {
      ...state.messagesByConversation,
      [conversationId]: messages,
    },
  })),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const selectActiveConversation = (s: ConversationState) =>
  s.conversations.find(conversation => conversation.id === s.activeConversationId) ?? null;

export const selectMessagesByConversation = (conversationId: string) => (s: ConversationState) =>
  s.messagesByConversation[conversationId] ?? [];

export const selectUnreadConversations = (s: ConversationState) =>
  s.conversations.filter(conversation =>
    Boolean(conversation.lastMessage) && conversation.id !== s.activeConversationId
  );
