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
//   /dashboard (explore home), /feed, /portfolios, /my-projects,
//   /my-applications, /teams, /messages, /friends, /profile, /settings,
//   /projects/*, /nda/*, /matches
//
// NOT HOSTED (public / auth flows — intentionally standalone, no sidebar):
//   /, /login, /register, /verify-email, /reset-password, /oauth/callback,
//   /onboarding, /admin
// ============================================================================

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardSidebar, { type DashboardTab } from "@/components/DashboardSidebar";
import { useAuthStore } from "@/store/useAuthStore";

const SIDEBAR_T: Record<string, string> = {
  explore: "גלה פרויקטים",
  myProjects: "הפרויקטים שלי",
  myApplications: "המועמדויות שלי",
  teams: "צוותים",
  messages: "הודעות",
  friends: "חברים",
  profile: "פרופיל אישי",
  settings: "הגדרות",
  createNewProject: "פרויקט חדש",
  all: "הכל",
};

// Where each sidebar item navigates — every item has its own top-level route.
const TAB_ROUTES: Record<DashboardTab, string> = {
  explore: "/dashboard",
  feed: "/feed",
  portfolios: "/portfolios",
  "my-projects": "/my-projects",
  "my-applications": "/my-applications",
  teams: "/teams",
  messages: "/messages",
  friends: "/friends",
  profile: "/profile",
  settings: "/settings",
};

function activeFromPath(pathname: string): DashboardTab {
  if (pathname.startsWith("/feed")) return "feed";
  if (pathname.startsWith("/portfolios")) return "portfolios";
  if (pathname.startsWith("/messages")) return "messages";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/my-projects")) return "my-projects";
  if (pathname.startsWith("/my-applications")) return "my-applications";
  if (pathname.startsWith("/teams")) return "teams";
  if (pathname.startsWith("/friends")) return "friends";
  if (pathname.startsWith("/settings")) return "settings";
  return "explore";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("new-kibbutz-sidebar-collapsed") === "true");
  }, []);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden font-sans bg-background text-foreground"
      dir="rtl"
    >
      <DashboardSidebar
        activeTab={activeFromPath(pathname)}
        lang="he"
        profileAvatar={user?.avatar || "/logo_clean.png"}
        profileName={user?.name || "אורח"}
        profileRole={user?.role === "admin" ? "מנהל" : "חבר קהילה"}
        sidebarCollapsed={collapsed}
        t={SIDEBAR_T}
        onCreateProject={() => router.push("/projects/create")}
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
