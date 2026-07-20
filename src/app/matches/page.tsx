"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Cpu,
  Database,
  Globe,
  Leaf,
  MessageSquare,
  SlidersHorizontal,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import ApplyModal from "@/components/ApplyModal";
import EmptyState from "@/components/EmptyState";
import MatchCardSkeleton from "@/components/skeletons/MatchCardSkeleton";
import { fetchMatchingProjects, fetchMatchingUsers, type MatchedUser } from "@/services/matching.service";
import { fetchMyProjects } from "@/services/user.service";
import { useAuthStore } from "@/store/useAuthStore";
import type { Project, ProjectIconType } from "@/types/project.types";
import ComingSoonBanner from "@/components/ComingSoonBanner";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type ExpFilter = "all" | "1-2" | "3-5" | "5+";

const IconMap = {
  leaf: Leaf,
  cpu: Cpu,
  database: Database,
  globe: Globe,
};

function normalizeIcon(icon: string): ProjectIconType {
  return icon.toLowerCase() as ProjectIconType;
}

function normalizeExperience(level: string) {
  if (level === "ONE_TO_TWO") return "1-2";
  if (level === "THREE_TO_FIVE") return "3-5";
  if (level === "FIVE_PLUS") return "5+";
  return level;
}

export default function MatchesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const isEntrepreneur = user?.canCreateProjects ?? false;
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [matchedProjects, setMatchedProjects] = useState<Project[]>([]);
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyProject, setApplyProject] = useState<Project | null>(null);
  const [expFilter, setExpFilter] = useState<ExpFilter>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInitialMatches() {
      setLoading(true);
      setError("");
      try {
        if (isEntrepreneur) {
          const { owned } = await fetchMyProjects();
          setOwnedProjects(owned);
        } else {
          setMatchedProjects(await fetchMatchingProjects());
        }
      } catch {
        setError(t("miscLoadMatchesError"));
      } finally {
        setLoading(false);
      }
    }
    void loadInitialMatches();
  }, [isEntrepreneur]);

  async function handleSelectProject(projectId: string) {
    setSelectedProjectId(projectId);
    setMatchedUsers([]);
    setLoading(true);
    setError("");
    try {
      setMatchedUsers(await fetchMatchingUsers(projectId));
    } catch {
      setError(t("miscLoadUsersError"));
    } finally {
      setLoading(false);
    }
  }

  function dismiss(id: string) {
    setDismissedIds(previous => new Set([...previous, id]));
  }

  function handleInvite(userId: string) {
    router.push(`/messages?userId=${encodeURIComponent(userId)}`);
  }

  function handleApply(project: Project) {
    setApplyProject(project);
    setShowApplyModal(true);
  }

  const visibleProjects = useMemo(
    () => matchedProjects.filter(project => !dismissedIds.has(project.id)),
    [dismissedIds, matchedProjects]
  );

  const visibleUsers = useMemo(
    () => matchedUsers.filter(matchedUser => {
      if (dismissedIds.has(matchedUser.id)) return false;
      if (expFilter === "all") return true;
      return matchedUser.skills.some(skill => normalizeExperience(skill.level) === expFilter);
    }),
    [dismissedIds, expFilter, matchedUsers]
  );

  const expFilters: { key: ExpFilter; label: string }[] = [
    { key: "all", label: t("miscExpAll") },
    { key: "1-2", label: t("miscExp12") },
    { key: "3-5", label: t("miscExp35") },
    { key: "5+", label: t("miscExp5plus") },
  ];

  const visibleResults = isEntrepreneur ? visibleUsers : visibleProjects;

  return (
    <>
      <div className="mx-auto max-w-5xl p-4 md:p-6">
        <ComingSoonBanner feature={t("miscMatchesTitle")} className="mb-4" />
        <div className="mb-6 flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-[var(--primary)]" />
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">{t("miscMatchesTitle")}</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {isEntrepreneur ? t("miscMatchesSubtitleEntrepreneur") : t("miscMatchesSubtitleParticipant")}
            </p>
          </div>
        </div>

        {isEntrepreneur && (
          <div className="glass-card mb-5 rounded-xl p-4">
            <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">{t("miscSelectProjectLabel")}</label>
            <select
              value={selectedProjectId}
              onChange={event => void handleSelectProject(event.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="">{t("miscSelectProjectOption")}</option>
              {ownedProjects.map(project => <option key={project.id} value={project.id}>{project.title}</option>)}
            </select>
          </div>
        )}

        {isEntrepreneur && selectedProjectId && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[var(--muted-foreground)]" />
            {expFilters.map(filter => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setExpFilter(filter.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                  expFilter === filter.key
                    ? "bg-[var(--primary)] text-white"
                    : "bg-white/60 text-[var(--muted-foreground)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}

        {error && <p className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map(item => <MatchCardSkeleton key={item} variant={isEntrepreneur ? "user" : "project"} />)}
          </div>
        ) : isEntrepreneur && !selectedProjectId ? (
          <EmptyState
            icon={<Sparkles className="h-8 w-8 text-[var(--primary)]" />}
            title={t("miscSelectProjectOption")}
            description={t("miscSelectProjectEmptyDesc")}
          />
        ) : visibleResults.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-8 w-8 text-[var(--primary)]" />}
            title={t("miscNoMatchesTitle")}
            description={isEntrepreneur ? t("miscNoMatchesEntrepreneur") : t("miscNoMatchesParticipant")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isEntrepreneur
              ? visibleUsers.map(matchedUser => (
                  <div key={matchedUser.id} className="glass-card flex flex-col gap-3 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10 font-bold text-[var(--primary)]">
                        {matchedUser.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{matchedUser.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{matchedUser.role}</p>
                        {matchedUser.successCount > 0 && (
                          <span className="mt-1 flex items-center gap-1 text-xs font-medium text-[var(--accent)]">
                            <Award className="h-3 w-3" />
                            {t("miscSuccesses", { count: matchedUser.successCount })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedUser.skills.map(skill => (
                        <span key={skill.name} className="rounded-full bg-[var(--secondary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--secondary)]">
                          {skill.name} ({normalizeExperience(skill.level)})
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto flex flex-col gap-2 pt-1">
                      <button type="button" onClick={() => handleInvite(matchedUser.id)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white">
                        <MessageSquare className="h-4 w-4" />
                        {t("miscInviteToChat")}
                      </button>
                      <button type="button" onClick={() => dismiss(matchedUser.id)} className="py-1 text-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">{t("miscNotInterested")}</button>
                    </div>
                  </div>
                ))
              : visibleProjects.map(project => {
                  const ProjectIcon = IconMap[normalizeIcon(project.iconType)];
                  return (
                    <div key={project.id} className="glass-card flex flex-col gap-3 rounded-2xl p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                          <ProjectIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">{project.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{project.owner.name}</p>
                        </div>
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-[var(--muted-foreground)]">{project.description}</p>
                      <div className="flex flex-wrap gap-1">{project.tags.map(tag => <span key={tag} className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] text-[var(--primary)]">{tag}</span>)}</div>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                        <Users className="h-3.5 w-3.5" />
                        {t("miscMembersLabel")} {project.members.length}/{project.maxMembers}
                      </div>
                      <div className="mt-auto flex flex-col gap-2 pt-1">
                        <button type="button" onClick={() => handleApply(project)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white">
                          <UserPlus className="h-4 w-4" />
                          {t("miscApplyBtn")}
                        </button>
                        <button type="button" onClick={() => dismiss(project.id)} className="py-1 text-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">{t("miscNotInterested")}</button>
                      </div>
                    </div>
                  );
                })}
          </div>
        )}
      </div>

      <ApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        projectId={applyProject?.id ?? ""}
        projectTitle={applyProject?.title ?? ""}
      />
    </>
  );
}
