"use client";
// הקיבוץ – "מצב פיתוח" toggle
// Sits on pages whose backend domain is not live yet. Visible only when the
// page has nothing real to show (or when demo data is already on, so it can be
// switched back off), and only in development builds.

import { Sparkles } from "lucide-react";
import { isDevBuild } from "@/lib/dev/demoMode";
import { useI18n } from "@/lib/i18n/LanguageProvider";

interface DevDataToggleProps {
  enabled: boolean;
  onToggle: () => void;
  /** Hide the button when the page already has real content to show. */
  hasRealData?: boolean;
  className?: string;
}

export default function DevDataToggle({
  enabled,
  onToggle,
  hasRealData = false,
  className = "",
}: DevDataToggleProps) {
  const { t } = useI18n();
  if (!isDevBuild) return null;
  if (hasRealData && !enabled) return null;

  return (
    <button
      type="button"
      data-testid="dev-data-toggle"
      onClick={onToggle}
      aria-pressed={enabled}
      title={t("devModeHint")}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
        enabled
          ? "border-primary bg-primary/10 text-primary"
          : "border-[var(--border)] text-muted-foreground hover:border-primary hover:text-primary"
      } ${className}`}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {enabled ? t("devModeOn") : t("devModeOff")}
    </button>
  );
}
