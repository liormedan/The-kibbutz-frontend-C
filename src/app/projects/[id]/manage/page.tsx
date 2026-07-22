"use client";

/**
 * הקיבוץ – עמוד ניהול פרויקט ליזם
 * /projects/[id]/manage
 *
 * מרכז עבור היזם: צפייה במועמדויות שהתקבלו, פרטי מועמדות בודדת,
 * אישור/דחייה, וסטטוס פנימי גמיש למעקב (TODO backend: persist internal stage).
 */

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  MessageSquare,
  Settings,
  Users,
  X,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { fetchApplications, fetchProject, respondToApplication } from "@/services/project.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useProjectStore } from "@/store/useProjectStore";
import type { Project } from "@/types/project.types";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const MOCK_PROJECT: Project = {
  id: "mock-project",
  title: "EcoTech Platform",
  description: "",
  tags: ["React", "Python"],
  maxMembers: 5,
  members: ["user-1"],
  memberRoles: {},
  projectMembers: [],
  owner: { id: "user-1", name: "גיא לוי", avatar: "" },
  iconType: "leaf",
  statusText: "פעיל",
  status: "open",
  isPromoted: true,
  comments: [],
  media: [],
  createdAt: "2026-05-01",
};

const MOCK_APPLICATIONS = [
  {
    id: "a1",
    projectId: "mock-project",
    userId: "u2",
    userName: "מיכל כהן",
    userAvatar: "",
    userRole: "מפתחת Full Stack",
    message:
      "יש לי 3 שנים ניסיון ב-React ו-Node.js. אשמח מאוד לעבוד על פרויקט שיש לו אימפקט סביבתי, וזמינה להשקיע כ-10 שעות שבועיות.",
    requestedRole: "מפתח Backend",
    status: "pending" as const,
    createdAt: "2026-06-04",
  },
  {
    id: "a2",
    projectId: "mock-project",
    userId: "u3",
    userName: "רוני לביא",
    userAvatar: "",
    userRole: "מעצב/ת UX",
    message: "מתמחה בעיצוב מוצרים ייעודיים, עבדתי על 4 פרויקטים בקנה מידה דומה.",
    requestedRole: "מעצב UI/UX",
    status: "pending" as const,
    createdAt: "2026-06-03",
  },
];

// סטטוסים פנימיים גמישים לניהול היזם — בנפרד מהסטטוס הגלוי למועמד (pending/accepted/rejected).
// TODO backend: יש להוסיף שדה internalStage לסכמת Application לשמירה מתמשכת.
type InternalStage = "new" | "in_review" | "awaiting_nda" | "done";

const INTERNAL_STAGE_LABELS: Record<InternalStage, string> = {
  new: "חדש",
  in_review: "בבדיקה",
  awaiting_nda: "ממתין ל-NDA",
  done: "הסתיים",
};

const STATUS_BADGE: Record<"pending" | "accepted" | "rejected", { label: string; className: string }> = {
  pending: { label: "ממתין", className: "bg-amber-50 text-amber-600 border border-amber-200" },
  accepted: { label: "אושר", className: "bg-green-50 text-green-600 border border-green-200" },
  rejected: { label: "נדחה", className: "bg-red-50 text-red-500 border border-red-200" },
};

export default function ManageProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const currentUser = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const storeProject = useProjectStore(state => state.selectedProject);
  const storeApplications = useProjectStore(state => state.applications);
  const isDevBypass = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";

  const [fetchFailed, setFetchFailed] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [internalStages, setInternalStages] = useState<Record<string, InternalStage>>({});

  useEffect(() => {
    if (isDevBypass || !token) return;
    void Promise.all([fetchProject(id), fetchApplications(id)]).catch(() => setFetchFailed(true));
  }, [id, isDevBypass, token]);

  const useMock = isDevBypass || !token || fetchFailed;
  const project = useMemo(
    () => (useMock ? { ...MOCK_PROJECT, id } : (storeProject as unknown as Project | null)),
    [useMock, id, storeProject]
  );
  const applications = useMock
    ? MOCK_APPLICATIONS
    : storeApplications.filter(a => a.projectId === id);

  const currentUserId = currentUser?.id ?? "user-1";
  const isOwner = !project || project.owner.id === currentUserId;

  function getStage(appId: string, fallbackStatus: "pending" | "accepted" | "rejected"): InternalStage {
    if (internalStages[appId]) return internalStages[appId];
    return fallbackStatus === "accepted" || fallbackStatus === "rejected" ? "done" : "new";
  }

  function setStage(appId: string, stage: InternalStage) {
    setInternalStages(current => ({ ...current, [appId]: stage }));
  }

  async function handleRespond(appId: string, accept: boolean) {
    setRespondingId(appId);
    try {
      if (!useMock) {
        await respondToApplication(appId, accept);
      }
      setStage(appId, "done");
    } finally {
      setRespondingId(null);
    }
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-background p-6" dir="rtl">
        <EmptyState
          icon={<Settings className="h-8 w-8 text-primary" />}
          title="הפרויקט לא נמצא"
          description="לא ניתן לטעון את עמוד הניהול."
          action={<button type="button" onClick={() => router.back()} className="rounded-xl bg-primary px-5 py-2.5 text-sm text-white">חזרה</button>}
        />
      </main>
    );
  }

  if (!isOwner) {
    return (
      <main className="min-h-screen bg-background p-6" dir="rtl">
        <EmptyState
          icon={<Settings className="h-8 w-8 text-primary" />}
          title="אין הרשאת גישה"
          description="עמוד זה מיועד ליזם הפרויקט בלבד."
          action={<button type="button" onClick={() => router.push(`/projects/${id}`)} className="rounded-xl bg-primary px-5 py-2.5 text-sm text-white">חזרה לעמוד הפרויקט</button>}
        />
      </main>
    );
  }

  const pendingCount = applications.filter(a => a.status === "pending").length;

  return (
    <main className="min-h-screen bg-background p-4 pb-10 md:p-6" dir="rtl">
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={() => router.push(`/projects/${id}`)} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronRight className="h-4 w-4" />
          חזרה לעמוד הפרויקט
        </button>

        <header className="glass-panel mb-5 flex items-center justify-between rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ניהול פרויקט · {project.title}</h1>
              <p className="text-xs text-muted-foreground">צפייה במועמדויות שהתקבלו, פרטים מלאים, ואישור/דחייה</p>
            </div>
          </div>
          {pendingCount > 0 && (
            <span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-white">{pendingCount} ממתינות</span>
          )}
        </header>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 px-1 text-sm font-bold text-foreground">
            <Users className="h-4 w-4 text-primary" />
            מועמדויות שהתקבלו ({applications.length})
          </h2>

          {applications.length === 0 ? (
            <EmptyState
              icon={<Users className="h-8 w-8 text-primary" />}
              title="אין מועמדויות עדיין"
              description="כשמשתמשים יגישו מועמדות לפרויקט זה, הן יופיעו כאן."
            />
          ) : (
            applications.map(app => {
              const badge = STATUS_BADGE[app.status];
              const isExpanded = expandedId === app.id;
              const stage = getStage(app.id, app.status);
              return (
                <div key={app.id} className="glass-card rounded-2xl border border-border p-5 transition-all">
                  <button type="button" onClick={() => setExpandedId(isExpanded ? null : app.id)} className="flex w-full items-start gap-3 text-right">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                      {app.userName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{app.userName}</p>
                        <span className="rounded-lg bg-accent/10 px-2 py-0.5 text-xs font-medium text-foreground">{app.requestedRole}</span>
                        <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{app.userRole} · הוגש ב-{app.createdAt}</p>
                    </div>
                    <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {isExpanded && (
                    <div className="mt-4 space-y-4 border-t border-border pt-4">
                      <div>
                        <p className="mb-1 text-xs font-semibold text-muted-foreground">הודעה למייסד</p>
                        <p className="rounded-xl bg-primary/5 p-3 text-sm leading-6 text-foreground">{app.message || "לא נשלחה הודעה."}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <a href={`/profile/${app.userId}`} className="text-xs font-medium text-primary hover:underline">צפייה בפרופיל המלא</a>
                        <button type="button" onClick={() => router.push(`/messages?userId=${encodeURIComponent(app.userId)}`)} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                          <MessageSquare className="h-3.5 w-3.5" />
                          פתח שיחה
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">שלב פנימי לניהול:</span>
                        <select
                          value={stage}
                          onChange={event => setStage(app.id, event.target.value as InternalStage)}
                          className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-primary"
                        >
                          {(Object.keys(INTERNAL_STAGE_LABELS) as InternalStage[]).map(key => (
                            <option key={key} value={key}>{INTERNAL_STAGE_LABELS[key]}</option>
                          ))}
                        </select>
                        <span className="text-[10px] text-muted-foreground">(נראה ליזם בלבד, לא נשמר עדיין בבקאנד)</span>
                      </div>

                      {app.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={respondingId === app.id}
                            onClick={() => void handleRespond(app.id, true)}
                            className="flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                          >
                            {respondingId === app.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            אשר מועמדות
                          </button>
                          <button
                            type="button"
                            disabled={respondingId === app.id}
                            onClick={() => void handleRespond(app.id, false)}
                            className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-500 disabled:opacity-60"
                          >
                            <X className="h-3.5 w-3.5" />
                            דחה
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>

        <section className="mt-8 glass-card rounded-2xl border border-border p-5">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
            <Award className="h-4 w-4 text-accent" />
            פעולות נוספות
          </h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => router.push(`/projects/${id}`)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-primary hover:text-primary">חזרה לעמוד הפרויקט הציבורי</button>
          </div>
        </section>
      </div>
    </main>
  );
}
