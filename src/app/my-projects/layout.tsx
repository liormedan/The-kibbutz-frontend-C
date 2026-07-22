"use client";
// הקיבוץ – Project management hub (/my-projects/*)
// One sidebar entry, four tabs. Each tab is a REAL route, so it has its own
// URL, back-button behaviour and refresh. This layout draws the header and the
// tab bar once; switching tabs only swaps the child page.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderGit2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const TABS = [
  { href: "/my-projects", key: "hubTabProjects", exact: true },
  { href: "/my-projects/requests", key: "hubTabRequests", exact: false },
  { href: "/my-projects/applications", key: "hubTabApplications", exact: false },
  { href: "/my-projects/teams", key: "hubTabTeams", exact: false },
] as const;

export default function MyProjectsLayout({ children }: { children: React.ReactNode }) {
  const { t, dir } = useI18n();
  const pathname = usePathname();

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

        <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
          {TABS.map((tab) => {
            const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
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
