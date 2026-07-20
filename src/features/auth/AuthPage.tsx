"use client";

/**
 * הקיבוץ – Auth Page (Root /)
 * דף ראשון — כניסה והרשמה
 * אחרי כניסה מוצלחת → /projects
 *
 * DEV BYPASS: הפעל NEXT_PUBLIC_DEV_BYPASS=true
 *   - .env.development.local  → locally
 *   - Vercel env vars → for preview deployments
 *
 * TODO backend: see server/contracts for the backend handoff contract. (Trigger fresh rebuild)
 */

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Briefcase, Eye, EyeOff, Loader2 } from "lucide-react";

import { devBypassLogin } from "@/lib/auth";
import { handleOAuthCallback, loginWithEmail, registerWithEmail, forgotPassword } from "@/services/auth.service";
import AuthCarousel from "./AuthCarousel";

type Tab = "login" | "register" | "forgot";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/** Set lightweight cookies so proxy.ts can enforce route protection SSR-side. */
function setSessionCookies(role: string) {
  const maxAge = 60 * 60 * 8; // 8 hours
  document.cookie = `kibbutz-session=1; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `kibbutz-role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

interface AuthPageProps {
  initialTab?: Tab;
}

export default function AuthPage({ initialTab = "login" }: AuthPageProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "" });
  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));
  const isDev = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";

  async function handleDevLogin() {
    setLoading("dev");
    await new Promise(r => setTimeout(r, 400));
    devBypassLogin();                          // sets useAuthStore with mock user
    setSessionCookies("entrepreneur");        // lets proxy.ts allow /projects
    router.push("/projects");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading("email");
    try {
      const payload = await loginWithEmail({ email: loginEmail, password: loginPassword });
      setSessionCookies(payload.user.role.toLowerCase());
      router.push("/projects");
    } catch (err: unknown) { setError(getErrorMessage(err, "שגיאה בהתחברות")); }
    finally { setLoading(null); }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading("forgot");
    try {
      const success = await forgotPassword(forgotEmail);
      if (success) {
        setForgotSent(true);
      } else {
        setError("שגיאה בשליחת איפוס סיסמה");
      }
    } catch (err: unknown) { setError(getErrorMessage(err, "שגיאה בשליחת איפוס סיסמה")); }
    finally { setLoading(null); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (form.password !== form.confirmPassword) return setError("הסיסמאות אינן תואמות");
    if (form.password.length < 6) return setError("סיסמה חייבת להכיל לפחות 6 תווים");
    setLoading("email");
    try {
      const payload = await registerWithEmail({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "PARTICIPANT",
      } as unknown as Parameters<typeof registerWithEmail>[0]);
      setSessionCookies(payload.user.role.toLowerCase());
      router.push("/onboarding");
    } catch (err: unknown) { setError(getErrorMessage(err, "שגיאה בהרשמה")); }
    finally { setLoading(null); }
  }

  async function handleOAuth(provider: "google" | "github" | "linkedin") {
    setError(""); setLoading(provider);
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      if (!code || !state) {
        throw new Error("חסרים פרטי OAuth callback");
      }
      const payload = await handleOAuthCallback(provider, code, state);
      setSessionCookies(payload.user.role.toLowerCase());
      router.push("/projects");
    } catch (err: unknown) { setError(getErrorMessage(err, `שגיאה עם ${provider}`)); }
    finally { setLoading(null); }
  }

  const input = "w-full pr-10 pl-4 py-2.5 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md text-[#3b2a1c] text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_12px_32px_-28px_rgba(71,51,31,0.55)] focus:outline-none focus:border-orange-300/45 focus:bg-white/18 transition-all placeholder:text-[#7b6b5e]/72";
  const icon = "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground";
  const primaryButton = "w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-md";
  const socialButton = "flex flex-col items-center gap-1.5 py-3 rounded-xl border border-[var(--border)] bg-background hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer disabled:opacity-50";
  const socialLabel = "text-[10px] font-medium text-muted-foreground";

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-[#f4eadc]" dir="rtl">
      {/* Right Panel — Interactive Carousel */}
      <AuthCarousel />

      {/* Left Panel (Auth Card Panel) */}
      <div className="h-full lg:overflow-y-auto flex items-center justify-center p-6 lg:p-12 bg-[radial-gradient(circle_at_22%_18%,rgba(245,158,11,0.24),transparent_26%),radial-gradient(circle_at_78%_72%,rgba(210,100,45,0.18),transparent_30%),radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.74),transparent_38%),linear-gradient(135deg,#fffaf2_0%,#f4eadc_48%,#eadcc8_100%)] relative overflow-hidden">
        {/* Soft background glow for Left Panel */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.46)_0%,rgba(255,255,255,0.08)_42%,rgba(210,100,45,0.10)_100%)]" />
          <div className="absolute inset-0 opacity-[0.12] bg-[repeating-linear-gradient(90deg,rgba(71,51,31,0.28)_0_1px,transparent_1px_52px),repeating-linear-gradient(0deg,rgba(71,51,31,0.22)_0_1px,transparent_1px_52px)]" />
          <div className="absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(90deg,rgba(255,255,255,0.34),transparent)]" />
          <div className="absolute inset-x-10 top-14 h-px bg-gradient-to-l from-transparent via-white/60 to-transparent" />
        </div>

        {isDev && (
          <button
            onClick={handleDevLogin}
            disabled={!!loading}
            className="absolute left-6 top-6 z-20 h-16 w-16 overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl transition-all hover:-translate-y-0.5 hover:bg-white/20 disabled:opacity-50 cursor-pointer"
            aria-label="כניסת מפתחים"
            title="כניסת מפתחים"
          >
            <Image src="/logo_clean.png" alt="כניסת מפתחים" fill className="object-cover" priority />
          </button>
        )}

        <div className="w-full max-w-md relative z-10">
          <div className="relative h-[700px] max-h-[calc(100vh-40px)] overflow-hidden rounded-[28px] p-6 border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/70 to-transparent" />
            <div className="absolute inset-x-6 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),transparent)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_8%,rgba(255,255,255,0.30),transparent_28%),radial-gradient(circle_at_80%_94%,rgba(210,100,45,0.12),transparent_34%)] pointer-events-none" />
            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-3 flex items-center justify-center gap-4">
                <div className="w-full text-center">
                  <p className="text-[11px] font-semibold text-primary/80">The Kibbutz</p>
                  <h1 className="text-xl font-bold leading-tight text-[#47331f]">
                    {tab === "login" ? "כניסה לחשבון" : tab === "register" ? "יצירת חשבון" : "איפוס סיסמה"}
                  </h1>
                </div>
              </div>

            {/* ── DEV BYPASS ── */}
            {false && isDev && (
              <div className="mb-5">
                <button onClick={handleDevLogin} disabled={!!loading}
                  className="hidden">
                  {loading === "dev" ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-lg">🛠️</span>}
                  {loading === "dev" ? "נכנס..." : "כניסת מפתחים — עקוף אימות"}
                </button>
                <p className="text-center text-[10px] text-muted-foreground mt-1.5 opacity-60">
                  מופיע כי NEXT_PUBLIC_DEV_BYPASS=true
                </p>
                <div className="flex items-center gap-3 mt-4 mb-1">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-xs text-muted-foreground">או התחבר רגיל</span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>
              </div>
            )}

            {/* ── TABS ── */}
            <div className="flex gap-1 p-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl mb-3 shadow-sm">
              {(["login","register"] as Tab[]).map(t => (
                <button key={t} onClick={() => { setTab(t); setError(""); }}
                  className={`flex-1 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${tab === t ? "bg-gradient-to-l from-orange-600 to-amber-500 text-white shadow-[0_14px_30px_-18px_rgba(210,100,45,0.95)]" : "text-[#6f5b49] hover:bg-white/20 hover:text-[#332416]"}`}>
                  {t === "login" ? "כניסה" : "הרשמה"}
                </button>
              ))}
            </div>

            {error && <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center">{error}</div>}

            {/* ── LOGIN ── */}
            <div className="flex-1 min-h-0">
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5 text-center">אימייל</label>
                  <div className="relative">
                    <Mail className={icon} />
                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="your@email.com" required dir="ltr" className={input + " text-left pl-4 pr-10"} />
                  </div>
                </div>
                <div>
                  <div className="relative mb-1.5 text-center">
                    <button type="button" onClick={() => { setTab("forgot"); setError(""); setForgotSent(false); }} className="absolute left-0 top-0 text-xs text-primary hover:underline cursor-pointer">שכחתי סיסמה</button>
                    <label className="text-xs font-medium text-muted-foreground">סיסמה</label>
                  </div>
                  <div className="relative">
                    <Lock className={icon} />
                    <input type={showPassword ? "text" : "password"} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" required dir="ltr" className={input + " pl-10"} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b6b5e]/70 hover:text-[#332416] cursor-pointer">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={!!loading} className={primaryButton}>
                  {loading === "email" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading === "email" ? "מתחבר..." : "כניסה"}
                </button>
              </form>
            )}

            {/* ── REGISTER ── */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5 text-center">שם מלא *</label>
                  <div className="relative"><User className={icon} />
                    <input type="text" value={form.name} onChange={e => update("name",e.target.value)} placeholder="ישראל ישראלי" required className={input} /></div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5 text-center">אימייל *</label>
                  <div className="relative"><Mail className={icon} />
                    <input type="email" value={form.email} onChange={e => update("email",e.target.value)} placeholder="your@email.com" required dir="ltr" className={input + " text-left pl-4 pr-10"} /></div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5 text-center">תפקיד</label>
                  <div className="relative"><Briefcase className={icon} />
                    <input type="text" value={form.role} onChange={e => update("role",e.target.value)} placeholder="מפתח / מעצב..." className={input} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5 text-center">סיסמה *</label>
                    <div className="relative"><Lock className={icon} />
                      <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => update("password",e.target.value)} placeholder="min 6" required dir="ltr" className={input + " pl-10"} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b6b5e]/70 hover:text-[#332416] cursor-pointer">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button></div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5 text-center">אימות *</label>
                    <div className="relative"><Lock className={icon} />
                      <input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={e => update("confirmPassword",e.target.value)} placeholder="••••••••" required dir="ltr" className={input} /></div>
                  </div>
                </div>
                <button type="submit" disabled={!!loading} className={`${primaryButton} mt-1`}>
                  {loading === "email" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading === "email" ? "יוצר חשבון..." : "הרשמה"}
                </button>
              </form>
            )}

            {tab === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotSent ? (
                  <div className="text-center py-4 space-y-3">
                    <p className="text-sm text-secondary font-medium">שלחנו לך קישור לאיפוס הסיסמה לתיבת המייל!</p>
                    <button type="button" onClick={() => { setTab("login"); setError(""); }} className="text-xs text-primary hover:underline font-semibold cursor-pointer">חזרה לכניסה</button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground text-center">הכנס את המייל שלך ונשלח לך קישור לאיפוס הסיסמה</p>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5 text-center">אימייל</label>
                      <div className="relative">
                        <Mail className={icon} />
                        <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.com" required dir="ltr" className={input + " text-left pl-4 pr-10"} />
                      </div>
                    </div>
                    <button type="submit" disabled={!!loading} className={primaryButton}>
                      {loading === "forgot" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {loading === "forgot" ? "שולח..." : "שלח קישור לאיפוס"}
                    </button>
                    <button type="button" onClick={() => { setTab("login"); setError(""); }} className="w-full text-center text-xs text-[#6f5b49] hover:underline mt-2 cursor-pointer">ביטול וחזרה לכניסה</button>
                  </>
                )}
              </form>
            )}

            {/* ── OAUTH ── */}
            </div>
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-[var(--border)]" /><span className="text-xs text-muted-foreground">או המשך עם</span><div className="flex-1 h-px bg-[var(--border)]" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleOAuth("google")} disabled={!!loading} className={socialButton}>
                {loading === "google" ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.251 17.64 11.943 17.64 9.2z" fill="#4285F4" /><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" /><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" /><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" /></svg>}
                <span className={socialLabel}>Google</span>
              </button>
              <button onClick={() => handleOAuth("github")} disabled={!!loading} className={socialButton}>
                {loading === "github" ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#47331f]"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>}
                <span className={socialLabel}>GitHub</span>
              </button>
              <button onClick={() => handleOAuth("linkedin")} disabled={!!loading} className={socialButton}>
                {loading === "linkedin" ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>}
                <span className={socialLabel}>LinkedIn</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
