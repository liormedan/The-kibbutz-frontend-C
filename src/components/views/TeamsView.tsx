"use client";
// הקיבוץ – Teams view (own route: /teams)
// Orphan domain (no backend yet) — shows a "coming soon" banner over a
// brand-styled preview of community teams.

import { Users } from "lucide-react";
import ComingSoonBanner from "@/components/ComingSoonBanner";
import { useI18n } from "@/lib/i18n/LanguageProvider";

interface TeamPreview {
  id: string;
  name: string;
  description: string;
  tags: string[];
  membersCount: number;
}

const TEAMS: TeamPreview[] = [
  { id: "t1", name: "צוות Green Tech", description: "פיתוח פתרונות אקולוגיים לייעול צריכת אנרגיה בקהילה.", tags: ["Eco-Tech", "IoT"], membersCount: 5 },
  { id: "t2", name: "צוות Creative AI", description: "יצירת תכנים חכמים בעזרת בינה מלאכותית.", tags: ["AI", "ML"], membersCount: 4 },
  { id: "t3", name: "צוות DataFlow", description: "הצגת נתונים ואנליטיקות בזמן אמת.", tags: ["Data", "Vue.js"], membersCount: 6 },
];

export default function TeamsView() {
  const { t, dir } = useI18n();
  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6" dir={dir}>
      <ComingSoonBanner feature={t("teams")} className="mb-4" />
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("teams")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("teamsSub")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TEAMS.map((team) => (
          <div key={team.id} className="glass-card flex flex-col justify-between rounded-2xl p-5 text-right">
            <div>
              <h3 className="mb-1 truncate text-base font-bold text-foreground">{team.name}</h3>
              <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{team.description}</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {team.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{tag}</span>
                ))}
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-4">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {t("teamMembers", { count: team.membersCount })}
              </span>
              <button
                disabled
                className="cursor-not-allowed rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary opacity-60"
              >
                {t("comingSoon")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
