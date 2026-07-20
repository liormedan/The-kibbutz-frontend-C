"use client";
// הקיבוץ – Pending-backend toast
// Listens for the "kibbutz:pending-backend" event dispatched by
// notImplemented() (src/lib/api/pending.ts) and shows a transient, friendly
// "coming soon" message — so clicking an unwired action gives real feedback
// instead of failing silently.

import { useEffect, useState } from "react";
import { Construction } from "lucide-react";

interface Toast {
  id: number;
  feature: string;
}

export const PENDING_EVENT = "kibbutz:pending-backend";

export default function PendingBackendToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let counter = 0;
    function onPending(e: Event) {
      const feature = (e as CustomEvent<{ feature?: string }>).detail?.feature ?? "";
      const id = ++counter;
      setToasts((prev) => [...prev, { id, feature }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    }
    window.addEventListener(PENDING_EVENT, onPending);
    return () => window.removeEventListener(PENDING_EVENT, onPending);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 shadow-lg"
        >
          <Construction className="h-4 w-4 flex-shrink-0" />
          <span>
            {t.feature ? (
              <>
                <span className="font-semibold">{t.feature}</span> — בקרוב, עדיין לא מחובר לשרת.
              </>
            ) : (
              <>הפעולה עדיין לא נתמכת בשרת.</>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
