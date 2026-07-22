"use client";
// הקיבוץ – My teams (tab 4 of the /my-projects hub)
// The team of every project the user belongs to, with their own role.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Users } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { fetchMyProjects } from "@/services/user.service";
import type { Project } from "@/types/project.types";
import { useAuthStore } from "@/store/useAuthStore";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function MyTeamsView() {
  const { t, dir } = useI18n();
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?.id ?? "");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchMyProjects();
        setProjects([...(res.owned ?? []), ...(res.joined ?? [])]);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const myRole = (p: Project) =>
    p.owner?.id === currentUserId
      ? t("projPermOwner")
      : p.memberRoles?.[currentUserId] || t("projTeamMember");

  return (
    <div dir={dir}>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1].map((i) => <div key={i} className="glass-card h-32 animate-pulse rounded-2xl" />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8 text-primary" />}
          title={t("myTeamsEmpty")}
          description={t("myTeamsEmptySub")}
        />
      ) : (
        <div className="space-y-3">
          {projects.map((p) => {
            return (
              <div key={p.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{p.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("myTeamsRole", { role: myRole(p) })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/projects/${p.id}/team`)}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {t("projTabMembers")}
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 border-t border-[var(--border)] pt-3">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {t("membersCount", { current: p.members?.length ?? 0, max: p.maxMembers })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
