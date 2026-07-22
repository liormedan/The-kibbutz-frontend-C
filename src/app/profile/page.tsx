"use client";

/**
 * הקיבוץ – Profile Page
 * נתיב: /profile
 * TODO backend:
 *   GET  /users/me           → profile data
 *   PATCH /users/me          → update profile
 *   GET  /users/me/projects  → created + joined projects
 *   GET  /users/me/badges    → success badges
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Edit2, Check, X, Plus, Award, Briefcase, Users, Link as LinkIcon, Loader2 } from "lucide-react";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";
import { fetchBadges, fetchCurrentUser, fetchMyProjects, updateProfile as updateProfileService } from "@/services/user.service";
import { useUserStore } from "@/store/useUserStore";
import type { SuccessBadge, UserProfile, UserProject } from "@/store/useUserStore";
import DevDataToggle from "@/components/DevDataToggle";
import { useDemoMode } from "@/lib/dev/demoMode";
import { DEMO_BADGES, DEMO_USER_PROJECTS, demoProfile } from "@/lib/dev/fixtures";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type ExpLevel = "1-2" | "3-5" | "5+";
type ProfileTab = "skills" | "projects" | "badges";
interface Skill { name: string; level: ExpLevel; }

const EXP_LABELS: Record<ExpLevel, string> = { "1-2": "1–2 שנ'", "3-5": "3–5 שנ'", "5+": "5+ שנ'" };
const EXP_COLORS: Record<ExpLevel, string> = {
  "1-2": "rgba(209,152,71,0.15)",
  "3-5": "rgba(121,155,75,0.15)",
  "5+":  "rgba(210,100,45,0.15)"
};
const EXP_TEXT: Record<ExpLevel, string> = { "1-2": "#b8832e", "3-5": "#4a6e1f", "5+": "#a34e29" };

function normalizeExpLevel(level: string): ExpLevel {
  if (level === "ONE_TO_TWO") return "1-2";
  if (level === "THREE_TO_FIVE") return "3-5";
  if (level === "FIVE_PLUS") return "5+";
  return level as ExpLevel;
}

export default function ProfilePage() {
  const profile = useUserStore(state => state.profile);
  const badges = useUserStore(state => state.badges);
  const projects = useUserStore(state => state.projects);
  const isLoadingProfile = useUserStore(state => state.isLoadingProfile);
  const setProjects = useUserStore(state => state.setProjects);
  const setLoadingProjects = useUserStore(state => state.setLoadingProjects);
  const [demo, toggleDemo] = useDemoMode("profile");

  useEffect(() => {
    void fetchCurrentUser();
    void fetchBadges();
    setLoadingProjects(true);
    void fetchMyProjects()
      .then(({ owned, joined }) => {
        setProjects([
          ...owned.map(project => ({
            id: project.id,
            title: project.title,
            role: "owner" as const,
            status: project.status.toLowerCase() === "closed" ? "closed" as const : "open" as const,
            tags: project.tags,
            createdAt: project.createdAt,
          })),
          ...joined.map(project => ({
            id: project.id,
            title: project.title,
            role: "member" as const,
            status: project.status.toLowerCase() === "closed" ? "closed" as const : "open" as const,
            tags: project.tags,
            createdAt: project.createdAt,
          })),
        ]);
      })
      .catch(() => setProjects([]))
      .finally(() => setLoadingProjects(false));
  }, [setLoadingProjects, setProjects]);

  if (isLoadingProfile || !profile) {
    return <ProfileSkeleton />;
  }

  // A profile with no bio, role, skills, badges or projects renders an almost
  // blank page, so demo mode fills it in to review the layout. The key remounts
  // ProfileContent on toggle — its form state is seeded from these props.
  const bare = profileIsBare(profile, badges, projects);
  const useDemo = demo && bare;
  return (
    <ProfileContent
      key={useDemo ? "demo" : "real"}
      profile={useDemo ? demoProfile(profile) : profile}
      badges={useDemo ? DEMO_BADGES : badges}
      projects={useDemo ? DEMO_USER_PROJECTS : projects}
      demo={demo}
      onToggleDemo={toggleDemo}
      bare={bare}
    />
  );
}

/** True when the profile carries none of the content the page is built to show. */
function profileIsBare(p: UserProfile, badges: SuccessBadge[], projects: UserProject[]) {
  return !p.bio?.trim() && !p.role?.trim() && p.skills.length === 0
    && badges.length === 0 && projects.length === 0;
}

function ProfileContent({
  profile,
  badges,
  projects,
  demo,
  onToggleDemo,
  bare,
}: {
  profile: UserProfile;
  badges: SuccessBadge[];
  projects: UserProject[];
  demo: boolean;
  onToggleDemo: () => void;
  bare: boolean;
}) {
  const router = useRouter();
  const { t, dir } = useI18n();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("skills");

  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [role, setRole] = useState(profile.role ?? "");
  const [links, setLinks] = useState(profile.links ?? "");
  const [skills, setSkills] = useState<Skill[]>(
    profile.skills.map(skill => ({ ...skill, level: normalizeExpLevel(skill.level) }))
  );
  const [skillInput, setSkillInput] = useState("");
  const [skillLevel, setSkillLevel] = useState<ExpLevel>("1-2");

  // A profile with no name would render a blank heading over a blank avatar,
  // which reads as a broken card rather than as missing data.
  const shownName = name.trim() || t("guest");

  const addSkill = () => {
    const n = skillInput.trim();
    if (!n || skills.find(s => s.name === n)) return;
    setSkills(p => [...p, { name: n, level: skillLevel }]);
    setSkillInput("");
  };

  // item 16 – feedback after save: success toast + specific error message
  async function handleSave() {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await updateProfileService({ name, bio, role, links, skills });
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : t("profileSaveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6" dir={dir}>
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <ChevronRight className="w-4 h-4" />
            {t("profileBack")}
          </button>
          <DevDataToggle enabled={demo} onToggle={onToggleDemo} hasRealData={!bare} />
        </div>

        {/* Profile Card */}
        <div className="glass-panel rounded-2xl p-6 border border-[var(--border)] mb-5"
          style={{ background: "linear-gradient(145deg, rgba(247,244,237,0.9), rgba(250,247,240,0.8))" }}>

          {/* Avatar + Edit */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center text-2xl font-bold text-primary">
                {shownName.charAt(0)}
              </div>
              <div>
                {editing ? (
                  <input value={name} onChange={e => setName(e.target.value)}
                    className="text-xl font-bold bg-transparent border-b border-primary focus:outline-none text-foreground mb-1 w-48" />
                ) : (
                  <h1 className="text-xl font-bold text-foreground">{shownName}</h1>
                )}
                {editing ? (
                  <input value={role} onChange={e => setRole(e.target.value)}
                    className="text-sm bg-transparent border-b border-border focus:outline-none text-muted-foreground w-48" placeholder={t("profileRolePlaceholder")} />
                ) : (
                  <p className="text-sm text-muted-foreground">{role}</p>
                )}
              </div>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="p-2 rounded-xl border border-[var(--border)] text-muted-foreground hover:text-red-400 cursor-pointer transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold cursor-pointer transition-all disabled:opacity-60">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {t("profileSaveBtn")}
                </button>
              </div>
            ) : saveSuccess ? (
              <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/10 text-secondary text-sm font-medium">
                <Check className="w-3.5 h-3.5" />
                {t("profileSavedSuccess")}
              </span>
            ) : (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] text-sm text-muted-foreground hover:text-primary hover:border-primary cursor-pointer transition-all">
                <Edit2 className="w-3.5 h-3.5" />
                {t("profileEditBtn")}
              </button>
            )}
            {/* item 16 – save error feedback */}
            {saveError && !editing && (
              <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{saveError}</p>
            )}
          </div>

          {/* Bio */}
          <div className="mb-4">
            {editing ? (
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-background text-sm text-foreground focus:outline-none focus:border-primary resize-none transition-colors" />
            ) : (
              <p className="text-sm text-foreground leading-relaxed">{bio}</p>
            )}
          </div>

          {/* Links */}
          {(links || editing) && (
            <div className="flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5 text-primary" />
              {editing ? (
                <input value={links} onChange={e => setLinks(e.target.value)}
                  className="flex-1 text-sm bg-transparent border-b border-border focus:outline-none text-primary" dir="ltr" placeholder="https://..." />
              ) : (
                <a href={links} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate" dir="ltr">{links}</a>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[var(--border)]">
            {[
              { icon: <Briefcase className="w-4 h-4" />, value: projects.filter(p => p.role === "owner").length, label: t("profileStatCreated") },
              { icon: <Users className="w-4 h-4" />, value: projects.filter(p => p.role === "member").length, label: t("profileStatJoined") },
              { icon: <Award className="w-4 h-4" />, value: badges.length, label: t("profileStatBadges") },
            ].map((stat, i) => (
              <div key={i} className="text-center p-3 rounded-xl" style={{ background: "rgba(210,100,45,0.06)" }}>
                <div className="flex justify-center text-primary mb-1">{stat.icon}</div>
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: "var(--muted)" }}>
          {[["skills", t("profileSkillsTab")], ["projects", t("profileProjectsTab")], ["badges", t("profileBadgesTab")]] .map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id as ProfileTab)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === id ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Skills Tab ── */}
        {activeTab === "skills" && (
          <div className="glass-panel rounded-2xl p-6 border border-[var(--border)]">
            {editing && (
              <div className="flex gap-2 mb-4">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder={t("profileAddSkillPlaceholder")}
                  className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-background text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
                <select value={skillLevel} onChange={e => setSkillLevel(e.target.value as ExpLevel)}
                  className="px-3 py-2 rounded-xl border border-[var(--border)] bg-background text-sm cursor-pointer">
                  {(Object.entries(EXP_LABELS) as [ExpLevel,string][]).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button type="button" onClick={addSkill}
                  className="p-2 rounded-xl bg-primary text-white cursor-pointer"><Plus className="w-4 h-4" /></button>
              </div>
            )}
            <div className="space-y-2">
              {skills.map((sk, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: EXP_COLORS[sk.level], border: `1px solid ${EXP_TEXT[sk.level]}30` }}>
                  <span className="text-sm font-semibold text-foreground">{sk.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(255,255,255,0.6)", color: EXP_TEXT[sk.level] }}>
                      {EXP_LABELS[sk.level]}
                    </span>
                    {editing && (
                      <button onClick={() => setSkills(p => p.filter((_,j)=>j!==i))}
                        className="text-muted-foreground hover:text-red-400 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {skills.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">{t("profileNoSkills")}</p>}
            </div>
          </div>
        )}

        {/* ── Projects Tab ── */}
        {activeTab === "projects" && (
          <div className="space-y-3">
            {projects.map(proj => (
              <div key={proj.id} className="glass-panel rounded-xl p-4 border border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{proj.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${proj.status === "open" ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}>
                      {proj.status === "open" ? t("profileStatusOpen") : t("profileStatusClosed")}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {proj.tags.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-hover font-medium">{t}</span>
                    ))}
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${proj.role === "owner" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {proj.role === "owner" ? t("profileRoleOwner") : t("profileRoleMember")}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Badges Tab ── */}
        {activeTab === "badges" && (
          <div className="space-y-3">
            {badges.map(badge => (
              <div key={badge.id} className="glass-panel rounded-xl p-5 border border-[var(--border)] flex items-center gap-4"
                style={{ background: "linear-gradient(135deg, rgba(210,100,45,0.06), rgba(209,152,71,0.06))" }}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{badge.projectName}</p>
                  <p className="text-xs text-muted-foreground">{t("profileApprovedBy", { name: badge.entrepreneurName })}</p>
                  <p className="text-xs text-muted-foreground">{new Date(badge.approvedAt).toLocaleDateString("he-IL")}</p>
                </div>
                <span className="mr-auto text-xs px-3 py-1 rounded-full font-semibold"
                  style={{ background: "rgba(210,100,45,0.1)", color: "#a34e29" }}>
                  {t("profileCompletedSuccess")}
                </span>
              </div>
            ))}
            {badges.length === 0 && (
              <div className="glass-panel rounded-xl p-8 text-center border border-[var(--border)]">
                <Award className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t("profileNoBadges")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
