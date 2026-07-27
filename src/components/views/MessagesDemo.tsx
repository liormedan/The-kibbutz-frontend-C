"use client";
// הקיבוץ – Messages demo preview
// Shown INSTEAD of a bare "no conversations" line while the user has none, so
// the structure of the messaging area is visible during development. Purely
// presentational: nothing here talks to the backend and every control is inert.

import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

interface DemoConversation {
  id: string;
  name: string;
  role: string;
  preview: string;
  unread?: number;
  active?: boolean;
}

const DEMO_CONVERSATIONS: DemoConversation[] = [
  { id: "d1", name: "גיא לוי", role: "מוביל פרויקט", preview: "מעולה, נדבר מחר על הארכיטקטורה", unread: 2, active: true },
  { id: "d2", name: "מיכל רז", role: "מנתחת נתונים", preview: "שלחתי לך את המסמך" },
  { id: "d3", name: "אורן ברק", role: "מעצב UI/UX", preview: "תודה על העזרה!" },
];

const DEMO_THREAD: { id: string; from: "them" | "me"; text: string; time: string }[] = [
  { id: "m1", from: "them", text: "היי! ראיתי שהצטרפת לפרויקט Green Tech — ברוך הבא 🎉", time: "09:12" },
  { id: "m2", from: "me", text: "תודה! שמח להיות פה. במה אפשר לעזור?", time: "09:14" },
  { id: "m3", from: "them", text: "אנחנו צריכים עזרה בצד הפרונט. יש לך ניסיון ב-React?", time: "09:15" },
  { id: "m4", from: "me", text: "בהחלט, עבדתי על כמה פרויקטים דומים.", time: "09:17" },
  { id: "m5", from: "them", text: "מעולה, נדבר מחר על הארכיטקטורה", time: "09:18" },
];

export default function MessagesDemo() {
  const { t, dir } = useI18n();
  // Mirrors the real page's list↔chat flow below md, so the preview shows how
  // messaging actually behaves on a phone rather than a permanently open chat.
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      <aside
        data-testid="conv-list"
        className={`w-full shrink-0 overflow-y-auto p-4 md:w-[280px] md:border-l md:border-[var(--border)] md:block ${
          openId ? "hidden" : "block"
        }`}
      >
        <div className="mb-5 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">{t("msgConversations")}</h1>
        </div>

        {DEMO_CONVERSATIONS.map((c) => (
          <button
            key={c.id}
            type="button"
            data-testid={`demo-conv-${c.id}`}
            onClick={() => setOpenId(c.id)}
            className={`mb-2 flex min-h-11 w-full items-center gap-3 rounded-xl border-r-2 p-3 text-right transition-colors hover:bg-primary/5 ${
              c.active ? "border-primary bg-primary/10" : "border-transparent"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
              {c.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.preview}</p>
            </div>
            {c.unread ? (
              <span className="min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] text-white">
                {c.unread}
              </span>
            ) : null}
          </button>
        ))}
      </aside>

      <section
        data-testid="chat-pane"
        className={`min-w-0 flex-1 flex-col md:flex ${openId ? "flex" : "hidden"}`}
      >
        <header className="flex items-center gap-2 border-b border-[var(--border)] px-2 py-3 md:gap-3 md:px-6">
          <button
            type="button"
            data-testid="chat-back"
            onClick={() => setOpenId(null)}
            aria-label={t("msgBackToList")}
            title={t("msgBackToList")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary md:hidden"
          >
            {dir === "rtl" ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
            ג
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{DEMO_CONVERSATIONS[0].name}</p>
            <p className="text-xs text-muted-foreground">{DEMO_CONVERSATIONS[0].role}</p>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4 md:p-6">
          {DEMO_THREAD.map((m) => {
            const mine = m.from === "me";
            return (
              <div key={m.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                    mine
                      ? "rounded-bl-none bg-primary text-white"
                      : "rounded-br-none border border-[var(--border)] bg-[var(--surface)] text-foreground"
                  }`}
                >
                  <p className="text-right">{m.text}</p>
                  <span className={`mt-1 block text-left text-[9px] ${mine ? "text-white/70" : "text-muted-foreground"}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-[var(--border)] p-4">
          <div className="flex items-end gap-2 opacity-60">
            <div className="min-h-11 flex-1 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-muted-foreground">
              {t("msgTypePlaceholder")}
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
              <Send className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
