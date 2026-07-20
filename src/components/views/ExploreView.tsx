"use client";
// הקיבוץ – Explore / Discover projects (the /dashboard home)
// Brand-styled, self-contained discovery grid. Projects are an orphan domain
// (no backend yet) so a "coming soon" banner sits over mock data.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Database, Globe, Leaf, Plus, Search, UserPlus, Users } from "lucide-react";
import ComingSoonBanner from "@/components/ComingSoonBanner";
import EmptyState from "@/components/EmptyState";

type Domain = "leaf" | "cpu" | "database" | "globe";

interface DiscoverProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
  maxMembers: number;
  memberCount: number;
  iconType: Domain;
  owner: string;
}

const PROJECTS: DiscoverProject[] = [
  { id: "1", title: "Green Tech App", description: "פיתוח פתרונות ירוקים ואקולוגיים לייעול צריכת אנרגיה עירונית בקהילה.", tags: ["Next.js", "React", "Eco-Tech"], maxMembers: 5, memberCount: 3, iconType: "leaf", owner: "גיא לוי" },
  { id: "2", title: "Creative AI Helper", description: "מערכת בינה מלאכותית ליצירת תכנים מותאמים אישית במהירות.", tags: ["AI", "ML", "Figma"], maxMembers: 4, memberCount: 1, iconType: "cpu", owner: "דניאל כהן" },
  { id: "3", title: "DataFlow Dashboard", description: "פלטפורמה להצגת נתונים ואנליטיקות מתקדמות בזמן אמת.", tags: ["Python", "Vue.js", "Data Science"], maxMembers: 6, memberCount: 2, iconType: "database", owner: "מיכל רז" },
  { id: "4", title: "ArtSphere Platform", description: "פלטפורמת מסחר מבוזרת ליצירות אמנות דיגיטליות.", tags: ["Web3", "Blockchain", "Design"], maxMembers: 5, memberCount: 4, iconType: "globe", owner: "אורן ברק" },
  { id: "5", title: "EduKibbutz", description: "מערכת לניהול קורסים ולמידה שיתופית בתוך הקהילה.", tags: ["React", "Firebase", "Education"], maxMembers: 4, memberCount: 1, iconType: "cpu", owner: "שירה מנדל" },
  { id: "6", title: "SmartFarm Monitor", description: "ניטור חקלאי חכם בזמן אמת באמצעות חיישנים ו-IoT.", tags: ["IoT", "Python", "Eco-Tech"], maxMembers: 3, memberCount: 2, iconType: "leaf", owner: "ניב גבע" },
];

const IconMap: Record<Domain, typeof Leaf> = { leaf: Leaf, cpu: Cpu, database: Database, globe: Globe };

const DOMAINS: { value: Domain | "all"; label: string }[] = [
  { value: "all", label: "הכל" },
  { value: "leaf", label: "אקולוגיה" },
  { value: "cpu", label: "בינה מלאכותית" },
  { value: "database", label: "נתונים" },
  { value: "globe", label: "Web3 / גלובלי" },
];

export default function ExploreView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState<Domain | "all">("all");

  const filtered = useMemo(
    () =>
      PROJECTS.filter((p) => {
        if (domain !== "all" && p.iconType !== domain) return false;
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.includes(search) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }),
    [search, domain]
  );

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6" dir="rtl">
      <ComingSoonBanner feature="פרויקטים" className="mb-4" />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">גלה פרויקטים</h1>
          <p className="mt-1 text-sm text-muted-foreground">מצא פרויקטים קהילתיים שמחפשים חברים, ותרום את הכישורים שלך.</p>
        </div>
        <button
          onClick={() => router.push("/projects/create")}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          פרויקט חדש
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חפש לפי שם, תיאור או טכנולוגיה..."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-3 pr-12 pl-4 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none"
        />
      </div>

      {/* Domain filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {DOMAINS.map((d) => (
          <button
            key={d.value}
            onClick={() => setDomain(d.value)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              domain === d.value
                ? "bg-primary text-white"
                : "border border-[var(--border)] bg-[var(--card)] text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {d.label}
          </button>
        ))}
        <span className="ms-auto self-center text-xs text-muted-foreground">{filtered.length} פרויקטים</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-8 w-8 text-primary" />}
          title="לא נמצאו פרויקטים תואמים"
          description="נסה מילת חיפוש אחרת או בחר תחום אחר."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((proj) => {
            const Icon = IconMap[proj.iconType];
            const isFull = proj.memberCount >= proj.maxMembers;
            return (
              <article
                key={proj.id}
                onClick={() => router.push(`/projects/${proj.id}`)}
                className="glass-card flex cursor-pointer flex-col rounded-2xl p-5 text-right transition-all hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {proj.memberCount}/{proj.maxMembers}
                  </span>
                </div>

                <h2 className="mb-1 truncate text-base font-bold text-foreground">{proj.title}</h2>
                <p className="mb-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">{proj.description}</p>

                <div className="mb-4 flex flex-wrap gap-1.5">
                  {proj.tags.map((tag) => (
                    <span key={tag} className="rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{tag}</span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-3">
                  <span className="text-[11px] text-muted-foreground">מוביל: {proj.owner}</span>
                  <button
                    type="button"
                    disabled={isFull}
                    onClick={(e) => { e.stopPropagation(); router.push(`/projects/${proj.id}`); }}
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      isFull
                        ? "cursor-not-allowed bg-[var(--muted)] text-muted-foreground"
                        : "bg-primary text-white hover:opacity-90"
                    }`}
                  >
                    {isFull ? "מלא" : <><UserPlus className="h-3.5 w-3.5" />הצטרף</>}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
