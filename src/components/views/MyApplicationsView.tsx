'use client'
/**
 * הקיבוץ – Open applications tab of the /my-projects hub
 * The candidate side: applications I submitted. The list of projects I am a
 * member of lives in the hub's first tab, not here.
 * Items 44, 47 (view sent application detail), 49 (CTA when action needed)
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Check,
  X,
} from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import ComingSoonBanner from '@/components/ComingSoonBanner'
import { useI18n } from '@/lib/i18n/LanguageProvider'

// ─── Types ────────────────────────────────────────────────────────────────────

type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'nda_required'

interface SentApplication {
  id: string
  projectId: string
  projectName: string
  projectOwner: string
  requestedRole: string
  message: string
  submittedAt: string
  status: ApplicationStatus
  /** present when status === 'nda_required' */
  ndaDeadline?: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_SENT_APPLICATIONS: SentApplication[] = [
  {
    id: 'a1',
    projectId: 'p3',
    projectName: 'ArtSphere Platform',
    projectOwner: 'אורן ברק',
    requestedRole: 'מפתח Frontend',
    message:
      'יש לי ניסיון של 4 שנים ב-React ו-Next.js. אשמח לתרום לפלטפורמת האמנות הדיגיטלית ולבנות ממשקים מרשימים.',
    submittedAt: '2026-06-10',
    status: 'pending',
  },
  {
    id: 'a2',
    projectId: 'p4',
    projectName: 'DataFlow Dashboard',
    projectOwner: 'מיכל רז',
    requestedRole: 'מנתח נתונים',
    message:
      'מומחה בפייתון ו-pandas. עבדתי על דשבורדים אנליטיים ב-3 חברות הזנק וירדתי לעומק של BI.',
    submittedAt: '2026-06-05',
    status: 'nda_required',
    ndaDeadline: '2026-06-25',
  },
  {
    id: 'a3',
    projectId: 'p5',
    projectName: 'GreenGrid App',
    projectOwner: 'גיא לוי',
    requestedRole: 'מעצב UI/UX',
    message: 'מתמחה ב-Figma ובעיצוב מוצרים ירוקים. פורטפוליו זמין לשיתוף לאחר אישור.',
    submittedAt: '2026-05-28',
    status: 'rejected',
  },
  {
    id: 'a4',
    projectId: 'p6',
    projectName: 'Community Hub',
    projectOwner: 'דניאל כהן',
    requestedRole: 'מנהל מוצר',
    message: 'ניסיון של 6 שנים כ-PM בחברות סטארטאפ. מוכן לקחת אחריות על המפרט הפונקציונלי.',
    submittedAt: '2026-05-15',
    status: 'accepted',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_DISPLAY: Record<
  ApplicationStatus,
  { labelKey: string; className: string }
> = {
  pending: { labelKey: 'miscAppStatusPendingReply', className: 'bg-amber-50 text-amber-600 border border-amber-200' },
  accepted: { labelKey: 'miscAppAccepted', className: 'bg-green-50 text-green-600 border border-green-200' },
  rejected: { labelKey: 'miscAppRejected', className: 'bg-red-50 text-red-500 border border-red-200' },
  nda_required: { labelKey: 'miscAppNdaRequired', className: 'bg-purple-50 text-purple-600 border border-purple-200' },
}

// ─── Component ────────────────────────────────────────────────────────────────

// Rendered as the "open applications" tab of the /my-projects hub. The hub
// layout supplies the page header, so this view starts at its own content.
export default function MyApplicationsView() {
  const { t, dir } = useI18n()
  const router = useRouter()
  const [expandedApp, setExpandedApp] = useState<string | null>(null)

  const pendingActionCount = MOCK_SENT_APPLICATIONS.filter(
    (a) => a.status === 'nda_required'
  ).length

  const toggleExpand = (id: string) =>
    setExpandedApp((prev) => (prev === id ? null : id))

  return (
    <div dir={dir}>
      <div className="space-y-8">

        <ComingSoonBanner feature={t('miscMyAppsFeature')} className="mb-4" />

        {pendingActionCount > 0 && (
          <div className="-mt-2 flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
            <AlertCircle className="h-4 w-4" />
            {t('miscNeedsActionCount', { count: pendingActionCount })}
          </div>
        )}

        {/* The "active projects" list that used to live here was a duplicate of
            the hub's first tab — removed so the project list has one home. */}

        {/* ── Sent Applications (items 44, 47, 49) ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-base font-bold text-[var(--foreground)]">{t('miscSentApplicationsTitle')}</h2>
            <span className="text-xs text-[var(--muted-foreground)] mr-1">
              ({MOCK_SENT_APPLICATIONS.length})
            </span>
          </div>

          {MOCK_SENT_APPLICATIONS.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-8 h-8 text-[var(--primary)]" />}
              title={t('miscNoSentAppsTitle')}
              description={t('miscNoSentAppsDesc')}
            />
          ) : (
            <div className="space-y-3">
              {MOCK_SENT_APPLICATIONS.map((app) => {
                const badge = STATUS_DISPLAY[app.status]
                const isExpanded = expandedApp === app.id
                const needsAction = app.status === 'nda_required'

                return (
                  <div
                    key={app.id}
                    className={`glass-card rounded-2xl overflow-hidden transition-all ${
                      needsAction ? 'ring-1 ring-purple-300' : ''
                    }`}
                  >
                    {/* Card header — always visible */}
                    <div
                      className="p-4 flex items-center gap-3 cursor-pointer hover:bg-[var(--primary)]/3 transition-colors"
                      onClick={() => toggleExpand(app.id)}
                    >
                      {/* Status icon */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        app.status === 'accepted' ? 'bg-green-100' :
                        app.status === 'rejected' ? 'bg-red-100' :
                        app.status === 'nda_required' ? 'bg-purple-100' :
                        'bg-amber-100'
                      }`}>
                        {app.status === 'accepted' && <Check className="w-4 h-4 text-green-600" />}
                        {app.status === 'rejected' && <X className="w-4 h-4 text-red-500" />}
                        {app.status === 'nda_required' && <AlertCircle className="w-4 h-4 text-purple-600" />}
                        {app.status === 'pending' && <FileText className="w-4 h-4 text-amber-500" />}
                      </div>

                      {/* Project info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[var(--foreground)] truncate">
                          {app.projectName}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {app.requestedRole} · {app.submittedAt}
                        </p>
                      </div>

                      {/* Status badge */}
                      <span className={`text-[10px] font-semibold rounded-lg px-2 py-1 flex-shrink-0 ${badge.className}`}>
                        {t(badge.labelKey)}
                      </span>

                      {/* Expand toggle */}
                      {isExpanded
                        ? <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
                        : <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
                      }
                    </div>

                    {/* item 47 – Expanded application detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-[var(--border)] pt-3 space-y-3">
                        {/* Detail rows */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[var(--muted-foreground)]">{t('miscProjectLabel')}</span>
                            <p className="font-medium text-[var(--foreground)]">{app.projectName}</p>
                          </div>
                          <div>
                            <span className="text-[var(--muted-foreground)]">{t('miscProjectOwnerLabel')}</span>
                            <p className="font-medium text-[var(--foreground)]">{app.projectOwner}</p>
                          </div>
                          <div>
                            <span className="text-[var(--muted-foreground)]">{t('miscRequestedRole')}</span>
                            <p className="font-medium text-[var(--foreground)]">{app.requestedRole}</p>
                          </div>
                          <div>
                            <span className="text-[var(--muted-foreground)]">{t('miscSubmittedDateLabel')}</span>
                            <p className="font-medium text-[var(--foreground)]">{app.submittedAt}</p>
                          </div>
                        </div>

                        {/* Message I sent */}
                        <div>
                          <p className="text-xs text-[var(--muted-foreground)] mb-1">{t('miscMyMessageLabel')}</p>
                          <div className="bg-[var(--primary)]/5 rounded-xl px-3 py-2.5 text-sm text-[var(--foreground)] leading-relaxed italic">
                            &quot;{app.message}&quot;
                          </div>
                        </div>

                        {/* item 49 – CTA when action required */}
                        {needsAction && (
                          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-purple-700">
                                {t('miscNdaCtaTitle')}
                              </p>
                              <p className="text-xs text-purple-600 mt-0.5">
                                {t('miscNdaCtaDesc', { deadline: app.ndaDeadline ?? '' })}
                              </p>
                              <button
                                onClick={() => router.push(`/nda?applicationId=${app.id}&projectId=${app.projectId}`)}
                                className="mt-2.5 inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors"
                              >
                                {t('miscNdaCtaButton')}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* View project link */}
                        <button
                          onClick={() => router.push(`/projects/${app.projectId}`)}
                          className="text-xs text-[var(--primary)] hover:underline font-medium"
                        >
                          {t('miscViewProjectPage')}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
