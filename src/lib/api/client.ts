// הקיבוץ – REST API client
// Thin fetch wrapper around the ASP.NET backend:
//   • attaches JWT Bearer from the auth store
//   • unwraps the ApiResponse<T> envelope (throws ApiError on success:false)
//   • on 401, refreshes the access token once and retries the request

import { useAuthStore } from "@/store/useAuthStore";
import type { ApiResponse, AuthResponseDto } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:19653";

export class ApiError extends Error {
  status: number;
  errors: string[];
  constructor(message: string, status: number, errors: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  auth?: boolean; // default true — attach Bearer token
  _retry?: boolean; // internal: prevents infinite refresh loops
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path.replace(/^\//, ""), API_BASE.replace(/\/?$/, "/"));
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

// ─── Token refresh (single-flight) ─────────────────────────────

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const { refreshToken, setToken, setUser } = useAuthStore.getState();
    if (!refreshToken) return false;
    try {
      const res = await fetch(buildUrl("/api/auth/refresh-token"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const json = (await res.json()) as ApiResponse<AuthResponseDto>;
      if (!res.ok || !json.success || !json.data) return false;
      // refresh-token rotates both tokens on the backend
      useAuthStore.setState({
        token: json.data.accessToken,
        refreshToken: json.data.refreshToken,
      });
      setToken(json.data.accessToken);
      void setUser; // user is refreshed elsewhere; token is what matters here
      return true;
    } catch {
      return false;
    }
  })();

  const result = await refreshInFlight;
  refreshInFlight = null;
  return result;
}

// ─── Core request ──────────────────────────────────────────────

export async function apiFetch<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, query, auth = true, _retry = false } = opts;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = useAuthStore.getState().token;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("לא ניתן להתחבר לשרת", 0);
  }

  // 401 → try one refresh + retry
  if (res.status === 401 && auth && !_retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return apiFetch<T>(path, { ...opts, _retry: true });
    useAuthStore.getState().logout();
    throw new ApiError("פג תוקף ההתחברות", 401);
  }

  // Some endpoints (204) have no body
  if (res.status === 204) return undefined as T;

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    if (res.ok) return undefined as T;
    throw new ApiError(`שגיאת שרת (${res.status})`, res.status);
  }

  if (!json.success) {
    throw new ApiError(
      json.message ?? "הבקשה נכשלה",
      res.status,
      json.errors ?? [],
    );
  }

  return json.data as T;
}

// Convenience helpers
export const api = {
  get: <T>(path: string, query?: RequestOptions["query"], auth = true) =>
    apiFetch<T>(path, { method: "GET", query, auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    apiFetch<T>(path, { method: "POST", body, auth }),
  put: <T>(path: string, body?: unknown, auth = true) =>
    apiFetch<T>(path, { method: "PUT", body, auth }),
  del: <T>(path: string, auth = true) =>
    apiFetch<T>(path, { method: "DELETE", auth }),
};
