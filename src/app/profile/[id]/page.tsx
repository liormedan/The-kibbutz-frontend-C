'use client';

/**
 * הקיבוץ – Other User Profile Page
 * נתיב: /profile/[id]
 */

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Check, Award, Briefcase, Users, Link as LinkIcon, Loader2, MessageSquare, UserPlus } from "lucide-react";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";
import { fetchUserById } from "@/services/user.service";
import {
  fetchMyConnections,
  fetchMyFollowing,
  fetchConnectionRequests,
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnectionRequest,
  followUser,
  unfollowUser
} from "@/services/connection.service";
import type { UserProfile } from "@/types/user.types";
import type { Project } from "@/types/project.types";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type ProfileTab = "skills" | "projects" | "badges";

const EXP_LABELS: Record<string, string> = { 
  "1-2": "1–2 שנ'", "3-5": "3–5 שנ'", "5+": "5+ שנ'",
  "ONE_TO_TWO": "1–2 שנ'", "THREE_TO_FIVE": "3–5 שנ'", "FIVE_PLUS": "5+ שנ'"
};

const EXP_COLORS: Record<string, string> = {
  "1-2": "rgba(209,152,71,0.15)", "ONE_TO_TWO": "rgba(209,152,71,0.15)",
  "3-5": "rgba(121,155,75,0.15)", "THREE_TO_FIVE": "rgba(121,155,75,0.15)",
  "5+":  "rgba(210,100,45,0.15)", "FIVE_PLUS": "rgba(210,100,45,0.15)"
};

const EXP_TEXT: Record<string, string> = { 
  "1-2": "#b8832e", "ONE_TO_TWO": "#b8832e",
  "3-5": "#4a6e1f", "THREE_TO_FIVE": "#4a6e1f",
  "5+": "#a34e29", "FIVE_PLUS": "#a34e29"
};

export default function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t, dir } = useI18n();
  const { id: userId } = use(params);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("skills");

  // Connection & Follow states
  const [isFollowing, setIsFollowing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingSentRequest, setPendingSentRequest] = useState(false);
  const [pendingReceivedRequest, setPendingReceivedRequest] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Projects state
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch other user's profile
      const userProfile = await fetchUserById(userId);
      setProfile(userProfile);

      // 2. Fetch connections & requests to determine relationship
      const [connections, following, requests] = await Promise.all([
        fetchMyConnections(),
        fetchMyFollowing(),
        fetchConnectionRequests(),
      ]);

      setIsConnected(connections.some(c => c.id === userId));
      setIsFollowing(following.some(f => f.id === userId));

      // Check for pending requests
      const sent = requests.find(r => r.status === "PENDING" && r.to.id === userId);
      const received = requests.find(r => r.status === "PENDING" && r.from.id === userId);
      
      setPendingSentRequest(!!sent);
      setPendingReceivedRequest(received ? received.id : null);

      // 3. Projects have no backend endpoint yet — see BACKEND_GAPS.md
      setLoadingProjects(true);
      setUserProjects([]);
      setLoadingProjects(false);
    } catch (err) {
      console.error("Error loading user profile details:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void Promise.resolve().then(loadProfileData);
  }, [loadProfileData]);

  const handleToggleFollow = async () => {
    setActionLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await followUser(userId);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendRequest = async () => {
    setActionLoading(true);
    try {
      await sendConnectionRequest(userId);
      setPendingSentRequest(true);
    } catch (err) {
      console.error("Error sending connection request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!pendingReceivedRequest) return;
    setActionLoading(true);
    try {
      await acceptConnectionRequest(pendingReceivedRequest);
      setIsConnected(true);
      setPendingReceivedRequest(null);
    } catch (err) {
      console.error("Error accepting connection request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!pendingReceivedRequest) return;
    setActionLoading(true);
    try {
      await declineConnectionRequest(pendingReceivedRequest);
      setPendingReceivedRequest(null);
    } catch (err) {
      console.error("Error declining connection request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartChat = () => {
    router.push(`/messages?userId=${userId}`);
  };

  if (loading || !profile) {
    return <ProfileSkeleton />;
  }

  const initials = profile.name.split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <div className="min-h-screen bg-background p-6" dir={dir}>
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 cursor-pointer transition-colors">
          <ChevronRight className="w-4 h-4" />
          {t("profileBack")}
        </button>

        {/* Profile Card */}
        <div className="glass-panel rounded-2xl p-6 border border-[var(--border)] mb-5"
          style={{ background: "linear-gradient(145deg, rgba(247,244,237,0.9), rgba(250,247,240,0.8))" }}>

          {/* Avatar + Title */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center text-2xl font-bold text-primary">
                {initials}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
                <p className="text-sm text-muted-foreground">{profile.role || t("profilePlatformUser")}</p>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleToggleFollow}
                disabled={actionLoading}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all border ${
                  isFollowing
                    ? "bg-primary/15 border-primary/30 text-primary hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                    : "bg-primary text-white border-primary hover:opacity-90"
                }`}
              >
                {isFollowing ? <><Check className="w-3.5 h-3.5" />{t("profileFollowing")}</> : <><UserPlus className="w-3.5 h-3.5" />{t("profileFollow")}</>}
              </button>

              {isConnected ? (
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  {t("profileConnected")}
                </span>
              ) : pendingSentRequest ? (
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 text-sm font-semibold">
                  {t("profileRequestSent")}
                </span>
              ) : pendingReceivedRequest ? (
                <div className="flex gap-1.5">
                  <button
                    onClick={handleAcceptRequest}
                    disabled={actionLoading}
                    className="px-3 py-2 rounded-xl bg-secondary text-white text-sm font-semibold hover:opacity-90 cursor-pointer"
                  >
                    {t("profileAcceptRequest")}
                  </button>
                  <button
                    onClick={handleDeclineRequest}
                    disabled={actionLoading}
                    className="px-3 py-2 rounded-xl border border-[var(--border)] text-muted-foreground hover:bg-red-50 hover:text-red-500 cursor-pointer"
                  >
                    {t("profileDecline")}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSendRequest}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-muted-foreground hover:text-primary hover:border-primary cursor-pointer transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {t("profileSendRequest")}
                </button>
              )}

              <button
                onClick={handleStartChat}
                className="flex items-center justify-center p-2 rounded-xl border border-[var(--border)] text-muted-foreground hover:text-primary hover:border-primary cursor-pointer transition-colors"
                title={t("profileOpenChat")}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-4">
            <p className="text-sm text-foreground leading-relaxed">{profile.bio || t("profileNoBio")}</p>
          </div>

          {/* Links */}
          {profile.links && (
            <div className="flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5 text-primary" />
              <a href={profile.links} target="_blank" rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate" dir="ltr">{profile.links}</a>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[var(--border)]">
            {[
              { icon: <Briefcase className="w-4 h-4" />, value: userProjects.filter(p => p.owner.id === userId).length, label: t("profileStatCreatedOther") },
              { icon: <Users className="w-4 h-4" />, value: userProjects.filter(p => p.owner.id !== userId).length, label: t("profileStatJoinedOther") },
              { icon: <Award className="w-4 h-4" />, value: profile.successCount, label: t("profileStatBadges") },
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
          {[["skills", t("profileSkillsTab")], ["projects", t("profileProjectsTab")], ["badges", t("profileBadgesTab")]].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id as ProfileTab)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === id ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Skills Tab ── */}
        {activeTab === "skills" && (
          <div className="glass-panel rounded-2xl p-6 border border-[var(--border)]">
            <div className="space-y-2">
              {profile.skills.map((sk, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: EXP_COLORS[sk.level] || "rgba(210,100,45,0.06)", border: `1px solid ${EXP_TEXT[sk.level] || "#d2642d"}30` }}>
                  <span className="text-sm font-semibold text-foreground">{sk.name}</span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(255,255,255,0.6)", color: EXP_TEXT[sk.level] || "#d2642d" }}>
                    {EXP_LABELS[sk.level] || sk.level}
                  </span>
                </div>
              ))}
              {profile.skills.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">{t("profileNoSkills")}</p>}
            </div>
          </div>
        )}

        {/* ── Projects Tab ── */}
        {activeTab === "projects" && (
          <div className="space-y-3">
            {loadingProjects ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : userProjects.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-6">{t("profileNoProjects")}</p>
            ) : (
              userProjects.map(proj => {
                const role = proj.owner.id === userId ? "owner" : "member";
                return (
                  <div key={proj.id} className="glass-panel rounded-xl p-4 border border-[var(--border)] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">{proj.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${proj.status.toLowerCase() === "open" ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}>
                          {proj.status.toLowerCase() === "open" ? t("profileStatusOpen") : t("profileStatusClosed")}
                        </span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {proj.tags.map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-hover font-medium">{t}</span>
                        ))}
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${role === "owner" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {role === "owner" ? t("profileRoleOwner") : t("profileRoleMember")}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Badges Tab ── */}
        {activeTab === "badges" && (
          <div className="glass-panel rounded-xl p-8 text-center border border-[var(--border)]">
            <Award className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-foreground font-semibold">{t("profileUserAchievements")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("profileAchievedPrefix")} <span className="font-bold text-primary">{profile.successCount}</span> {t("profileAchievedSuffix")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
