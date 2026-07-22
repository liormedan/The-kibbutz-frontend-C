// הקיבוץ – User Service (REST)
// Only GET /api/auth/me exists on the backend. Profile update, avatar upload,
// onboarding, badges, get-user-by-id, search and "my projects" have NO backend
// endpoint yet — they degrade gracefully. See BACKEND_GAPS.md.

import { api } from "@/lib/api/client";
import {
  mapUserProfile,
  meToUserProfileDto,
  type MeEntity,
} from "@/lib/api/mappers";
import { pendingRead } from "@/lib/api/pending";
import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserProfile, OnboardingInput, UserSummary } from "@/types/user.types";
import type { Project } from "@/types/project.types";

// Build a UserProfile from the already-authenticated auth-store user. Used when
// /api/auth/me is unreachable (offline dev login, or the backend is down): the
// user is logged in, so the profile page must still render with what we have
// instead of hanging on its loading skeleton forever.
function profileFromAuthStore(): UserProfile | null {
  const user = useAuthStore.getState().user;
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: "",
    role: "",
    avatar: user.avatar ?? "",
    links: "",
    skills: [],
    canCreateProjects: user.canCreateProjects,
    canJoinProjects: user.canJoinProjects,
    isProfileComplete: user.isProfileComplete,
    emailVerified: user.emailVerified,
    successCount: 0,
    createdAt: new Date().toISOString(),
  };
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const { setProfile, setLoadingProfile } = useUserStore.getState();
  setLoadingProfile(true);
  try {
    const me = await api.get<MeEntity>("/api/auth/me");
    const profile = mapUserProfile(meToUserProfileDto(me));
    setProfile(profile);
    return profile;
  } catch {
    // Fall back to the auth-store user so /profile renders instead of hanging.
    const fallback = profileFromAuthStore();
    if (fallback) setProfile(fallback);
    return fallback;
  } finally {
    setLoadingProfile(false);
  }
}

// No backend endpoint — apply locally so the UI reflects the change, but it is
// NOT persisted server-side.
export async function updateProfile(input: Partial<UserProfile>): Promise<void> {
  console.warn("[pending-backend] עדכון פרופיל אינו נשמר בשרת עדיין");
  useUserStore.getState().updateProfile(input);
}

export async function fetchBadges(): Promise<void> {
  const { setBadges } = useUserStore.getState();
  setBadges(await pendingRead("תגי הצלחה", []));
}

// No backend onboarding — mark complete locally so the wizard can finish.
export async function completeOnboarding(input: OnboardingInput): Promise<void> {
  console.warn("[pending-backend] Onboarding אינו נשמר בשרת עדיין");
  useUserStore.getState().updateProfile({
    name: input.name,
    bio: input.bio,
    role: input.role,
    links: input.links,
    skills: input.skills,
  });
  useAuthStore.getState().markProfileComplete();
}

export async function uploadAvatar(_file: File): Promise<string | null> {
  return pendingRead("העלאת תמונת פרופיל", null);
}

export async function fetchMyProjects(): Promise<{
  owned: Project[];
  joined: Project[];
}> {
  return pendingRead("הפרויקטים שלי", { owned: [], joined: [] });
}

// No get-user-by-id endpoint — return a minimal placeholder so pages that only
// need a name/id (e.g. messages) don't crash.
export async function fetchUserById(id: string): Promise<UserProfile> {
  await pendingRead("צפייה בפרופיל משתמש", null);
  return {
    id,
    name: "משתמש",
    email: "",
    bio: "",
    role: "",
    avatar: "",
    links: "",
    skills: [],
    canCreateProjects: false,
    canJoinProjects: false,
    isProfileComplete: false,
    emailVerified: false,
    successCount: 0,
    createdAt: new Date(0).toISOString(),
  };
}

export async function searchUsers(_query: string): Promise<UserSummary[]> {
  return pendingRead("חיפוש משתמשים", []);
}
