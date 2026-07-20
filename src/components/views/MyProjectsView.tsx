"use client";
// הקיבוץ – My Projects view (own route: /my-projects)
// Lists the projects the current user owns and the ones they joined.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Database, FolderGit2, Globe, Leaf, Plus, Users } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { fetchMyProjects } from "@/services/user.service";
import type { Project, ProjectIconType } from "@/types/project.types";

const IconMap: Record<ProjectIconType, typeof Leaf> = { leaf: Leaf, cpu: Cpu, database: Database, globe: Globe };

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
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
        חברים: {project.members?.length ?? 0}/{project.maxMembers}
      </div>
    </div>
  );
}

export default function MyProjectsView() {
  const router = useRouter();
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
        setError("שגיאה בטעינת הפרויקטים");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6" dir="rtl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FolderGit2 className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">הפרויקטים שלי</h1>
            <p className="mt-1 text-sm text-muted-foreground">הפרויקטים שיצרת ואלה שהצטרפת אליהם.</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/projects/create")}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          פרויקט חדש
        </button>
      </div>

      {error && <p className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="glass-card h-40 animate-pulse rounded-2xl" />)}
        </div>
      ) : owned.length === 0 && joined.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 className="h-8 w-8 text-primary" />}
          title="עדיין אין פרויקטים"
          description="צור פרויקט חדש או הצטרף לאחד מדף גילוי הפרויקטים."
        />
      ) : (
        <div className="space-y-8">
          {owned.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-foreground">יצרתי ({owned.length})</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {owned.map((p) => <ProjectCard key={p.id} project={p} onOpen={() => router.push(`/projects/${p.id}`)} />)}
              </div>
            </section>
          )}
          {joined.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-foreground">הצטרפתי ({joined.length})</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {joined.map((p) => <ProjectCard key={p.id} project={p} onOpen={() => router.push(`/projects/${p.id}`)} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
