'use client';

/**
 * הקיבוץ – OAuth Callback Page /oauth/callback
 */

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { handleOAuthCallback } from "@/services/auth.service";
import { useI18n } from "@/lib/i18n/LanguageProvider";

function setSessionCookies(role: string) {
  const maxAge = 60 * 60 * 8; // 8 hours
  document.cookie = `kibbutz-session=1; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `kibbutz-role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function OAuthCallbackHandler() {
  const router = useRouter();
  const { t, dir } = useI18n();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code") || "";
    const state = searchParams.get("state") || "";
    let providerParam = searchParams.get("provider") || "";

    if (!code) {
      queueMicrotask(() => setError(t("oauthErrNoCode")));
      return;
    }

    // Try to guess the provider if not provided in query param
    if (!providerParam) {
      const stateLower = state.toLowerCase();
      if (stateLower.includes("google")) {
        providerParam = "google";
      } else if (stateLower.includes("linkedin")) {
        providerParam = "linkedin";
      } else if (stateLower.includes("github")) {
        providerParam = "github";
      } else {
        // Default to google as fallback
        providerParam = "google";
      }
    }

    const provider = providerParam as "google" | "linkedin" | "github";

    async function processCallback() {
      try {
        const payload = await handleOAuthCallback(provider, code, state);
        setSessionCookies(payload.user.role.toLowerCase());
        
        if (payload.user.isProfileComplete) {
          router.push("/projects");
        } else {
          router.push("/onboarding");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t("oauthErrFailed"));
      }
    }

    processCallback();
  }, [searchParams, router, t]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={dir}>
      <div className="glass-panel max-w-md w-full rounded-2xl p-8 text-center shadow-2xl">
        {error ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">{t("authErrLogin")}</h1>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <button
              onClick={() => router.push("/login")}
              style={{ background: 'linear-gradient(135deg, #d2642d, #e8753d)' }}
              className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 cursor-pointer shadow-md"
            >
              {t("oauthBackToLogin")}
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-6" />
            <h1 className="text-xl font-bold text-foreground mb-2">{t("oauthConnecting")}</h1>
            <p className="text-sm text-muted-foreground">{t("oauthWait")}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <OAuthCallbackHandler />
    </Suspense>
  );
}
