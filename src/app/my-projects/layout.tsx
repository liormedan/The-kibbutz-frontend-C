"use client";
// הקיבוץ – Project management hub (/my-projects/*)
// One sidebar entry, four tabs. Each tab is a REAL route, so it has its own
// URL, back-button behaviour and refresh. This layout draws the header and the
// tab bar once; switching tabs only swaps the child page.

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderGit2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useScrollFade } from "@/lib/useScrollFade";

const TABS = [
  { href: "/my-projects", key: "hubTabProjects", exact: true },
  { href: "/my-projects/requests", key: "hubTabRequests", exact: false },
  { href: "/my-projects/applications", key: "hubTabApplications", exact: false },
  { href: "/my-projects/teams", key: "hubTabTeams", exact: false },
] as const;

export default function MyProjectsLayout({ children }: { children: React.ReactNode }) {
  const { t, dir } = useI18n();
  const pathname = usePathname();
  const activeTabRef = useRef<HTMLAnchorElement>(null);
  const tabsFade = useScrollFade<HTMLElement>();

  // `nearest` keeps the page from jumping vertically — we only want the strip
  // to scroll horizontally to reveal the current tab.
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl p-4 md:p-6" dir={dir}>
        {/* No "new project" button here — it lives in AppTopBar now, on every
            page, so a second one in this header would just duplicate it. */}
        <div className="mb-5 flex items-center gap-3">
          <FolderGit2 className="h-7 w-7 shrink-0 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("myProjects")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("hubSubtitle")}</p>
          </div>
        </div>

        {/* The four tabs are wider than a phone, so the strip scrolls. The
            active one is scrolled into view on mount — otherwise landing on a
            later tab shows a bar that looks like nothing is selected. */}
        <nav
          {...tabsFade}
          data-testid="hub-tabs"
          className="mb-6 flex gap-1 overflow-x-auto border-b border-[var(--border)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((tab) => {
            const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                ref={active ? activeTabRef : undefined}
                aria-current={active ? "page" : undefined}
                className={`-mb-px flex min-h-11 shrink-0 items-center whitespace-nowrap border-b-2 px-4 text-sm font-medium transition-colors ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(tab.key)}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </AppShell>
  );
}
