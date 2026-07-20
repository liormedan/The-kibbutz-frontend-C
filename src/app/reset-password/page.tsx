'use client';

/**
 * הקיבוץ – Reset Password Page /reset-password
 */

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";
import { resetPassword } from "@/services/auth.service";
import ComingSoonBanner from "@/components/ComingSoonBanner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      queueMicrotask(() => setError("קישור איפוס סיסמה אינו תקין או חסר תג אימות (token)."));
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    if (!token) {
      setError("לא ניתן לאפס סיסמה ללא קישור תקין.");
      return;
    }
    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }
    if (password.length < 6) {
      setError("סיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setLoading(true);
    try {
      const isOk = await resetPassword(token, password);
      if (isOk) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError("איפוס הסיסמה נכשל. ייתכן שהקישור פג תוקף.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "שגיאה בתהליך איפוס הסיסמה");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = "w-full pr-10 pl-4 py-2.5 rounded-2xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60";
  const iconStyle = "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="glass-panel max-w-md w-full rounded-2xl p-8 shadow-2xl">
        <ComingSoonBanner feature="איפוס סיסמה" className="mb-4" />
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-center text-foreground mb-2">איפוס סיסמה</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">הכנס סיסמה חדשה לחשבונך</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto text-secondary">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm text-secondary font-medium">הסיסמה שונתה בהצלחה! מועבר לדף הכניסה...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">סיסמה חדשה *</label>
              <div className="relative">
                <Lock className={iconStyle} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  className={inputStyle + " pl-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/75 hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">אימות סיסמה חדשה *</label>
              <div className="relative">
                <Lock className={iconStyle} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  className={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              style={{ background: 'linear-gradient(135deg, #d2642d, #e8753d)' }}
              className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md mt-6"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "מאפס סיסמה..." : "עדכן סיסמה"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
