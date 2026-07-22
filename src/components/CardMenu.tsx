"use client";
// הקיבוץ – Overflow ("⋯") menu for cards
// One menu, per-card actions. The caller supplies the items, so a feed post,
// a portfolio and a project can each offer what makes sense for them.
//
// Direction-aware: the button sits at the inline END of the card header and the
// panel is anchored there too, so it opens inward in both RTL and LTR.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export interface CardMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  /** Renders in the danger colour and sits below a divider. */
  danger?: boolean;
  disabled?: boolean;
}

export default function CardMenu({
  items,
  label,
  className = "",
}: {
  items: CardMenuItem[];
  /** Accessible name, e.g. "אפשרויות לפוסט של גיא לוי". */
  label?: string;
  className?: string;
}) {
  const { t, dir } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (items.length === 0) return null;

  const normal = items.filter((i) => !i.danger);
  const danger = items.filter((i) => i.danger);

  const renderItem = (item: CardMenuItem) => (
    <button
      key={item.key}
      type="button"
      role="menuitem"
      disabled={item.disabled}
      onClick={() => { setOpen(false); item.onSelect(); }}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-start text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        item.danger
          ? "text-[var(--danger)] hover:bg-[var(--danger-soft)]"
          : "text-foreground hover:bg-primary/8"
      }`}
    >
      {item.icon}
      <span className="whitespace-nowrap">{item.label}</span>
    </button>
  );

  return (
    <div ref={ref} className={`relative ${className}`} dir={dir}>
      <button
        type="button"
        data-testid="card-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label || t("cardMenuLabel")}
        title={label || t("cardMenuLabel")}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/8 hover:text-foreground cursor-pointer"
      >
        <MoreHorizontal className="h-4.5 w-4.5" />
      </button>

      {open && (
        <div
          role="menu"
          data-testid="card-menu-panel"
          className="glass-panel absolute end-0 top-full z-30 mt-1 min-w-44 overflow-hidden rounded-xl border border-[var(--border)] py-1 shadow-lg"
        >
          {normal.map(renderItem)}
          {danger.length > 0 && normal.length > 0 && (
            <div className="my-1 border-t border-[var(--border)]" />
          )}
          {danger.map(renderItem)}
        </div>
      )}
    </div>
  );
}
