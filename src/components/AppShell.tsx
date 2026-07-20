"use client";
// הקיבוץ – App shell
// One consistent template for every authenticated page: a fixed sidebar
// (right in RTL / left in LTR) + a scrolling content area. The sidebar is
// driven by the current route. Wrap any app page: <AppShell>...</AppShell>.

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

// Where each sidebar item navigates. Dashboard-only tabs use ?tab=.
const TAB_ROUTES: Record<DashboardTab, string> = {
  explore: "/dashboard",
  feed: "/feed",
  portfolios: "/portfolios",
  "my-projects": "/dashboard?tab=my-projects",
  "my-applications": "/dashboard/my-applications",
  teams: "/dashboard?tab=teams",
  messages: "/messages",
  friends: "/dashboard?tab=friends",
  profile: "/profile",
  settings: "/dashboard?tab=settings",
};

function activeFromPath(pathname: string): DashboardTab {
  if (pathname.startsWith("/feed")) return "feed";
  if (pathname.startsWith("/portfolios")) return "portfolios";
  if (pathname.startsWith("/messages")) return "messages";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/dashboard/my-applications")) return "my-applications";
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
      <main className="min-w-0 flex-1 h-full overflow-y-auto p-4 md:p-6 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
