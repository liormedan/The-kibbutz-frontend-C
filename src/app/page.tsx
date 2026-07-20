"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Search, Leaf, Cpu, Database, Globe, Users, LogIn, UserPlus, ArrowLeft,
} from "lucide-react";

interface GuestProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
  maxMembers: number;
  memberCount: number;
  iconType: "leaf" | "cpu" | "database" | "globe";
  owner: string;
}

const GUEST_PROJECTS: GuestProject[] = [
  { id: "1", title: "Green Tech App", description: "פיתוח פתרונות ירוקים ואקולוגיים לייעול צריכת אנרגיה עירונית.", tags: ["Next.js", "React", "Eco-Tech"], maxMembers: 5, memberCount: 3, iconType: "leaf", owner: "גיא לוי" },
  { id: "2", title: "Creative AI Helper", description: "מערכת בינה מלאכותית ליצירת תכנים מותאמים אישית במהירות.", tags: ["AI", "ML", "Figma"], maxMembers: 4, memberCount: 1, iconType: "cpu", owner: "דניאל כהן" },
  { id: "3", title: "DataFlow Dashboard", description: "פלטפורמה להצגת נתונים ואנליטיקות מתקדמות בזמן אמת.", tags: ["Python", "Vue.js", "Data Science"], maxMembers: 6, memberCount: 2, iconType: "database", owner: "מיכל רז" },
  { id: "4", title: "ArtSphere Platform", description: "פלטפורמת מסחר מבוזרת ליצירות אמנות דיגיטליות.", tags: ["Web3", "Blockchain", "Design"], maxMembers: 5, memberCount: 4, iconType: "globe", owner: "אורן ברק" },
  { id: "5", title: "EduKibbutz", description: "מערכת לניהול קורסים ולמידה שיתופית בתוך הקהילה.", tags: ["React", "Firebase", "Education"], maxMembers: 4, memberCount: 1, iconType: "cpu", owner: "שירה מנדל" },
  { id: "6", title: "SmartFarm Monitor", description: "ניטור חקלאי חכם בזמן אמת באמצעות חיישנים ו-IoT.", tags: ["IoT", "Python", "Eco-Tech"], maxMembers: 3, memberCount: 2, iconType: "leaf", owner: "ניב גבע" },
  { id: "7", title: "Community Marketplace", description: "שוק קהילתי לחילופי שירותים ומוצרים בין חברי הקיבוץ.", tags: ["React", "Node.js", "UX"], maxMembers: 5, memberCount: 2, iconType: "globe", owner: "טל שמיר" },
  { id: "8", title: "HealthTrack Pro", description: "אפליקציה לניהול בריאות אישית וכושר גופני לחברי הקהילה.", tags: ["React Native", "Firebase", "Health"], maxMembers: 4, memberCount: 3, iconType: "cpu", owner: "נועה כץ" },
];

const ICON_BG: Record<string, string> = {
  leaf: "from-secondary/25 to-secondary/5 border-secondary/20",
  cpu: "from-primary/25 to-primary/5 border-primary/20",
  database: "from-accent/25 to-accent/5 border-accent/20",
  globe: "from-secondary/25 to-accent/10 border-secondary/20",
};

const ICON_COLOR: Record<string, string> = {
  leaf: "text-secondary", cpu: "text-primary",
  database: "text-accent", globe: "text-secondary",
};

function ProjectIcon({ type }: { type: GuestProject["iconType"] }) {
  const cls = `w-5 h-5 ${ICON_COLOR[type]}`;
  switch (type) {
    case "leaf": return <Leaf className={cls} />;
    case "cpu": return <Cpu className={cls} />;
    case "database": return <Database className={cls} />;
    case "globe": return <Globe className={cls} />;
  }
}

function GuestPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = GUEST_PROJECTS.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.includes(search) ||
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">

      {/* ─── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 glass-panel border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Logo — right (RTL start) */}
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_clean.png" alt="הקיבוץ" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-lg tracking-tight text-foreground">הקיבוץ</span>
          </div>

          {/* Auth buttons — left (RTL end) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/8 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              כניסה
            </button>
            <button
              onClick={() => router.push("/register")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              הרשמה חינם
            </button>
          </div>
        </div>
      </header>

      {/* ─── Hero ───────────────────────────────────────── */}
      <section className="border-b border-[var(--border)] bg-gradient-to-b from-background-subtle to-background">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            מצב תצוגה — הצטרף כדי להשתתף
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-tight text-foreground">
            הקהילה שבונה ביחד
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            קהילת יזמים, מפתחים ומעצבים. שתפו עדכונים, הציגו תיקי עבודות, והתחברו לאנשים שבונים דברים מגניבים.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => router.push("/register")}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              הצטרף לקיבוץ בחינם
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-2.5 rounded-xl border border-[var(--border)] text-foreground font-medium hover:bg-primary/5 transition-colors"
            >
              יש לי חשבון
            </button>
          </div>
        </div>
      </section>

      {/* ─── Showcase ───────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חפש בקהילה — תגיות, טכנולוגיות, אנשים..."
            className="w-full bg-card border border-[var(--border)] rounded-xl pr-9 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
          <span>{filtered.length} תיקי עבודות</span>
          <span>·</span>
          <span>48 חברים בקהילה</span>
          <span>·</span>
          <span>קהילה פעילה</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div
              key={p.id}
              onClick={() => router.push("/register")}
              className="group relative rounded-2xl border border-[var(--border)] bg-card hover:border-[var(--card-hover-border)] hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
            >
              {/* Cover gradient */}
              <div className={`h-20 bg-gradient-to-br ${ICON_BG[p.iconType]} border-b border-[var(--border)]`} />

              <div className="p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${ICON_BG[p.iconType]} border flex items-center justify-center flex-shrink-0`}>
                    <ProjectIcon type={p.iconType} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{p.owner}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                  {p.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {p.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 border border-[var(--border)] text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {p.memberCount}/{p.maxMembers} חברים
                  </span>
                  <span className="text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity text-[11px]">
                    הצטרף ←
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-bold mb-2 text-foreground">רוצה להצטרף לקהילה?</h2>
          <p className="text-muted-foreground text-sm mb-5">
            הרשמה חינמית — שתפו, הציגו תיקי עבודות, והתחברו לאנשים
          </p>
          <button
            onClick={() => router.push("/register")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            הצטרף לקיבוץ
          </button>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useEffect(() => {
    if (isAuthenticated || process.env.NEXT_PUBLIC_DEV_BYPASS === "true") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated || process.env.NEXT_PUBLIC_DEV_BYPASS === "true") return null;
  return <GuestPage />;
}
