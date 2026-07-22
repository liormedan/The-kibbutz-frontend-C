"use client";
// הקיבוץ – My Projects view (own route: /my-projects)
// Lists the projects the current user owns and the ones they joined.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Database, FolderGit2, Globe, Leaf, Plus, Users } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { fetchMyProjects } from "@/services/user.service";
import type { Project, ProjectIconType } from "@/types/project.types";
import DevDataToggle from "@/components/DevDataToggle";
import { useDemoMode } from "@/lib/dev/demoMode";
import { demoJoinedProjects, demoOwnedProjects } from "@/lib/dev/fixtures";
import { useAuthStore } from "@/store/useAuthStore";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const IconMap: Record<ProjectIconType, typeof Leaf> = { leaf: Leaf, cpu: Cpu, database: Database, globe: Globe };

function ProjectCard({ project, onOpen, membersLabel }: { project: Project; onOpen: () => void; membersLabel: string }) {
  const Icon = IconMap[project.iconType] ?? Leaf;
  return (
    <div onClick={onOpen} className="glass-card flex cursor-pointer flex-col gap-3 rounded-2xl p-5 text-right transition-all hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{project.title}</p>
          <p className="truncate text-xs text-muted-foreground">{project.owner?.name}</p>
        </div>
      </div>
      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{project.description}</p>
      <div className="flex flex-wrap gap-1">
        {project.tags?.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{tag}</span>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        {membersLabel}
      </div>
    </div>
  );
}

export default function MyProjectsView() {
  const router = useRouter();
  const { t, dir } = useI18n();
  const [demo, toggleDemo] = useDemoMode("my-projects");
  const me = useAuthStore((s) => s.user);
  const [owned, setOwned] = useState<Project[]>([]);
  const [joined, setJoined] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchMyProjects();
        setOwned(res.owned ?? []);
        setJoined(res.joined ?? []);
      } catch {
        setError(t("loadError"));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const membersLabel = (p: Project) =>
    t("membersCount", { current: p.members?.length ?? 0, max: p.maxMembers });

  const isEmpty = owned.length === 0 && joined.length === 0;
  const shownOwned = demo && isEmpty ? demoOwnedProjects(me?.id ?? "me", me?.name ?? "") : owned;
  const shownJoined = demo && isEmpty ? demoJoinedProjects(me?.id ?? "me") : joined;

  // The hub layout (/my-projects/layout.tsx) supplies the title and the
  // "new project" button, so this view renders only its list.
  return (
    <div dir={dir}>
      {error && <p className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="mb-4 flex justify-end">
        <DevDataToggle enabled={demo} onToggle={toggleDemo} hasRealData={!isEmpty} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="glass-card h-40 animate-pulse rounded-2xl" />)}
        </div>
      ) : shownOwned.length === 0 && shownJoined.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 className="h-8 w-8 text-primary" />}
          title={t("myProjectsEmpty")}
          description={t("myProjectsEmptySub")}
        />
      ) : (
        <div className="space-y-8">
          {shownOwned.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-foreground">{t("myProjectsCreated", { count: shownOwned.length })}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {shownOwned.map((p) => <ProjectCard key={p.id} project={p} membersLabel={membersLabel(p)} onOpen={() => router.push(`/projects/${p.id}`)} />)}
              </div>
            </section>
          )}
          {shownJoined.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-foreground">{t("myProjectsJoined", { count: shownJoined.length })}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {shownJoined.map((p) => <ProjectCard key={p.id} project={p} membersLabel={membersLabel(p)} onOpen={() => router.push(`/projects/${p.id}`)} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
