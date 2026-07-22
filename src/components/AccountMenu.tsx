"use client";
// הקיבוץ – Account menu (the avatar in AppTopBar)
// Identity header + the few account actions. Logout lives here — it is the
// natural home for it, and otherwise it is buried inside /settings.
//
// Direction-aware: the avatar sits at the inline END of the top bar, so the
// panel anchors to `end-0` and opens inward in both RTL and LTR.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, SlidersHorizontal, LogOut } from "lucide-react";
import { logoutUser } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function AccountMenu() {
  const router = useRouter();
  const { t, dir } = useI18n();
  const user = useAuthStore((s) => s.user);
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

  const go = (route: string) => { setOpen(false); router.push(route); };

  const handleLogout = async () => {
    setOpen(false);
    await logoutUser();
    router.push("/");
  };

  const name = user?.name || t("guest");
  const role = user?.role === "admin" ? t("admin") : t("communityMember");

  return (
    <div ref={ref} className="relative shrink-0" dir={dir}>
      <button
        type="button"
        data-testid="topbar-avatar"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("accountMenuLabel")}
        title={name}
        onClick={() => setOpen((v) => !v)}
        className="block rounded-xl transition-opacity hover:opacity-80 cursor-pointer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user?.avatar || "/logo_clean.png"}
          alt={name}
          className="h-9 w-9 rounded-xl border border-[var(--border)] object-cover"
        />
      </button>

      {open && (
        <div
          role="menu"
          data-testid="account-menu-panel"
          className="glass-panel absolute end-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-[var(--border)] py-1 shadow-lg"
        >
          {/* Identity header — centred within the card */}
          <div className="flex flex-col items-center gap-2 px-3 py-4 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user?.avatar || "/logo_clean.png"}
              alt={name}
              className="h-12 w-12 shrink-0 rounded-xl border border-[var(--border)] object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{role}</p>
            </div>
          </div>

          <div className="border-t border-[var(--border)]" />

          <button
            type="button"
            role="menuitem"
            data-testid="account-profile"
            onClick={() => go("/profile")}
            className="flex w-full items-center justify-center gap-2.5 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-primary/8"
          >
            <User className="h-4 w-4" />
            {t("profile")}
          </button>

          <button
            type="button"
            role="menuitem"
            data-testid="account-settings"
            onClick={() => go("/settings")}
            className="flex w-full items-center justify-center gap-2.5 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-primary/8"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("settings")}
          </button>

          <div className="my-1 border-t border-[var(--border)]" />

          <button
            type="button"
            role="menuitem"
            data-testid="account-logout"
            onClick={() => void handleLogout()}
            className="flex w-full items-center justify-center gap-2.5 px-3 py-2.5 text-sm text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)]"
          >
            <LogOut className="h-4 w-4" />
            {t("settingsLogout")}
          </button>
        </div>
      )}
    </div>
  );
}
