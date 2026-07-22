"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  Briefcase,
  ChevronDown,
  Compass,
  FolderGit2,
  MessageSquare,
  Newspaper,
  SlidersHorizontal,
  User,
  Users,
} from "lucide-react";
import { selectUnreadConversations, useConversationStore } from "@/store/useConversationStore";

export type DashboardTab =
  | "explore"
  | "feed"
  | "portfolios"
  | "my-projects"
  | "applications"
  | "my-applications"
  | "my-portfolio"
  | "teams"
  | "messages"
  | "friends"
  | "profile"
  | "settings";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  lang: "en" | "he";
  sidebarCollapsed: boolean;
  t: Record<string, string>;
  onSelectTab: (tab: DashboardTab) => void;
  onToggleCollapsed: () => void;
}

export default function DashboardSidebar({
  activeTab,
  lang,
  sidebarCollapsed,
  t,
  onSelectTab,
  onToggleCollapsed,
}: DashboardSidebarProps) {
  const router = useRouter();
  const unreadCount = useConversationStore(state => selectUnreadConversations(state).length);
  const iconCls = sidebarCollapsed ? "w-7 h-7" : "w-5 h-5";
  // Every item has its own top-level route, so the sidebar always navigates
  // (consistent across the whole app — no page-local tab state).
  // Grouped: "community" is public/social browsing, "manage" is the user's own
  // stuff. Profile + settings live in the bottom block so they stay reachable.
  type NavItem = { id: DashboardTab; label: string; icon: ReactNode; route: string };
  const navGroups: { label: string; items: NavItem[] }[] = [
    {
      label: t.navGroupCommunity,
      items: [
        { id: "explore", label: t.explore, icon: <Compass className={iconCls} />, route: "/projects" },
        { id: "feed", label: t.feed, icon: <Newspaper className={iconCls} />, route: "/feed" },
        { id: "messages", label: t.messages, icon: <MessageSquare className={iconCls} />, route: "/messages" },
        { id: "friends", label: t.friends, icon: <Users className={iconCls} />, route: "/friends" },
        // Portfolios browsing is reached from "תיק העבודות שלי" in the manage
        // group — it used to sit here too, which duplicated the concept.
      ],
    },
    {
      label: t.navGroupManage,
      items: [
        // One entry for the whole project workflow — requests, applications and
        // teams are tabs inside /my-projects, not separate sidebar items.
        { id: "my-projects", label: t.myProjects, icon: <FolderGit2 className={iconCls} />, route: "/my-projects" },
        { id: "my-portfolio", label: t.myPortfolio, icon: <Briefcase className={iconCls} />, route: "/my-portfolio" },
      ],
    },
  ];
  const bottomTabs: NavItem[] = [
    { id: "profile", label: t.profile, icon: <User className={iconCls} />, route: "/profile" },
    { id: "settings", label: t.settings, icon: <SlidersHorizontal className={iconCls} />, route: "/settings" },
  ];

  const renderNavButton = (tab: NavItem) => (
    <button
      key={tab.id}
      data-testid={`sidebar-${tab.id}`}
      onClick={() => router.push(tab.route)}
      title={sidebarCollapsed ? tab.label : undefined}
      className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
        sidebarCollapsed ? "justify-center" : (lang === "he" ? "text-right" : "text-left")
      } ${
        activeTab === tab.id
          ? "bg-primary/10 text-primary font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
      }`}
    >
      {/* Active marker as its own bar. A border-4 on a rounded-xl box follows
          the corner radius and reads as a crescent sticking out of the pill. */}
      {activeTab === tab.id && !sidebarCollapsed && (
        <span className="pointer-events-none absolute inset-y-1.5 start-0 w-1 rounded-full bg-primary" />
      )}
      {tab.icon}
      {!sidebarCollapsed && <span className="text-sm font-medium">{tab.label}</span>}
      {!sidebarCollapsed && tab.id === "messages" && unreadCount > 0 && (
        <span className={`${lang === "he" ? "mr-auto" : "ml-auto"} min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] text-white`}>
          {unreadCount}
        </span>
      )}
      {sidebarCollapsed && tab.id === "messages" && unreadCount > 0 && (
        <span className="absolute right-0 top-0 min-w-4 rounded-full bg-primary px-1 text-center text-[9px] text-white">
          {unreadCount}
        </span>
      )}
    </button>
  );

  const MOBILE_TABS: { id: DashboardTab; label: string; route?: string; badge?: number; icon: (active: boolean) => React.ReactNode }[] = [
    {
      id: "explore", label: t.explore, route: "/projects",
      icon: (active) => (
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={active ? "currentColor" : "none"}/>
        </svg>
      ),
    },
    {
      id: "my-projects", label: t.myProjects, route: "/my-projects",
      icon: (active) => (
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" fill={active ? "currentColor" : "none"}/>
          <rect x="14" y="3" width="7" height="7" rx="1.5" fill={active ? "currentColor" : "none"} opacity={active ? 0.45 : 1}/>
          <rect x="3" y="14" width="7" height="7" rx="1.5" fill={active ? "currentColor" : "none"} opacity={active ? 0.45 : 1}/>
          <rect x="14" y="14" width="7" height="7" rx="1.5" fill={active ? "currentColor" : "none"} opacity={active ? 0.45 : 1}/>
        </svg>
      ),
    },
    {
      id: "messages", label: t.messages,
      route: "/messages",
      icon: (active) => (
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0}/>
        </svg>
      ),
    },
    {
      id: "teams", label: t.teams, route: "/teams",
      icon: (active) => (
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0}/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      id: "profile", label: t.profile, route: "/profile",
      icon: (active) => (
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0}/>
        </svg>
      ),
    },
  ];

  return (
    <>
    {/* Mobile bottom nav — design: warm palette, top-line active indicator */}
    <nav
      dir="rtl"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center"
      style={{
        background: "var(--background-subtle)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {MOBILE_TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => tab.route ? router.push(tab.route) : onSelectTab(tab.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 2px 6px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              gap: 3,
              color: isActive ? "var(--primary)" : "var(--muted-foreground)",
              position: "relative",
            }}
          >
            {/* top active indicator */}
            {isActive && (
              <div style={{
                position: "absolute",
                top: 0,
                left: "15%",
                right: "15%",
                height: 2.5,
                borderRadius: 2,
                background: "var(--primary)",
              }} />
            )}
            {/* icon with badge */}
            <div style={{ position: "relative" }}>
              {tab.icon(isActive)}
              {tab.id === "messages" && unreadCount > 0 && (
                <div style={{
                  position: "absolute", top: -3, right: -4,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "var(--primary)", color: "#fff",
                  fontSize: 9, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid var(--background-subtle)",
                }}>{unreadCount}</div>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400, letterSpacing: 0.1 }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>

    <aside className={`hidden md:block h-full shrink-0 transition-[width] duration-300 ${sidebarCollapsed ? "w-[88px]" : "w-64"}`}>
      <div
        className={`fixed top-0 bottom-0 ${
          lang === "he" ? "right-0 border-l" : "left-0 border-r"
        } glass-panel z-30 flex flex-col transition-[width,padding] duration-300 ${
          sidebarCollapsed ? "w-[88px] p-3" : "w-64 px-5 py-4"
        } border-[var(--border)]`}
      >
        {/* Expanded: the logo is centred and the collapse button is taken out of
            flow (absolute) so it cannot pull the logo off-centre. */}
        <div className={`relative flex items-center mb-5 ${sidebarCollapsed ? "flex-col gap-2 justify-center" : "justify-center"}`}>
          {sidebarCollapsed ? (
            <Image src="/logo_clean.png" alt="The Kibbutz" width={44} height={44} className="rounded-lg object-cover" />
          ) : (
            <Image src="/logo.jpg" alt="The Kibbutz" width={100} height={34} className="rounded-md object-contain" />
          )}
          <button
            onClick={onToggleCollapsed}
            className={`p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all cursor-pointer ${
              sidebarCollapsed ? "" : "absolute top-1/2 -translate-y-1/2"
            }`}
            style={sidebarCollapsed ? undefined : { insetInlineEnd: 0 }}
            title={sidebarCollapsed ? t.sidebarExpand : t.sidebarCollapse}
            aria-label={sidebarCollapsed ? t.sidebarExpand : t.sidebarCollapse}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                sidebarCollapsed
                  ? (lang === "he" ? "-rotate-90" : "rotate-90")
                  : (lang === "he" ? "rotate-90" : "-rotate-90")
              }`}
            />
          </button>
        </div>

        {/* The rail is sized to fit a short viewport without scrolling (compact
            logo, py-2 rows, no account card). overflow-y-auto stays as the
            safety net for very high browser zoom. */}
        <nav className="flex-1 min-h-0 overflow-y-auto space-y-1">
          {navGroups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? "pt-3" : ""}>
              {!sidebarCollapsed && (
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {group.label}
                </p>
              )}
              {sidebarCollapsed && gi > 0 && <div className="mx-2 mb-2 border-t border-[var(--border)]" />}
              <div className="space-y-1">
                {group.items.map((tab) => renderNavButton(tab))}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile + settings: pinned so they are always reachable.
            Logging out lives inside /settings — the sidebar no longer carries
            an account card of its own. */}
        <div className="mt-2 space-y-1 border-t border-[var(--border)] pt-2">
          {bottomTabs.map((tab) => renderNavButton(tab))}
        </div>
      </div>
    </aside>
    </>
  );
}
