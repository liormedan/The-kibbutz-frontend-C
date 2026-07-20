"use client";

import { use, useEffect, useMemo, useState } from "react";
import { Award, Bookmark, BookmarkCheck, ChevronRight, Clock, Eye, FileText, Globe, Info, Leaf, Loader2, Lock, Send, Settings, UserPlus, X, Edit2, Trash2, Plus, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import ApplyModal from "@/components/ApplyModal";
import EmptyState from "@/components/EmptyState";
import MarkSuccessModal from "@/components/MarkSuccessModal";
import ReportModal from "@/components/ReportModal";
import EditProjectModal from "@/components/EditProjectModal";
import { addComment, closeProject, fetchProject, leaveProject, uploadProjectMedia, removeProjectMedia } from "@/services/project.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useProjectStore } from "@/store/useProjectStore";
import type { Project } from "@/types/project.types";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type ActiveTab = "about" | "roles" | "members" | "discussion";

const COMMITMENT_LABEL_KEY: Record<string, string> = {
  low: "projCommitmentLow",
  medium: "projCommitmentMedium",
  high: "projCommitmentHigh",
};
const COMMITMENT_COLOR: Record<string, string> = {
  low: "bg-green-50 text-green-600 border-green-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  high: "bg-red-50 text-red-500 border-red-200",
};

const MOCK_PROJECT: Project = {
  id: "mock-project",
  title: "EcoTech Platform",
  description: "פלטפורמה חכמה לצמצום פליטות פחמן בבתים ובעסקים באמצעות AI, ניתוח נתונים וחיבור לקהילה מקומית.",
  tags: ["React", "Python", "AI", "Sustainability"],
  maxMembers: 5,
  members: ["user-1", "user-2", "user-3"],
  memberRoles: { "user-1": "יזם", "user-2": "פיתוח Backend", "user-3": "עיצוב מוצר" },
  projectMembers: [],
  owner: { id: "user-1", name: "גיא לוי", avatar: "" },
  iconType: "leaf",
  statusText: "פעיל",
  status: "open",
  isPromoted: true,
  comments: [
    { id: "c1", userId: "user-2", userName: "מיכל כהן", userAvatar: "", text: "הכיוון הוויזואלי נראה מצוין. אשמח להשתלב.", createdAt: "2026-06-01" },
  ],
  coverImageUrl: "https://picsum.photos/800/450?random=1",
  websiteUrl: "https://example.com",
  visualUrl: "https://www.figma.com/",
  media: [
    { id: "m1", type: "image", name: "מסך ראשי", url: "https://picsum.photos/800/450?random=1", sortOrder: 0 },
    { id: "m2", type: "image", name: "ארכיטקטורה", url: "https://picsum.photos/800/450?random=2", sortOrder: 1 },
    { id: "m3", type: "image", name: "UX Flow", url: "https://picsum.photos/800/450?random=3", sortOrder: 2 },
  ],
  createdAt: "2026-05-01",
  commitmentLevel: "medium",
  openRoles: [
    {
      id: "r1",
      projectId: "mock-project",
      title: "מפתח Backend",
      description: "אחריות על שרת Node.js/Python, API GraphQL וחיבור למסד נתונים. ניסיון של שנתיים לפחות.",
      requiredSkills: ["Node.js", "GraphQL", "PostgreSQL", "Docker"],
      slots: 2,
      filledSlots: 0,
      status: "open",
    },
    {
      id: "r2",
      projectId: "mock-project",
      title: "מעצב UI/UX",
      description: "עיצוב ממשקי משתמש ב-Figma, בניית Design System, ושיתוף פעולה צמוד עם הפיתוח.",
      requiredSkills: ["Figma", "Design Systems", "UX Research"],
      slots: 1,
      filledSlots: 0,
      status: "open",
    },
    {
      id: "r3",
      projectId: "mock-project",
      title: "מומחה נתונים / Data Analyst",
      description: "ניתוח נתוני פחמן, בניית דשבורדים ואינטגרציה עם מקורות מידע חיצוניים.",
      requiredSkills: ["Python", "pandas", "SQL", "Tableau"],
      slots: 1,
      filledSlots: 1,
      status: "filled",
    },
  ],
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t, dir } = useI18n();
  const currentUser = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const storeProject = useProjectStore(state => state.selectedProject);
  const isLoading = useProjectStore(state => state.isLoadingProject);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("about");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  // item 64 – close project confirmation
  const [confirmClose, setConfirmClose] = useState(false);
  // item 63 – recruiting vs active status toggle (local until backend)
  const [isRecruiting, setIsRecruiting] = useState(true);
  const isDevBypass = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";

  // item 34 – Save/Follow project (local until backend wired)
  const SAVED_KEY = `kibbutz-saved-projects`;
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
      return saved.includes(id);
    } catch { return false; }
  });

  const toggleSave = () => {
    const next = !isSaved;
    setIsSaved(next);
    try {
      const saved: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
      const updated = next ? [...saved, id] : saved.filter(x => x !== id);
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      // TODO backend: call saveProject(id) / unsaveProject(id)
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (isDevBypass || !token) return;
    void fetchProject(id).catch(() => setFetchFailed(true));
  }, [id, isDevBypass, token]);

  const project = useMemo(
    () => isDevBypass || !token || fetchFailed ? { ...MOCK_PROJECT, id } : storeProject as unknown as Project | null,
    [fetchFailed, id, isDevBypass, storeProject, token]
  );

  if (isLoading && token && !isDevBypass && !fetchFailed) return <ProjectSkeleton />;

  if (!project) {
    return (
      <main className="min-h-screen bg-background p-6" dir={dir}>
        <EmptyState
          icon={<FileText className="h-8 w-8 text-primary" />}
          title={t("projNotFound")}
          description={t("projNotFoundDesc")}
          action={<button type="button" onClick={() => router.back()} className="rounded-xl bg-primary px-5 py-2.5 text-sm text-white">{t("projBack")}</button>}
        />
      </main>
    );
  }

  const currentUserId = currentUser?.id ?? "user-1";
  const isOwner = project.owner.id === currentUserId;
  const isMember = project.members.includes(currentUserId);
  const isOpen = project.status === "open";
  const imageMedia = (project.media ?? []).filter(item => item.type === "image").sort((a, b) => a.sortOrder - b.sortOrder);
  const heroUrl = project.coverImageUrl ?? imageMedia[0]?.url;

  async function handleAddComment() {
    if (!comment.trim() || !project) return;
    setCommentLoading(true);
    try {
      await addComment(project.id, comment.trim(), {
        id: currentUserId,
        name: currentUser?.name ?? t("projMe"),
        avatar: currentUser?.avatar ?? "",
      });
      setComment("");
    } finally {
      setCommentLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background p-4 pb-10 md:p-6" dir={dir}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
            {t("projBack")}
          </button>
          {/* item 34 – Save/Follow button */}
          <button
            type="button"
            onClick={toggleSave}
            title={isSaved ? t("projUnsave") : t("projSaveProject")}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
              isSaved
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {isSaved
              ? <><BookmarkCheck className="h-4 w-4" />{t("projSaved")}</>
              : <><Bookmark className="h-4 w-4" />{t("projSaveProject")}</>
            }
          </button>
        </div>

        <header className="glass-panel mb-5 rounded-2xl border border-border p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Leaf className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
                <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">{project.statusText}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t("projCreatedBy", { name: project.owner.name })}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.map(tag => <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">{tag}</span>)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-5 lg:flex-row-reverse lg:items-start">
          <aside className="glass-card order-first rounded-2xl border border-border p-4 lg:sticky lg:top-5 lg:w-80 lg:shrink-0">
            <h2 className="mb-3 font-bold text-foreground">{t("projInAction")}</h2>
            {heroUrl ? (
              <button type="button" onClick={() => setLightboxUrl(heroUrl)} className="block w-full overflow-hidden rounded-xl">
                <img src={heroUrl} alt={project.title} className="aspect-video w-full object-cover transition-transform hover:scale-[1.02]" />
              </button>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-primary/5">
                <Leaf className="h-12 w-12 text-primary/30" />
              </div>
            )}

            <div className="mt-3 space-y-2">
              {project.websiteUrl && <ExternalAction href={project.websiteUrl} icon={<Globe className="h-4 w-4" />} label={t("projOpenSite")} />}
              {project.visualUrl && <ExternalAction href={project.visualUrl} icon={<Eye className="h-4 w-4" />} label={t("projViewDemo")} />}
            </div>

            {/* Gallery Section */}
            {(project.media && project.media.length > 0) && (
              <div className="mt-4">
                <h3 className="text-xs font-bold text-muted-foreground mb-2">{t("projGallery")}</h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {project.media.map(media => (
                    <div key={media.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                      <button type="button" onClick={() => setLightboxUrl(media.url)} className="w-full h-full block">
                        <img src={media.url} alt={media.name} className="w-full h-full object-cover transition-opacity group-hover:opacity-80" />
                      </button>
                      {isOwner && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(t("projConfirmDeleteImage"))) {
                              try {
                                await removeProjectMedia(project.id, media.id);
                              } catch (err) {
                                console.error("Failed to remove media:", err);
                              }
                            }
                          }}
                          className="absolute top-1 left-1 p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100 z-10"
                          title={t("projDeleteImage")}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload media button */}
            {isOwner && (
              <div className="mt-3">
                <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-xs font-semibold cursor-pointer hover:border-primary hover:text-primary transition-all bg-primary/5">
                  {mediaUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <Plus className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span>{mediaUploading ? t("projUploading") : t("projAddImageToGallery")}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={mediaUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setMediaUploading(true);
                      try {
                        await uploadProjectMedia(project.id, file);
                      } catch (err) {
                        console.error("Failed to upload media:", err);
                      } finally {
                        setMediaUploading(false);
                      }
                    }}
                  />
                </label>
              </div>
            )}

            <div className="mt-5 border-t border-border pt-4">
              {isOwner ? (
                <div className="space-y-2">
                  <button type="button" onClick={() => router.push(`/projects/${project.id}/manage`)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"><Settings className="h-4 w-4" />{t("projManageBtn")}</button>
                  <button type="button" onClick={() => setShowEditModal(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-all"><Edit2 className="h-4 w-4" />{t("projEditProject")}</button>
                  {/* item 63 – recruiting vs active toggle */}
                  <button
                    type="button"
                    onClick={() => setIsRecruiting(v => !v)}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                      isRecruiting
                        ? "border-secondary/30 bg-secondary/10 text-secondary hover:bg-secondary/20"
                        : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {isRecruiting ? t("projRecruitingActive") : t("projProjectActive")}
                  </button>
                  {/* item 64 – close project with confirmation */}
                  {confirmClose ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-2">
                      <p className="text-xs text-red-600 font-medium text-center">{t("projConfirmClose")}</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { void closeProject(project.id); setConfirmClose(false); }} className="flex-1 rounded-lg bg-red-500 text-white text-xs py-2 font-semibold">{t("projConfirmCloseYes")}</button>
                        <button type="button" onClick={() => setConfirmClose(false)} className="flex-1 rounded-lg border border-red-200 text-red-500 text-xs py-2">{t("projCancel")}</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setConfirmClose(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"><Lock className="h-4 w-4" />{t("projCloseProject")}</button>
                  )}
                  <button type="button" onClick={() => setShowSuccessModal(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm text-white"><Award className="h-4 w-4" />{t("projConfirmSuccess")}</button>
                </div>
              ) : isMember ? (
                <button type="button" onClick={() => void leaveProject(project.id, currentUserId)} className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm text-red-500">{t("projLeaveProject")}</button>
              ) : isOpen ? (
                <button type="button" data-testid="apply-btn" onClick={() => setShowApplyModal(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm text-white"><UserPlus className="h-4 w-4" />{t("projApply")}</button>
              ) : (
                <p className="rounded-xl bg-muted px-4 py-2.5 text-center text-sm text-muted-foreground">{t("projClosed")}</p>
              )}
              {!isOwner && (
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors py-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                  {t("projReport")}
                </button>
              )}
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            <div className="mb-4 flex gap-1 border-b border-border">
              {([
                ["about", t("projTabAbout")],
                ["roles", `${t("projTabRoles")}${project.openRoles?.filter(r => r.status === "open").length ? ` (${project.openRoles.filter(r => r.status === "open").length})` : ""}`],
                ["members", t("projTabMembers")],
                ["discussion", t("projTabDiscussion")],
              ] as const).map(([key, label]) => (
                <button type="button" key={key} onClick={() => setActiveTab(key)} className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${activeTab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{label}</button>
              ))}
            </div>

            {activeTab === "about" && (
              <div className="glass-card rounded-2xl p-5">
                <p className="text-sm leading-7 text-foreground">{project.description}</p>
                {project.commitmentLevel && (
                  <div className="mt-4 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{t("projCommitmentRequired")}</span>
                    <span className={`rounded-lg border px-2.5 py-0.5 text-xs font-medium ${COMMITMENT_COLOR[project.commitmentLevel]}`}>
                      {t(COMMITMENT_LABEL_KEY[project.commitmentLevel])}
                    </span>
                  </div>
                )}
                <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground"><Info className="h-3.5 w-3.5" />{t("projCreatedAt", { date: project.createdAt })}</div>
              </div>
            )}

            {/* item 31 – Open roles / דרושים section */}
            {activeTab === "roles" && (
              <div className="space-y-4">
                {(!project.openRoles || project.openRoles.length === 0) ? (
                  <div className="glass-card rounded-2xl p-6 text-center text-sm text-muted-foreground">
                    {t("projNoRoles")}
                  </div>
                ) : (
                  project.openRoles.map(role => {
                    const isFilled = role.status === "filled" || role.filledSlots >= role.slots;
                    return (
                      <div key={role.id} className={`glass-card rounded-2xl p-5 border ${isFilled ? "border-border opacity-70" : "border-primary/20"}`}>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <Zap className={`h-4 w-4 ${isFilled ? "text-muted-foreground" : "text-primary"}`} />
                            <h3 className="font-bold text-sm text-foreground">{role.title}</h3>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[10px] rounded-lg border px-2 py-0.5 font-semibold ${
                              isFilled
                                ? "bg-muted text-muted-foreground border-border"
                                : "bg-primary/10 text-primary border-primary/20"
                            }`}>
                              {isFilled ? t("projFilled") : t("projSlots", { count: role.slots - role.filledSlots })}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground leading-6 mb-3">{role.description}</p>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {role.requiredSkills.map(skill => (
                            <span key={skill} className="rounded-full bg-primary/8 px-2.5 py-1 text-xs text-primary font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>

                        {!isFilled && !isMember && isOpen && (
                          <button
                            type="button"
                            onClick={() => setShowApplyModal(true)}
                            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm text-white font-medium hover:opacity-90 transition-opacity"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            {t("projApplyRole")}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === "members" && (
              <div className="space-y-3">
                {project.members.map(memberId => (
                  <div key={memberId} className="glass-card flex items-center gap-3 rounded-2xl p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">{memberId[0]?.toUpperCase()}</div>
                    <div className="flex-1"><p className="text-sm font-semibold">{memberId === project.owner.id ? project.owner.name : memberId}</p><p className="text-xs text-muted-foreground">{project.memberRoles[memberId] ?? t("projTeamMember")}</p></div>
                    {memberId === project.owner.id && <Award className="h-4 w-4 text-accent" />}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "discussion" && (
              <div>
                <div className="glass-card mb-4 rounded-2xl p-4">
                  <textarea value={comment} onChange={event => setComment(event.target.value)} rows={3} placeholder={t("projCommentPlaceholder")} className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  <button type="button" onClick={() => void handleAddComment()} disabled={!comment.trim() || commentLoading} className="mt-2 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm text-white disabled:opacity-50">
                    {commentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{t("projSend")}
                  </button>
                </div>
                {project.comments.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">{t("projNoComments")}</p> : project.comments.map(item => (
                  <div key={item.id} className="glass-card mb-3 rounded-xl p-4">
                    <div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold">{item.userName}</p><span className="text-xs text-muted-foreground">{item.createdAt}</span></div>
                    <p className="text-sm leading-6 text-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setLightboxUrl(null)}>
          <button type="button" onClick={() => setLightboxUrl(null)} className="absolute left-5 top-5 rounded-full bg-white/10 p-2 text-white"><X className="h-6 w-6" /></button>
          <img src={lightboxUrl} alt="תצוגת מדיה מוגדלת" className="max-h-[90vh] max-w-3xl rounded-xl object-contain" onClick={event => event.stopPropagation()} />
        </div>
      )}

      <ApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        projectId={project.id}
        projectTitle={project.title}
        openRoles={project.openRoles?.filter(r => r.status === "open").map(r => ({ id: r.id, title: r.title }))}
      />
      <MarkSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        projectId={project.id}
        projectTitle={project.title}
        members={project.members
          .filter(memberId => memberId !== project.owner.id)
          .map(memberId => ({
            id: memberId,
            name: memberId,
            role: project.memberRoles[memberId] ?? t("projTeamMember"),
          }))}
      />
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={project.owner.id}
        reportedName={project.owner.name}
      />
      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={project}
      />
    </main>
  );
}

function ExternalAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex w-full items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-all">
      {icon}{label}
    </a>
  );
}

function ProjectSkeleton() {
  const { dir } = useI18n();
  return (
    <main className="min-h-screen animate-pulse bg-background p-6" dir={dir}>
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="h-32 rounded-2xl bg-primary/10" />
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="h-96 rounded-2xl bg-primary/10" />
          <div className="h-96 rounded-2xl bg-primary/10" />
        </div>
      </div>
    </main>
  );
}
