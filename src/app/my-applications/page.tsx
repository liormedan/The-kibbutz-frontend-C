'use client'
/**
 * הקיבוץ – My Applications /my-applications
 * צד המועמד: הפרויקטים שאני חבר בהם + מועמדויות שהגשתי
 * Items 44 (separate sections), 47 (view sent application detail),
 *        48 (success badge), 49 (CTA when action needed)
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FolderGit2,
  FileText,
  ChevronRight,
  ChevronDown,
  Award,
  AlertCircle,
  Check,
  X,
  Users,
  Leaf,
  Cpu,
  Database,
  Globe,
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

interface ActiveProject {
  id: string
  title: string
  role: string
  memberCount: number
  maxMembers: number
  iconType: 'leaf' | 'cpu' | 'database' | 'globe'
  joinedAt: string
  /** true when this project was joined via an accepted application */
  viaApplication: boolean
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ACTIVE_PROJECTS: ActiveProject[] = [
  {
    id: 'p1',
    title: 'EcoTech Platform',
    role: 'מפתח Backend',
    memberCount: 3,
    maxMembers: 5,
    iconType: 'leaf',
    joinedAt: '2026-05-20',
    viaApplication: true,
  },
  {
    id: 'p2',
    title: 'AI Dashboard',
    role: 'מוביל פולסטאק',
    memberCount: 2,
    maxMembers: 4,
    iconType: 'cpu',
    joinedAt: '2026-04-10',
    viaApplication: false,
  },
]

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

function ProjectIcon({ type }: { type: ActiveProject['iconType'] }) {
  const cls = 'w-5 h-5'
  switch (type) {
    case 'leaf': return <Leaf className={`${cls} text-green-500`} />
    case 'cpu': return <Cpu className={`${cls} text-[var(--primary)]`} />
    case 'database': return <Database className={`${cls} text-blue-400`} />
    case 'globe': return <Globe className={`${cls} text-teal-500`} />
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyApplicationsPage() {
  const { t, dir } = useI18n()
  const router = useRouter()
  const [expandedApp, setExpandedApp] = useState<string | null>(null)

  const pendingActionCount = MOCK_SENT_APPLICATIONS.filter(
    (a) => a.status === 'nda_required'
  ).length

  const toggleExpand = (id: string) =>
    setExpandedApp((prev) => (prev === id ? null : id))

  return (
    <div className="min-h-screen bg-[var(--background)]" dir={dir}>
      {/* Header */}
      <header className="glass-panel px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
          {t('miscBack')}
        </button>

        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[var(--primary)]" />
          <h1 className="text-lg font-bold text-[var(--foreground)]">{t('miscMyProjectsTitle')}</h1>
        </div>

        {pendingActionCount > 0 ? (
          <span className="flex items-center gap-1.5 bg-purple-600 text-white rounded-full px-3 py-1 text-sm font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {t('miscNeedsActionCount', { count: pendingActionCount })}
          </span>
        ) : (
          <div className="w-24" />
        )}
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">

        <ComingSoonBanner feature={t('miscMyAppsFeature')} className="mb-4" />

        {/* ── Section 1: Active Projects (item 48 – success badge) ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FolderGit2 className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-base font-bold text-[var(--foreground)]">{t('miscActiveProjectsTitle')}</h2>
            <span className="text-xs text-[var(--muted-foreground)] mr-1">
              ({MOCK_ACTIVE_PROJECTS.length})
            </span>
          </div>

          {MOCK_ACTIVE_PROJECTS.length === 0 ? (
            <EmptyState
              icon={<FolderGit2 className="w-8 h-8 text-[var(--primary)]" />}
              title={t('miscNoActiveProjectsTitle')}
              description={t('miscNoActiveProjectsDesc')}
            />
          ) : (
            <div className="space-y-3">
              {MOCK_ACTIVE_PROJECTS.map((proj) => (
                <div
                  key={proj.id}
                  className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/projects/${proj.id}`)}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                    <ProjectIcon type={proj.iconType} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[var(--foreground)] text-sm">
                        {proj.title}
                      </p>
                      {/* item 48 – Success Badge */}
                      {proj.viaApplication && (
                        <span className="flex items-center gap-1 bg-green-50 text-green-600 border border-green-200 text-[10px] rounded-lg px-2 py-0.5 font-semibold">
                          <Award className="w-3 h-3" />
                          {t('miscAppAccepted')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {t('miscRoleLabel')} <span className="font-medium text-[var(--foreground)]">{proj.role}</span>
                    </p>
                  </div>

                  {/* Members + date */}
                  <div className="text-left flex-shrink-0">
                    <div className="flex items-center gap-1 justify-end text-xs text-[var(--muted-foreground)]">
                      <Users className="w-3.5 h-3.5" />
                      {proj.memberCount}/{proj.maxMembers}
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">{t('miscJoinedAt', { date: proj.joinedAt })}</p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Section 2: Sent Applications (items 44, 47, 49) ── */}
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
