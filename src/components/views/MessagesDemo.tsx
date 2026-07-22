"use client";
// הקיבוץ – Messages demo preview
// Shown INSTEAD of a bare "no conversations" line while the user has none, so
// the structure of the messaging area is visible during development. Purely
// presentational: nothing here talks to the backend and every control is inert.

import { MessageSquare, Send } from "lucide-react";
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
  const { t } = useI18n();

  return (
    <>
      <aside className="hidden w-[280px] shrink-0 overflow-y-auto border-l border-[var(--border)] p-4 md:block">
        <div className="mb-5 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">{t("msgConversations")}</h1>
        </div>

        {DEMO_CONVERSATIONS.map((c) => (
          <div
            key={c.id}
            aria-disabled
            className={`mb-2 flex w-full items-center gap-3 rounded-xl border-r-2 p-3 text-right ${
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
          </div>
        ))}
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        {/* Demo notice */}
        <div className="border-b border-amber-300/60 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
          {t("msgDemoBanner")}
        </div>

        <header className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3 md:px-6">
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
