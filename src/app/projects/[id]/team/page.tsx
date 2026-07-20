"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Shield, User, ChevronRight, Loader2, Users, Award } from "lucide-react";
import { fetchProject } from "@/services/project.service";
import { fetchTeam, updateTeamStatus } from "@/services/team.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useTeamStore } from "@/store/useTeamStore";
import type { PermissionLevel, TeamStatus } from "@/types/project.types";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProjectTeamPage({ params }: Props) {
  const { id: projectId } = use(params);
  const router = useRouter();

  // Stores
  const currentUser = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const project = useProjectStore((s) => s.selectedProject);
  const activeTeam = useTeamStore((s) => s.activeTeam);
  const isTeamLoading = useTeamStore((s) => s.isLoading);
  const isProjectLoading = useProjectStore((s) => s.isLoadingProject);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const isDevBypass = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";

  // Load project and team details
  useEffect(() => {
    if (isDevBypass || !token) return;
    void Promise.resolve()
      .then(() => {
        setError("");
        return Promise.all([
          fetchProject(projectId).catch(() => console.warn("Failed to fetch project")),
          fetchTeam(projectId).catch(() => console.warn("Failed to fetch team")),
        ]);
      })
      .catch(() => setError("שגיאה בטעינת נתוני הצוות"));
  }, [projectId, isDevBypass, token]);

  // Simulated fallback project if in dev bypass or failed to fetch
  const displayProject = useMemo(() => {
    if (isDevBypass || !token || !project) {
      return {
        id: projectId,
        title: "EcoTech Platform",
        owner: { id: "user-1", name: "גיא לוי", avatar: "" },
        members: ["user-1", "user-2", "user-3"],
        memberRoles: { "user-1": "יזם", "user-2": "פיתוח Backend", "user-3": "עיצוב מוצר" },
      };
    }
    return project;
  }, [project, projectId, isDevBypass, token]);

  // Simulated fallback team if null
  const displayTeam = useMemo(() => {
    if (!activeTeam) {
      return {
        id: "mock-team-id",
        projectId,
        teamStatus: "forming" as TeamStatus,
        createdAt: new Date().toISOString(),
        members: [
          { id: "m-1", userId: "user-1", projectId, roleId: "r-1", joinedAt: new Date().toISOString(), permissionLevel: "owner" as PermissionLevel },
          { id: "m-2", userId: "user-2", projectId, roleId: "r-2", joinedAt: new Date().toISOString(), permissionLevel: "admin" as PermissionLevel },
          { id: "m-3", userId: "user-3", projectId, roleId: "r-3", joinedAt: new Date().toISOString(), permissionLevel: "member" as PermissionLevel },
        ],
      };
    }
    return activeTeam;
  }, [activeTeam, projectId]);

  const currentUserId = currentUser?.id ?? "user-1";

  // Check if current user is owner or admin
  const currentUserMember = displayTeam.members.find(m => m.userId === currentUserId);
  const hasEditPermissions = currentUserMember?.permissionLevel === "owner" || currentUserMember?.permissionLevel === "admin" || isDevBypass;

  // Resolve user name by ID
  const getUserName = (userId: string) => {
    if (userId === displayProject.owner.id) return displayProject.owner.name;
    // Simple mock map or fallback
    const mockNames: Record<string, string> = {
      "user-1": "גיא לוי",
      "user-2": "מיכל כהן",
      "user-3": "רוני לביא",
      "user-4": "אלון שטיין",
    };
    return mockNames[userId] || `משתמש (${userId.substring(0, 5)})`;
  };

  const getMemberRoleName = (userId: string) => {
    return (displayProject.memberRoles as Record<string, string>)[userId] ?? "חבר צוות";
  };

  // Actions
  const handleStatusChange = async (status: TeamStatus) => {
    setError("");
    setSuccessMsg("");
    try {
      await updateTeamStatus(displayTeam.id, status);
      setSuccessMsg("סטטוס הצוות עודכן בהצלחה");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("שגיאה בעדכון סטטוס הצוות");
    }
  };

  const handlePermissionChange = async (memberId: string, level: PermissionLevel) => {
    setError("");
    setSuccessMsg("");
    setUpdatingMemberId(memberId);
    try {
      // Simulate backend change permission level mutation
      console.warn("TODO: Mutation updateMemberPermission", memberId, level);
      await new Promise(r => setTimeout(r, 800)); // Simulate delay
      
      // Update team store locally (Stub mode)
      if (activeTeam) {
        const updatedMembers = displayTeam.members.map(m =>
          m.id === memberId ? { ...m, permissionLevel: level } : m
        );
        useTeamStore.getState().setActiveTeam({
          ...activeTeam,
          members: updatedMembers,
        });
      }
      
      setSuccessMsg("הרשאת חבר הצוות עודכנה בהצלחה");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("שגיאה בעדכון הרשאות חבר הצוות");
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const getPermissionBadge = (level: PermissionLevel) => {
    switch (level) {
      case "owner":
        return { label: "בעלים", className: "bg-primary/10 text-primary border-primary/20", icon: Shield };
      case "admin":
        return { label: "מנהל", className: "bg-secondary/10 text-secondary border-secondary/20", icon: Shield };
      case "member":
        return { label: "חבר צוות", className: "bg-accent/10 text-accent-dark border-accent/20", icon: Shield };
      default:
        return { label: "צופה", className: "bg-muted text-muted-foreground border-muted", icon: User };
    }
  };

  const getTeamStatusLabel = (status: TeamStatus) => {
    switch (status) {
      case "forming":
        return { label: "בהקמה", className: "bg-amber-100 text-amber-700 border-amber-200" };
      case "active":
        return { label: "פעיל", className: "bg-green-100 text-green-700 border-green-200" };
      case "inactive":
        return { label: "לא פעיל", className: "bg-red-100 text-red-600 border-red-200" };
      case "completed":
        return { label: "הושלם בהצלחה", className: "bg-blue-100 text-blue-700 border-blue-200" };
    }
  };

  const isLoading = (isProjectLoading || isTeamLoading) && !isDevBypass && token;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-10 h-10 border-primary animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">טוען את נתוני צוות הפרויקט...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 pb-10 md:p-6" dir="rtl">
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
          <span>חזרה לפרויקט</span>
        </button>

        {/* Header card */}
        <header className="glass-panel mb-6 rounded-2xl border border-border p-5 md:p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">ניהול צוות פרויקט</h1>
                <p className="text-xs text-muted-foreground mt-0.5">{displayProject.title}</p>
              </div>
            </div>

            {/* Team status badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">סטטוס צוות:</span>
              <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${getTeamStatusLabel(displayTeam.teamStatus).className}`}>
                {getTeamStatusLabel(displayTeam.teamStatus).label}
              </span>
            </div>
          </div>
        </header>

        {error && <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</p>}
        {successMsg && <p className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-700">{successMsg}</p>}

        {/* Change status controls (Owners/Admins only) */}
        {hasEditPermissions && (
          <div className="glass-card mb-6 rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">עדכון סטטוס צוות</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              עדכנו את הסטטוס הנוכחי של התקדמות הצוות. סטטוס זה משפיע על ניהול המועמדויות וגיוס חברים נוספים.
            </p>
            <div className="flex gap-2 flex-wrap">
              {(["forming", "active", "inactive", "completed"] as TeamStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={displayTeam.teamStatus === status}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    displayTeam.teamStatus === status
                      ? "bg-primary text-white border-primary"
                      : "bg-background text-foreground border-[var(--border)] hover:bg-[#faf7f0]"
                  }`}
                >
                  {getTeamStatusLabel(status).label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Members list */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-1 px-1">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">חברי הצוות ({displayTeam.members.length})</h2>
          </div>

          <div className="space-y-3">
            {displayTeam.members.map((member) => {
              const BadgeConfig = getPermissionBadge(member.permissionLevel);
              const BadgeIcon = BadgeConfig.icon;
              const memberName = getUserName(member.userId);
              const roleName = getMemberRoleName(member.userId);
              const isOwner = member.permissionLevel === "owner";

              return (
                <div key={member.id} className="glass-panel flex items-center justify-between gap-4 rounded-2xl p-4">
                  {/* Left: Avatar & Identity */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                      {memberName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">{memberName}</span>
                        {isOwner && <Award className="w-4 h-4 text-accent" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{roleName}</p>
                    </div>
                  </div>

                  {/* Right: Permission level badge / Selection */}
                  <div className="flex items-center gap-3">
                    {hasEditPermissions && !isOwner && member.userId !== currentUserId ? (
                      <div className="flex items-center gap-2">
                        {updatingMemberId === member.id ? (
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        ) : (
                          <select
                            value={member.permissionLevel}
                            onChange={(e) => handlePermissionChange(member.id, e.target.value as PermissionLevel)}
                            className="text-xs rounded-xl border border-[var(--border)] bg-background text-foreground px-3 py-1.5 focus:outline-none focus:border-primary transition-colors cursor-pointer"
                          >
                            <option value="admin">מנהל (Admin)</option>
                            <option value="member">חבר צוות (Member)</option>
                            <option value="viewer">צופה (Viewer)</option>
                          </select>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${BadgeConfig.className} inline-flex items-center gap-1`}>
                          <BadgeIcon className="w-3 h-3" />
                          {BadgeConfig.label}
                        </span>
                      </div>
                    ) : (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${BadgeConfig.className} inline-flex items-center gap-1`}>
                        <BadgeIcon className="w-3 h-3" />
                        {BadgeConfig.label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
