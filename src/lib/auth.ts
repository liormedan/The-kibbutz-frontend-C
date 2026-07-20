// הקיבוץ – Auth utilities (REST)
// Token refresh + session validation against the ASP.NET backend.
// Runs in the browser — no Node-only APIs.

import { api, ApiError } from "@/lib/api/client";
import { mapAuthUser, meToUserProfileDto, type MeEntity } from "@/lib/api/mappers";
import { useAuthStore } from "@/store/useAuthStore";
import { refreshToken as refreshTokenService } from "@/services/auth.service";
import type { AuthUser } from "@/types/user.types";

// ─── Token refresh ─────────────────────────────────────────────

export async function refreshAccessToken(): Promise<string | null> {
  const result = await refreshTokenService();
  return result?.accessToken ?? null;
}

// ─── Session validation ────────────────────────────────────────

/** GET /api/auth/me → maps to AuthUser, or logs out on 401. */
export async function validateSession(): Promise<AuthUser | null> {
  const { token, setUser, logout } = useAuthStore.getState();
  if (!token) return null;

  if (process.env.NEXT_PUBLIC_DEV_BYPASS === "true" && token === "dev-token") {
    return useAuthStore.getState().user;
  }

  try {
    const me = await api.get<MeEntity>("/api/auth/me");
    const user = mapAuthUser(meToUserProfileDto(me));
    setUser(user);
    return user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      logout();
      return null;
    }
    // network / server error — keep the cached session
    return useAuthStore.getState().user;
  }
}

// ─── OAuth (not supported by backend yet) ──────────────────────

export function initiateOAuth(provider: "google" | "github" | "linkedin"): void {
  console.warn(`[auth] initiateOAuth(${provider}) — לא נתמך בשרת עדיין`);
}

// ─── Dev bypass ────────────────────────────────────────────────

/** Synthetic dev-mode login — sets a mock AuthUser in the store. */
export function devBypassLogin(): void {
  const { login } = useAuthStore.getState();
  const mockUser: AuthUser = {
    id: "dev-user-1",
    name: "מפתח בדיקה",
    email: "dev@kibbutz.local",
    avatar: "",
    role: "admin",
    canCreateProjects: true,
    canJoinProjects: true,
    isProfileComplete: true,
    emailVerified: true,
  };
  login("dev-token", "dev-refresh-token", mockUser);
}
