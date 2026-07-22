'use client'
/**
 * הקיבוץ – Email Verification Page /verify-email
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { resendVerificationEmail } from "@/services/auth.service"
import { useAuthStore } from "@/store/useAuthStore"
import { useI18n } from "@/lib/i18n/LanguageProvider"

export default function VerifyEmailPage() {
  const router = useRouter()
  const { t, dir } = useI18n()
  const currentUser = useAuthStore((s) => s.user)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (resendCooldown <= 0) return
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [resendCooldown])

  const handleResend = async () => {
    setError("")
    setLoading(true)
    try {
      const isOk = await resendVerificationEmail()
      if (isOk) {
        setResendCooldown(60)
        setResent(true)
      } else {
        setError(t("verifyErrSendFailed"))
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("verifyErrSend"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4' dir={dir}>
      <div className='glass-panel max-w-md w-full rounded-2xl p-8 text-center shadow-2xl'>
        {/* Icon */}
        <div className='w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6'>
          <Send className='w-16 h-16 text-primary' />
        </div>

        {/* Heading */}
        <h1 className='text-2xl font-bold text-foreground'>{t("verifyHeading")}</h1>
        <p className='text-sm text-muted-foreground mt-2 mb-6'>
          {t("verifyDescription")}
        </p>

        {/* Email display */}
        <div className='glass-card inline-block px-4 py-2 rounded-xl text-sm text-primary font-mono mb-4'>
          {currentUser?.email ?? "your@email.com"}
        </div>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Resend button */}
        <div className='mt-6'>
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            className='border border-[var(--border)] px-5 py-2.5 rounded-xl text-sm hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto font-medium'
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            {resendCooldown > 0 ? (
              <span>{t("verifyResendCountdown", { seconds: resendCooldown })}</span>
            ) : (
              <span>{t("verifyResend")}</span>
            )}
          </button>

          {resent && !error && (
            <p className='text-secondary text-sm mt-2 font-medium'>
              {t("verifyResentMsg")}
            </p>
          )}
        </div>

        {/* Back button */}
        <button
          onClick={() => router.push('/login')}
          className='mt-6 flex items-center gap-1.5 text-muted-foreground text-sm mx-auto hover:text-foreground transition-colors'
        >
          <ChevronRight className='w-4 h-4' />
          {t("authBackToLogin")}
        </button>
      </div>
    </div>
  )
}
