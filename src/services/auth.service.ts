// הקיבוץ – Auth Service (REST)
// Talks to KibbutzBackend AuthController: /api/auth/*

import { api } from "@/lib/api/client";
import { mapAuthUser } from "@/lib/api/mappers";
import { notImplemented } from "@/lib/api/pending";
import { UserRole, type AuthResponseDto } from "@/lib/api/types";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  LoginInput,
  RegisterInput,
  AuthPayload,
  RefreshPayload,
} from "@/types/api.types";

// Frontend role union → backend UserRole enum.
// The backend has no "entrepreneur"; both map to Member. See BACKEND_GAPS.md.
function toBackendRole(role: RegisterInput["role"]): UserRole {
  return role === "participant" || role === "entrepreneur"
    ? UserRole.Member
    : UserRole.Guest;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? fullName,
    lastName: parts.slice(1).join(" ") || parts[0] || fullName,
  };
}

function deriveUsername(email: string, fullName: string): string {
  const base =
    email.split("@")[0]?.replace(/[^a-zA-Z0-9._-]/g, "") ||
    fullName.replace(/\s+/g, "").slice(0, 40) ||
    "user";
  return base.slice(0, 50);
}

function toAuthPayload(dto: AuthResponseDto): AuthPayload {
  const expiresIn = Math.max(
    0,
    Math.floor((new Date(dto.expiresAt).getTime() - Date.now()) / 1000),
  );
  return {
    tokens: {
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
      expiresIn,
    },
    user: mapAuthUser(dto.user),
  };
}

export async function loginWithEmail(input: LoginInput): Promise<AuthPayload> {
  const dto = await api.post<AuthResponseDto>(
    "/api/auth/login",
    { email: input.email, password: input.password },
    false,
  );
  const payload = toAuthPayload(dto);
  useAuthStore
    .getState()
    .login(payload.tokens.accessToken, payload.tokens.refreshToken, payload.user);
  return payload;
}

export async function registerWithEmail(
  input: RegisterInput,
): Promise<AuthPayload> {
  const { firstName, lastName } = splitName(input.name);
  const dto = await api.post<AuthResponseDto>(
    "/api/auth/register",
    {
      firstName,
      lastName,
      username: deriveUsername(input.email, input.name),
      email: input.email,
      password: input.password,
      role: toBackendRole(input.role),
    },
    false,
  );
  const payload = toAuthPayload(dto);
  useAuthStore
    .getState()
    .login(payload.tokens.accessToken, payload.tokens.refreshToken, payload.user);
  return payload;
}

export async function logoutUser(): Promise<void> {
  try {
    await api.post("/api/auth/logout");
  } catch {
    // best-effort — clear local session regardless
  } finally {
    useAuthStore.getState().logout();
  }
}

export async function refreshToken(): Promise<RefreshPayload | null> {
  const token = useAuthStore.getState().refreshToken;
  if (!token) return null;
  try {
    const dto = await api.post<AuthResponseDto>(
      "/api/auth/refresh-token",
      { refreshToken: token },
      false,
    );
    useAuthStore.setState({
      token: dto.accessToken,
      refreshToken: dto.refreshToken,
    });
    const expiresIn = Math.max(
      0,
      Math.floor((new Date(dto.expiresAt).getTime() - Date.now()) / 1000),
    );
    return { accessToken: dto.accessToken, expiresIn };
  } catch {
    useAuthStore.getState().logout();
    return null;
  }
}

// ─── Not supported by the backend yet (kept for UI compatibility) ──

export async function handleOAuthCallback(
  _provider: "google" | "github" | "linkedin",
  _code: string,
  _state: string,
): Promise<AuthPayload> {
  return notImplemented("התחברות עם ספק חיצוני (OAuth)");
}

export async function forgotPassword(_email: string): Promise<boolean> {
  return notImplemented("שחזור סיסמה");
}

export async function resetPassword(
  _token: string,
  _newPassword: string,
): Promise<boolean> {
  return notImplemented("איפוס סיסמה");
}

export async function resendVerificationEmail(): Promise<boolean> {
  return notImplemented("אימות אימייל");
}
