// הקיבוץ – Proxy (replaces deprecated middleware.ts in Next.js 16+)
// Runs on the server before every matching request.
// Reads the lightweight `kibbutz-session` cookie that is set by the auth page on login.
// Heavy JWT verification happens inside the API routes / service layer — not here.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require a logged-in user
const AUTH_REQUIRED = ["/dashboard", "/profile", "/nda", "/onboarding"];

// Routes that require role=admin (also requires auth)
const ADMIN_REQUIRED = ["/admin"];

// Routes only for unauthenticated users (logged-in users get redirected away)
const PUBLIC_ONLY = ["/"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // DEV_BYPASS: skip all auth checks in development
  if (process.env.NEXT_PUBLIC_DEV_BYPASS === "true") {
    return NextResponse.next();
  }

  const session = request.cookies.get("kibbutz-session");
  const role    = request.cookies.get("kibbutz-role")?.value;

  const isAuthed = Boolean(session?.value);
  const isAdmin  = role?.toUpperCase() === "ADMIN";

  // Redirect unauthenticated users away from protected routes
  const needsAuth = AUTH_REQUIRED.some(r => pathname.startsWith(r));
  if (needsAuth && !isAuthed) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect non-admins away from admin routes
  const needsAdmin = ADMIN_REQUIRED.some(r => pathname.startsWith(r));
  if (needsAdmin && (!isAuthed || !isAdmin)) {
    const dest = isAuthed ? "/dashboard" : "/";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Redirect authenticated users away from the root auth page
  const isPublicOnly = PUBLIC_ONLY.some(r => pathname === r);
  if (isPublicOnly && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static assets, Next internals, and image optimization
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo\\.jpg|.*\\.png$).*)"],
};
