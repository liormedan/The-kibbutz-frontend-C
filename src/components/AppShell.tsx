"use client";
// ============================================================================
// הקיבוץ – AppShell  ·  THE application template (host for every app page)
// ============================================================================
// This component IS the app's single, consistent template. It renders the
// fixed sidebar (right in RTL / left in LTR) + a scrolling content area, and
// hosts whatever page is passed as `children`. The active sidebar item is
// derived from the current route (see activeFromPath / TAB_ROUTES below), so
// every page highlights correctly without any page-local tab state.
//
// HOW IT HOSTS PAGES
//   Each authenticated route segment has a tiny `layout.tsx` of the form:
//       export default function Layout({ children }) {
//         return <AppShell>{children}</AppShell>;
//       }
//   That layout wraps the segment, so the page file itself only renders its
//   own content — it never draws the sidebar and never "stands alone".
//
// HOSTED (inside the shell, via each segment's layout.tsx):
//   /projects (explore home) + /projects/[id] + /projects/create, /feed,
//   /portfolios, /my-projects, /my-applications, /applications, /teams,
//   /messages, /friends, /profile, /settings, /nda/*, /matches
//
// NOT HOSTED (public / auth flows — intentionally standalone, no sidebar):
//   /, /login, /register, /verify-email, /reset-password, /oauth/callback,
//   /onboarding, /admin
// ============================================================================

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardSidebar, { type DashboardTab } from "@/components/DashboardSidebar";
import { useI18n } from "@/lib/i18n/LanguageProvider";

// Where each sidebar item navigates — every item has its own top-level route.
const TAB_ROUTES: Record<DashboardTab, string> = {
  explore: "/projects",
  feed: "/feed",
  portfolios: "/portfolios",
  "my-portfolio": "/my-portfolio",
  "my-projects": "/my-projects",
  applications: "/applications",
  "my-applications": "/my-applications",
  teams: "/teams",
  messages: "/messages",
  friends: "/friends",
  profile: "/profile",
  settings: "/settings",
};

function activeFromPath(pathname: string): DashboardTab {
  if (pathname.startsWith("/feed")) return "feed";
  if (pathname.startsWith("/my-portfolio")) return "my-portfolio";
  if (pathname.startsWith("/portfolios")) return "portfolios";
  if (pathname.startsWith("/messages")) return "messages";
  if (pathname.startsWith("/profile")) return "profile";
  // The hub and all of its tabs highlight the single "my projects" entry.
  if (pathname.startsWith("/my-projects")) return "my-projects";
  if (pathname.startsWith("/friends")) return "friends";
  if (pathname.startsWith("/settings")) return "settings";
  return "explore";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, lang, dir } = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("new-kibbutz-sidebar-collapsed") === "true");
  }, []);

  // Sidebar labels, keyed the way DashboardSidebar expects them.
  const sidebarT: Record<string, string> = {
    navGroupCommunity: t("navGroupCommunity"),
    navGroupManage: t("navGroupManage"),
    explore: t("explore"),
    feed: t("feed"),
    portfolios: t("portfolios"),
    myPortfolio: t("myPortfolio"),
    myProjects: t("myProjects"),
    applicationsReceived: t("applicationsReceived"),
    myApplications: t("myApplications"),
    teams: t("teams"),
    messages: t("messages"),
    friends: t("friends"),
    profile: t("profile"),
    settings: t("settings"),
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden font-sans bg-background text-foreground"
      dir={dir}
    >
      <DashboardSidebar
        activeTab={activeFromPath(pathname)}
        lang={lang}
        sidebarCollapsed={collapsed}
        t={sidebarT}
        onSelectTab={(tab) => router.push(TAB_ROUTES[tab])}
        onToggleCollapsed={() => {
          const next = !collapsed;
          setCollapsed(next);
          localStorage.setItem("new-kibbutz-sidebar-collapsed", String(next));
        }}
      />
      {/* Content region. Each page controls its own padding/width, so pages
          that bring their own <main> stay the single semantic main. */}
      <div className="min-w-0 flex-1 h-full overflow-y-auto pb-20 md:pb-0">
        {children}
      </div>
    </div>
  );
}
