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
  leaf: "from-green-500/30 to-green-600/10 border-green-500/20",
  cpu: "from-indigo-500/30 to-indigo-600/10 border-indigo-500/20",
  database: "from-amber-500/30 to-amber-600/10 border-amber-500/20",
  globe: "from-blue-500/30 to-blue-600/10 border-blue-500/20",
};

const ICON_COLOR: Record<string, string> = {
  leaf: "text-green-400", cpu: "text-indigo-400",
  database: "text-amber-400", globe: "text-blue-400",
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
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Logo — right (RTL start) */}
          <div className="flex items-center gap-2.5">
            <img src="/logo_clean.png" alt="הקיבוץ" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-lg tracking-tight">הקיבוץ</span>
          </div>

          {/* Auth buttons — left (RTL end) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              כניסה
            </button>
            <button
              onClick={() => router.push("/register")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-primary text-white hover:opacity-90 transition-opacity"
            >
              <UserPlus className="w-4 h-4" />
              הרשמה חינם
            </button>
          </div>
        </div>
      </header>

      {/* ─── Hero ───────────────────────────────────────── */}
      <section className="border-b border-white/5 bg-gradient-to-b from-slate-900 to-background">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            מצב תצוגה — הצטרף כדי להשתתף
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            מצא את הפרויקט הבא שלך
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
            קהילת יזמים, מפתחים ומעצבים שבונים ביחד. גלה פרויקטים, הצטרף לצוות, ובנה משהו מגניב.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => router.push("/register")}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
            >
              הצטרף לקיבוץ בחינם
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-2.5 rounded-xl border border-white/15 text-slate-300 font-medium hover:bg-white/5 transition-colors"
            >
              יש לי חשבון
            </button>
          </div>
        </div>
      </section>

      {/* ─── Feed ───────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חפש פרויקטים, תגיות, טכנולוגיות..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl pr-9 pl-4 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-6 mb-6 text-sm text-slate-500">
          <span>{filtered.length} פרויקטים פעילים</span>
          <span>·</span>
          <span>48 חברים בקהילה</span>
          <span>·</span>
          <span>12 פרויקטים הושלמו</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div
              key={p.id}
              onClick={() => router.push("/register")}
              className="group relative rounded-2xl border border-white/8 bg-slate-900/60 hover:bg-slate-900 hover:border-white/15 transition-all duration-200 cursor-pointer overflow-hidden"
            >
              {/* Cover gradient */}
              <div className={`h-20 bg-gradient-to-br ${ICON_BG[p.iconType]} border-b border-white/5`} />

              <div className="p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${ICON_BG[p.iconType]} border flex items-center justify-center flex-shrink-0`}>
                    <ProjectIcon type={p.iconType} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500">{p.owner}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                  {p.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {p.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {p.memberCount}/{p.maxMembers} חברים
                  </span>
                  <span className="text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity text-[11px]">
                    הצטרף ←
                  </span>
                </div>
              </div>

              {/* Blur overlay hint */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-bold mb-2">רוצה להצטרף לפרויקט?</h2>
          <p className="text-slate-400 text-sm mb-5">
            הרשמה חינמית — בחר תפקיד, הגש מועמדות, ובנה ביחד
          </p>
          <button
            onClick={() => router.push("/register")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
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
