"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { ChevronLeft, MessageSquare, Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import {
  connectChatHub,
  fetchMessages,
  fetchConversations,
  sendMessage,
  createConversation,
  markConversationRead,
} from "@/services/conversation.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useConversationStore } from "@/store/useConversationStore";
import type { Message, Conversation, ParticipantInfo } from "@/types/message.types";

// Stable reference for the "no messages" case — returning a fresh []
// from the zustand selector triggers an infinite re-render loop in React 19.
const NO_MESSAGES: Message[] = [];

function otherParticipant(
  conv: Conversation | undefined,
  currentUserId: string,
): ParticipantInfo | undefined {
  return conv?.participantsInfo?.find((p) => p.id !== currentUserId);
}

function convTitle(conv: Conversation | undefined, currentUserId: string): string {
  return conv?.title || otherParticipant(conv, currentUserId)?.name || "שיחה";
}

function MessagesLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--background)]" dir="rtl">
      <div className="h-10 w-10 animate-pulse rounded-2xl bg-[#d2642d]/20" />
    </div>
  );
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserId = useAuthStore((state) => state.user?.id ?? "");
  const isLoading = useConversationStore((state) => state.isLoading);
  const conversations = useConversationStore((state) => state.conversations);
  const conversationId = searchParams.get("conversationId");
  const startUserId = searchParams.get("userId");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useConversationStore((state) =>
    conversationId ? (state.messagesByConversation[conversationId] ?? NO_MESSAGES) : NO_MESSAGES,
  );

  const activeConversation = conversations.find((c) => c.id === conversationId);

  // Load the conversation list once.
  useEffect(() => {
    void fetchConversations().catch(() => setError("לא ניתן לטעון את רשימת השיחות."));
  }, []);

  // Start a chat with a specific user: create/open a direct conversation, then
  // switch the URL to ?conversationId=.
  useEffect(() => {
    if (!startUserId || conversationId) return;
    let cancelled = false;
    void createConversation([startUserId])
      .then((id) => {
        if (!cancelled) router.replace(`/messages?conversationId=${id}`);
      })
      .catch(() => setError("לא ניתן לפתוח שיחה חדשה."));
    return () => {
      cancelled = true;
    };
  }, [startUserId, conversationId, router]);

  // Load + poll messages for the active conversation.
  useEffect(() => {
    if (!conversationId) return;
    void fetchMessages(conversationId).catch(() =>
      setError("לא ניתן לטעון את היסטוריית השיחה."),
    );
    void markConversationRead(conversationId);
    return connectChatHub(conversationId);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const message = content.trim();
    if (!message || !conversationId || isSending) return;
    setContent("");
    setIsSending(true);
    setError("");
    try {
      await sendMessage(conversationId, message);
    } catch {
      setContent(message);
      setError("שליחת ההודעה נכשלה. נסו שוב.");
    } finally {
      setIsSending(false);
    }
  }

  const headerOther = otherParticipant(activeConversation, currentUserId);

  return (
    <main className="min-h-screen bg-[var(--background)] p-4 md:p-6" dir="rtl">
      <div className="glass-card mx-auto flex h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-2xl border border-[var(--border)] md:h-[calc(100vh-3rem)]">
        <aside className="hidden w-[280px] shrink-0 border-l border-[var(--border)] p-4 md:block overflow-y-auto">
          <div className="mb-5 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#d2642d]" />
            <h1 className="text-lg font-bold">שיחות</h1>
          </div>
          {conversations.length > 0 ? (
            conversations.map((c) => {
              const other = otherParticipant(c, currentUserId);
              const name = convTitle(c, currentUserId);
              const avatar = other?.avatar;
              const active = conversationId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => router.push(`/messages?conversationId=${c.id}`)}
                  className={`w-full flex items-center gap-3 rounded-xl p-3 text-right mb-2 transition-all duration-200 border-r-2 ${
                    active
                      ? "border-[#d2642d] bg-[#d2642d]/10"
                      : "border-transparent hover:bg-black/5"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#d2642d]/10 text-sm font-bold text-[#d2642d]">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar} alt={name} className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      name[0]?.toUpperCase() ?? "?"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate text-foreground">{name}</p>
                    <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">
                      {c.lastMessage?.content ?? "שיחה פעילה"}
                    </p>
                  </div>
                  {c.unreadCount ? (
                    <span className="min-w-5 rounded-full bg-[#d2642d] px-1.5 py-0.5 text-center text-[10px] text-white">
                      {c.unreadCount}
                    </span>
                  ) : null}
                </button>
              );
            })
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">אין שיחות להצגה.</p>
          )}
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          {!conversationId ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                icon={<MessageSquare className="h-8 w-8 text-[#d2642d]" />}
                title="אין שיחה פתוחה"
                description="בחרו שיחה מהרשימה, או מצאו התאמה והתחילו שיחה חדשה."
                action={
                  <button type="button" onClick={() => router.push("/matches")} className="rounded-xl bg-[#d2642d] px-5 py-2.5 text-sm font-medium text-white">
                    התחלת שיחה
                  </button>
                }
              />
            </div>
          ) : (
            <>
              <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 md:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d2642d]/10 text-sm font-bold text-[#d2642d]">
                    {headerOther?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={headerOther.avatar} alt={headerOther.name} className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      convTitle(activeConversation, currentUserId)[0]?.toUpperCase() ?? "?"
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-sm md:text-base">{convTitle(activeConversation, currentUserId)}</h2>
                    <p className="text-xs text-[var(--muted-foreground)]">שיחה ישירה</p>
                  </div>
                </div>
                <button type="button" onClick={() => router.push("/matches")} className="rounded-xl p-2 text-[var(--muted-foreground)] hover:bg-[#d2642d]/10 hover:text-[#d2642d]">
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto p-4 md:p-6">
                {isLoading ? (
                  [0, 1, 2].map((item) => (
                    <div key={item} className={`h-14 w-2/3 animate-pulse rounded-2xl bg-[#d2642d]/10 ${item % 2 ? "mr-auto" : ""}`} />
                  ))
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--muted-foreground)]">
                    שלחו הודעה ראשונה כדי להתחיל את השיחה.
                  </div>
                ) : (
                  messages.map((message) => {
                    const mine = message.senderId === currentUserId;
                    return (
                      <div key={message.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-[#d2642d] text-white" : "bg-white/70 text-[var(--foreground)]"}`}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <time className={`mt-1 block text-[10px] ${mine ? "text-white/70" : "text-[var(--muted-foreground)]"}`}>
                            {new Date(message.createdAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                          </time>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-[var(--border)] p-3 md:p-4">
                {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
                <div className="flex items-end gap-2">
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                    rows={1}
                    placeholder="כתבו הודעה..."
                    className="min-h-11 flex-1 resize-none rounded-xl border border-[var(--border)] bg-white/60 px-4 py-3 text-sm outline-none focus:border-[#d2642d]"
                  />
                  <button type="button" onClick={() => void handleSend()} disabled={!content.trim() || isSending} className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d2642d] text-white disabled:cursor-not-allowed disabled:opacity-50" aria-label="שליחת הודעה">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesContent />
    </Suspense>
  );
}
