"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Leaf, Cpu, Database, Globe, Users, UserPlus, ArrowRight } from "lucide-react";
import ComingSoonBanner from "@/components/ComingSoonBanner";

interface PublicProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
  maxMembers: number;
  memberCount: number;
  iconType: "leaf" | "cpu" | "database" | "globe";
  owner: string;
}

const MOCK_PROJECTS: PublicProject[] = [
  { id: "1", title: "Green Tech App", description: "פיתוח פתרונות ירוקים ואקולוגיים לייעול צריכת אנרגיה עירונית בקיבוץ.", tags: ["Next.js", "React", "Eco-Tech"], maxMembers: 5, memberCount: 3, iconType: "leaf", owner: "גיא לוי" },
  { id: "2", title: "Creative AI Helper", description: "מערכת בינה מלאכותית ליצירת תכנים מותאמים אישית במהירות.", tags: ["AI", "ML", "Figma"], maxMembers: 4, memberCount: 1, iconType: "cpu", owner: "דניאל כהן" },
  { id: "3", title: "DataFlow Dashboard", description: "פלטפורמה להצגת נתונים ואנליטיקות מתקדמות בזמן אמת.", tags: ["Python", "Vue.js", "Data Science"], maxMembers: 6, memberCount: 2, iconType: "database", owner: "מיכל רז" },
  { id: "4", title: "ArtSphere Platform", description: "פלטפורמת מסחר מבוזרת ליצירות אמנות דיגיטליות.", tags: ["Web3", "Blockchain", "Design"], maxMembers: 5, memberCount: 4, iconType: "globe", owner: "אורן ברק" },
  { id: "5", title: "EduKibbutz", description: "מערכת לניהול קורסים ולמידה שיתופית בתוך הקהילה.", tags: ["React", "Firebase", "Education"], maxMembers: 4, memberCount: 1, iconType: "cpu", owner: "שירה מנדל" },
  { id: "6", title: "SmartFarm Monitor", description: "ניטור חקלאי חכם בזמן אמת באמצעות חיישנים ו-IoT.", tags: ["IoT", "Python", "Eco-Tech"], maxMembers: 3, memberCount: 2, iconType: "leaf", owner: "ניב גבע" },
];

const ICON_BG: Record<string, string> = {
  leaf: "bg-green-500/20 text-green-400",
  cpu: "bg-indigo-500/20 text-indigo-400",
  database: "bg-amber-500/20 text-amber-400",
  globe: "bg-blue-500/20 text-blue-400",
};

function renderIcon(type: PublicProject["iconType"]) {
  const cls = "w-5 h-5";
  switch (type) {
    case "leaf": return <Leaf className={cls} />;
    case "cpu": return <Cpu className={cls} />;
    case "database": return <Database className={cls} />;
    case "globe": return <Globe className={cls} />;
  }
}

export default function PublicProjectsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = MOCK_PROJECTS.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.includes(search) ||
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <img src="/logo_clean.png" alt="הקיבוץ" className="w-9 h-9 rounded-lg" />
            <span className="font-extrabold text-lg text-foreground">הקיבוץ</span>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            כניסה / הרשמה
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-10 text-center">
        <ComingSoonBanner feature="פרויקטים" className="mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
          פרויקטים קהילתיים פתוחים
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
          גלה פרויקטים שמחפשים חברים להצטרף, תרום את הכישורים שלך לקהילה.
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="חפש לפי שם, תיאור או טכנולוגיה..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pr-12 pl-4 py-3 rounded-xl bg-slate-900 border border-white/10 focus:border-primary focus:outline-none text-sm text-foreground placeholder-slate-500"
          />
        </div>
      </section>

      {/* Projects grid */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <p className="text-xs text-slate-500 mb-4">{filtered.length} פרויקטים</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(proj => {
            const isFull = proj.memberCount >= proj.maxMembers;
            return (
              <article
                key={proj.id}
                className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur flex flex-col overflow-hidden hover:border-primary/40 transition-colors"
              >
                {/* colored banner */}
                <div className={`h-2 w-full ${
                  proj.iconType === "leaf" ? "bg-green-500" :
                  proj.iconType === "cpu" ? "bg-indigo-500" :
                  proj.iconType === "database" ? "bg-amber-500" : "bg-blue-500"
                }`} />

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-xl ${ICON_BG[proj.iconType]}`}>
                      {renderIcon(proj.iconType)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Users className="w-3.5 h-3.5" />
                      {proj.memberCount}/{proj.maxMembers}
                    </div>
                  </div>

                  <h2 className="font-bold text-base text-foreground mb-1">{proj.title}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3 line-clamp-2 flex-1">{proj.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                    <span className="text-[11px] text-slate-500">מוביל: {proj.owner}</span>
                    <button
                      onClick={() => router.push("/login")}
                      disabled={isFull}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isFull
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                          : "bg-primary text-white hover:opacity-90"
                      }`}
                    >
                      {isFull ? "מלא" : <><UserPlus className="w-3.5 h-3.5" />הצטרף</>}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>לא נמצאו פרויקטים תואמים</p>
          </div>
        )}
      </section>

      {/* CTA footer */}
      <div className="border-t border-white/10 bg-slate-950/60 py-10 text-center">
        <p className="text-slate-400 mb-4">רוצה להקים פרויקט משלך?</p>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          הצטרף לקיבוץ בחינם
        </button>
      </div>
    </div>
  );
}
