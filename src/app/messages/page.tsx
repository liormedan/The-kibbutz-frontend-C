"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, MessageSquare, Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import { connectChatHub, fetchMessages, sendMessage } from "@/services/conversation.service";
import { fetchUserById } from "@/services/user.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useConversationStore } from "@/store/useConversationStore";

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
  const currentUserId = useAuthStore(state => state.user?.id ?? "");
  const isLoading = useConversationStore(state => state.isLoading);
  const conversations = useConversationStore(state => state.conversations);
  const otherUserId = searchParams.get("userId");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [userCache, setUserCache] = useState<Record<string, { name: string; avatar: string }>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const messages = useConversationStore(state =>
    otherUserId ? (state.messagesByConversation[otherUserId] ?? []) : []
  );

  useEffect(() => {
    if (!otherUserId) return;
    void fetchMessages(otherUserId).catch(() => setError("לא ניתן לטעון את היסטוריית השיחה."));
    return connectChatHub(otherUserId);
  }, [otherUserId]);

  useEffect(() => {
    const idsToFetch = new Set<string>();
    if (otherUserId && !userCache[otherUserId]) idsToFetch.add(otherUserId);
    conversations.forEach(c => {
      const otherId = c.participants.find(p => p !== currentUserId);
      if (otherId && !userCache[otherId]) {
        idsToFetch.add(otherId);
      }
    });

    if (idsToFetch.size === 0) return;

    idsToFetch.forEach(async (uid) => {
      try {
        const u = await fetchUserById(uid);
        setUserCache(prev => ({ ...prev, [uid]: { name: u.name, avatar: u.avatar } }));
      } catch (err) {
        console.error("Failed to fetch user profile:", uid, err);
      }
    });
  }, [otherUserId, conversations, currentUserId]);

  const displayConversations = useMemo(() => {
    const list = [...conversations];
    if (otherUserId && !list.some(c => c.participants.includes(otherUserId))) {
      list.unshift({
        id: otherUserId,
        type: "direct",
        participants: [currentUserId, otherUserId],
        createdAt: new Date().toISOString(),
      });
    }
    return list;
  }, [conversations, otherUserId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const message = content.trim();
    if (!message || !otherUserId || isSending) return;
    setContent("");
    setIsSending(true);
    setError("");
    try {
      await sendMessage(otherUserId, message);
    } catch {
      setContent(message);
      setError("שליחת ההודעה נכשלה. נסו שוב.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] p-4 md:p-6" dir="rtl">
      <div className="glass-card mx-auto flex h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-2xl border border-[var(--border)] md:h-[calc(100vh-3rem)]">
        <aside className="hidden w-[280px] shrink-0 border-l border-[var(--border)] p-4 md:block overflow-y-auto">
          <div className="mb-5 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#d2642d]" />
            <h1 className="text-lg font-bold">שיחות</h1>
          </div>
          {displayConversations.length > 0 ? (
            displayConversations.map(c => {
              const otherId = c.participants.find(p => p !== currentUserId) ?? "";
              const name = userCache[otherId]?.name ?? otherId;
              const avatar = userCache[otherId]?.avatar;
              const active = otherUserId === otherId;
              return (
                <button
                  key={c.id}
                  onClick={() => router.push(`/messages?userId=${otherId}`)}
                  className={`w-full flex items-center gap-3 rounded-xl p-3 text-right mb-2 transition-all duration-200 border-r-2 ${
                    active
                      ? "border-[#d2642d] bg-[#d2642d]/10"
                      : "border-transparent hover:bg-black/5"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#d2642d]/10 text-sm font-bold text-[#d2642d]">
                    {avatar ? (
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
                </button>
              );
            })
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">אין שיחות להצגה.</p>
          )}
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          {!otherUserId ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                icon={<MessageSquare className="h-8 w-8 text-[#d2642d]" />}
                title="אין שיחות עדיין"
                description="מצאו התאמה מתאימה והתחילו שיחה חדשה."
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
                    {userCache[otherUserId]?.avatar ? (
                      <img src={userCache[otherUserId].avatar} alt={userCache[otherUserId].name} className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      (userCache[otherUserId]?.name ?? otherUserId)[0]?.toUpperCase() ?? "?"
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-sm md:text-base">{userCache[otherUserId]?.name ?? otherUserId}</h2>
                    <p className="text-xs text-[var(--muted-foreground)]">שיחה ישירה</p>
                  </div>
                </div>
                <button type="button" onClick={() => router.push("/matches")} className="rounded-xl p-2 text-[var(--muted-foreground)] hover:bg-[#d2642d]/10 hover:text-[#d2642d]">
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto p-4 md:p-6">
                {isLoading ? (
                  [0, 1, 2].map(item => (
                    <div key={item} className={`h-14 w-2/3 animate-pulse rounded-2xl bg-[#d2642d]/10 ${item % 2 ? "mr-auto" : ""}`} />
                  ))
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--muted-foreground)]">
                    שלחו הודעה ראשונה כדי להתחיל את השיחה.
                  </div>
                ) : (
                  messages.map(message => {
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
                    onChange={event => setContent(event.target.value)}
                    onKeyDown={event => {
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
