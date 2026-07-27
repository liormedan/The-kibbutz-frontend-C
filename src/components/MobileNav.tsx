"use client";
// ============================================================================
// הקיבוץ – MobileNav  ·  the bottom bar below `md`
// ============================================================================
// Five slots is the hard ceiling — four destinations plus "עוד", which opens a
// sheet holding everything that doesn't fit. Labels are deliberately ONE short
// word each: the previous bar reused the long sidebar labels ("גלה פרויקטים",
// "פרופיל אישי"), which could not fit five columns at 360px and pushed the
// whole page 7px wider than the viewport.
//
// Profile is intentionally absent — it is reached from the avatar/account menu
// in AppTopBar, so the bar keeps its five slots for navigation.
//
// Max 5 slots; anything past the fourth destination lives in the "more" sheet.

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Users, Briefcase, SlidersHorizontal, LogOut, X } from "lucide-react";
import { logoutUser } from "@/services/auth.service";
import { selectUnreadConversations, useConversationStore } from "@/store/useConversationStore";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type Slot = {
  id: string;
  route: string;
  labelKey: string;
  icon: (active: boolean) => React.ReactNode;
};

/** Routes that live inside the "עוד" sheet — they light up the עוד slot. */
const MORE_ROUTES = ["/friends", "/my-portfolio", "/portfolios", "/settings"];

const SLOTS: Slot[] = [
  {
    id: "explore", route: "/projects", labelKey: "navShortExplore",
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={a ? "currentColor" : "none"} />
      </svg>
    ),
  },
  {
    id: "feed", route: "/feed", labelKey: "navShortFeed",
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h11a2 2 0 0 1 2 2v13H6a2 2 0 0 1-2-2z" fill={a ? "currentColor" : "none"} fillOpacity={a ? 0.15 : 0} />
        <path d="M17 8h1.5A1.5 1.5 0 0 1 20 9.5V17a2 2 0 0 1-2 2" />
        <line x1="7.5" y1="8.5" x2="13.5" y2="8.5" />
        <line x1="7.5" y1="12" x2="13.5" y2="12" />
      </svg>
    ),
  },
  {
    id: "messages", route: "/messages", labelKey: "navShortMessages",
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill={a ? "currentColor" : "none"} fillOpacity={a ? 0.15 : 0} />
      </svg>
    ),
  },
  {
    id: "my-projects", route: "/my-projects", labelKey: "navShortProjects",
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill={a ? "currentColor" : "none"} />
        <rect x="14" y="3" width="7" height="7" rx="1.5" fill={a ? "currentColor" : "none"} opacity={a ? 0.45 : 1} />
        <rect x="3" y="14" width="7" height="7" rx="1.5" fill={a ? "currentColor" : "none"} opacity={a ? 0.45 : 1} />
        <rect x="14" y="14" width="7" height="7" rx="1.5" fill={a ? "currentColor" : "none"} opacity={a ? 0.45 : 1} />
      </svg>
    ),
  },
];

const MoreIcon = (a: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.4 : 2} strokeLinecap="round">
    <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, dir } = useI18n();
  const unread = useConversationStore((s) => selectUnreadConversations(s).length);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Close the sheet whenever the route changes, so navigating from it doesn't
  // leave the sheet sitting open over the new page.
  useEffect(() => { setSheetOpen(false); }, [pathname]);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSheetOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  const moreActive = MORE_ROUTES.some((r) => pathname.startsWith(r));
  const isActive = (route: string) =>
    !moreActive && (route === "/projects"
      ? pathname === "/projects" || pathname.startsWith("/projects/")
      : pathname.startsWith(route));

  const go = (route: string) => { setSheetOpen(false); router.push(route); };

  const sheetItems = [
    { key: "friends", label: t("friends"), icon: <Users className="h-4.5 w-4.5" />, route: "/friends" },
    { key: "my-portfolio", label: t("myPortfolio"), icon: <Briefcase className="h-4.5 w-4.5" />, route: "/my-portfolio" },
    { key: "settings", label: t("settings"), icon: <SlidersHorizontal className="h-4.5 w-4.5" />, route: "/settings" },
  ];

  const handleLogout = async () => {
    setSheetOpen(false);
    await logoutUser();
    router.push("/");
  };

  return (
    <>
      {/* ── "עוד" sheet ─────────────────────────────────────────────── */}
      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-50" dir={dir}>
          <button
            type="button"
            aria-label={t("close")}
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("navMore")}
            data-testid="more-sheet"
            className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-[var(--border)] bg-[var(--background-subtle)] pb-[env(safe-area-inset-bottom,0px)] shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 pb-1 pt-3">
              <span className="text-sm font-bold text-foreground">{t("navMore")}</span>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label={t("close")}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-primary/8 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col pb-2">
              {sheetItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  data-testid={`more-${item.key}`}
                  onClick={() => go(item.route)}
                  className={`flex min-h-11 w-full items-center gap-3 px-4 py-3 text-start text-sm transition-colors hover:bg-primary/8 ${
                    pathname.startsWith(item.route) ? "font-semibold text-primary" : "text-foreground"
                  }`}
                >
                  <span className={pathname.startsWith(item.route) ? "text-primary" : "text-muted-foreground"}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}

              <div className="my-1 border-t border-[var(--border)]" />

              <button
                type="button"
                data-testid="more-logout"
                onClick={() => void handleLogout()}
                className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-start text-sm text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)]"
              >
                <LogOut className="h-4.5 w-4.5" />
                {t("settingsLogout")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── bottom bar ──────────────────────────────────────────────── */}
      <nav
        dir={dir}
        data-testid="mobile-nav"
        aria-label={t("navMore")}
        className="md:hidden fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-[var(--border)] bg-[var(--background-subtle)] pb-[env(safe-area-inset-bottom,0px)]"
      >
        {SLOTS.map((slot) => {
          const active = isActive(slot.route);
          return (
            <button
              key={slot.id}
              type="button"
              data-testid={`mobilenav-${slot.id}`}
              aria-current={active ? "page" : undefined}
              onClick={() => go(slot.route)}
              // min-w-0 + overflow-hidden: without them a long label makes the
              // flex item exceed its 1/5 share and widens the whole document.
              className={`relative flex min-h-14 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden px-1 pb-1.5 pt-2 transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {active && (
                <span className="pointer-events-none absolute inset-x-[15%] top-0 h-[2.5px] rounded-b bg-primary" />
              )}
              <span className="relative">
                {slot.icon(active)}
                {slot.id === "messages" && unread > 0 && (
                  <span className="absolute -top-1 -end-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--background-subtle)] bg-primary text-[9px] font-bold text-white">
                    {unread > 9 ? "9" : unread}
                  </span>
                )}
              </span>
              <span className={`max-w-full truncate text-[10px] leading-[1.35] ${active ? "font-bold" : "font-normal"}`}>
                {t(slot.labelKey)}
              </span>
            </button>
          );
        })}

        {/* עוד — opens the sheet rather than navigating */}
        <button
          type="button"
          data-testid="mobilenav-more"
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          onClick={() => setSheetOpen((v) => !v)}
          className={`relative flex min-h-14 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden px-1 pb-1.5 pt-2 transition-colors ${
            moreActive || sheetOpen ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {moreActive && (
            <span className="pointer-events-none absolute inset-x-[15%] top-0 h-[2.5px] rounded-b bg-primary" />
          )}
          {MoreIcon(moreActive || sheetOpen)}
          <span className={`max-w-full truncate text-[10px] leading-[1.35] ${moreActive ? "font-bold" : "font-normal"}`}>
            {t("navMore")}
          </span>
        </button>
      </nav>
    </>
  );
}
