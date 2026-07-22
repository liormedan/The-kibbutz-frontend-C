// הקיבוץ – "Pending backend" helpers
// Used by features whose endpoints do NOT yet exist on the ASP.NET backend
// (projects, matching, NDA, applications, teams, OAuth, password reset,
// email verification, profile update, user search, ...).
// See BACKEND_GAPS.md for the full punch-list the backend team must implement.

import { ApiError } from "./client";

/** Marks a feature that has no backend endpoint yet. */
export class PendingBackendError extends ApiError {
  feature: string;
  constructor(feature: string) {
    super("לא ניתן לבצע את הפעולה כרגע. נסו שוב מאוחר יותר.", 501);
    this.name = "PendingBackendError";
    this.feature = feature;
  }
}

/** Throw from a service action that has no backend endpoint. */
export function notImplemented(feature: string): never {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[pending-backend] ${feature} — no REST endpoint yet`);
  }
  throw new PendingBackendError(feature);
}

/** Resolve with a fallback for read paths that have no backend endpoint. */
export async function pendingRead<T>(feature: string, fallback: T): Promise<T> {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[pending-backend] ${feature} — returning empty (no REST endpoint yet)`);
  }
  return fallback;
}
