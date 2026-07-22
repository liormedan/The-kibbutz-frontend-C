'use client'
/**
 * הקיבוץ – Applications Management /applications
 * ניהול מועמדויות לפרויקטים שלי וצד היזם
 * TODO backend: query applications(projectId), mutation respondToApplication
 */

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Search,
  Check,
  X,
  MessageSquare,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import { useI18n } from '@/lib/i18n/LanguageProvider'

interface Application {
  id: string
  projectId: string
  projectName: string
  userId: string
  userName: string
  userRole: string
  message: string
  requestedRole: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

const MOCK_PROJECTS = [
  {
    id: 'p1',
    title: 'EcoTech Platform',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    memberCount: 2,
    maxMembers: 5,
  },
  {
    id: 'p2',
    title: 'AI Dashboard',
    tags: ['Next.js', 'Python', 'GraphQL'],
    memberCount: 1,
    maxMembers: 4,
  },
]

const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'a1',
    projectId: 'p1',
    projectName: 'EcoTech Platform',
    userId: 'u2',
    userName: 'מיכל כהן',
    userRole: 'מפתח Full Stack',
    message:
      'יש לי 3 שנים ניסיון ב-React ו-Node.js. אשמח מאוד לעבוד על פרויקט שיש לו אימפקט סביבתי.',
    requestedRole: 'מפתח Backend',
    status: 'pending',
    createdAt: '2026-06-04',
  },
  {
    id: 'a2',
    projectId: 'p1',
    projectName: 'EcoTech Platform',
    userId: 'u3',
    userName: 'רוני לביא',
    userRole: 'מעצב UX',
    message: 'מתמחה בעיצוב מוצרים ייעודיים ומשתמשים ב-Figma ו-Adobe XD.',
    requestedRole: 'מעצב UI/UX',
    status: 'pending',
    createdAt: '2026-06-03',
  },
  {
    id: 'a3',
    projectId: 'p2',
    projectName: 'AI Dashboard',
    userId: 'u4',
    userName: 'אלון שטיין',
    userRole: 'מפתח Python',
    message:
      'עובד ב-ML/AI כבר 3 שנים. מנוסה באינטגרציה של מודלים למערכות קיימות.',
    requestedRole: 'יעוץ AI/ML',
    status: 'accepted',
    createdAt: '2026-05-30',
  },
]

type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected'

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'miscFilterAll',
  pending: 'miscStatusPending',
  accepted: 'miscFilterAccepted',
  rejected: 'miscFilterRejected',
}

const STATUS_BADGE: Record<
  Application['status'],
  { labelKey: string; className: string }
> = {
  pending: {
    labelKey: 'miscStatusPending',
    className: 'bg-amber-50 text-amber-600 border border-amber-200',
  },
  accepted: {
    labelKey: 'miscStatusAccepted',
    className: 'bg-green-50 text-green-600 border border-green-200',
  },
  rejected: {
    labelKey: 'miscStatusRejected',
    className: 'bg-red-50 text-red-500 border border-red-200',
  },
}

export default function ProjectRequestsView() {
  const { t, dir } = useI18n()
  const router = useRouter()
  const [applications, setApplications] =
    useState<Application[]>(MOCK_APPLICATIONS)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const handleAccept = (id: string) => {
    console.warn('TODO: respondToApplication', id, true)
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'accepted' } : a))
    )
  }

  const handleReject = (id: string) => {
    console.warn('TODO: respondToApplication', id, false)
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a))
    )
  }

  const handleChat = (app: Application) => {
    router.push(`/messages?userId=${encodeURIComponent(app.userId)}`)
  }

  const pendingCount = applications.filter(
    (a) => a.status === 'pending'
  ).length

  const pendingByProject = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of applications) {
      if (a.status === 'pending') {
        map[a.projectId] = (map[a.projectId] || 0) + 1
      }
    }
    return map
  }, [applications])

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      if (selectedProjectId && a.projectId !== selectedProjectId) return false
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      if (
        searchTerm &&
        !a.userName.includes(searchTerm) &&
        !a.requestedRole.includes(searchTerm) &&
        !a.userRole.includes(searchTerm)
      )
        return false
      return true
    })
  }, [applications, selectedProjectId, statusFilter, searchTerm])

  // The hub layout supplies the page title and the "new project" button, so
  // this view only shows the pending count and its own two-pane body.
  return (
    <div dir={dir}>
      {pendingCount > 0 && (
        <div className="mb-3 flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
          <Users className="h-4 w-4" />
          {t('miscPendingCount', { count: pendingCount })}
        </div>
      )}

      {/* Body */}
      {/* 19rem of page chrome above this pane, plus AppTopBar's 4rem. */}
      <div className="flex overflow-hidden rounded-2xl border border-[var(--border)]" style={{ height: 'calc(100vh - 23rem)', minHeight: '24rem' }}>
        {/* Sidebar */}
        <aside className="w-56 border-l border-[var(--border)] bg-[var(--background)] flex-shrink-0 overflow-y-auto">
          <div className="p-3">
            <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-2 mb-2">
              {t('miscProjectsLabel')}
            </p>

            {/* All projects option */}
            <button
              onClick={() => setSelectedProjectId(null)}
              className={`w-full text-right px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between mb-1 ${
                selectedProjectId === null
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-semibold border-r-2 border-[var(--primary)]'
                  : 'text-[var(--foreground)] hover:bg-[var(--primary)]/5'
              }`}
            >
              <span>{t('miscAllProjects')}</span>
              {pendingCount > 0 && (
                <span className="text-[10px] bg-[var(--primary)] text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Project list */}
            {MOCK_PROJECTS.map((p) => {
              const pPending = pendingByProject[p.id] || 0
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`w-full text-right px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between mb-1 ${
                    selectedProjectId === p.id
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-semibold border-r-2 border-[var(--primary)]'
                      : 'text-[var(--foreground)] hover:bg-[var(--primary)]/5'
                  }`}
                >
                  <span className="truncate">{p.title}</span>
                  {pPending > 0 && (
                    <span className="text-[10px] bg-[var(--primary)] text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center flex-shrink-0">
                      {pPending}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('miscSearchNamePlaceholder')}
              className="w-full pr-10 pl-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'bg-white/60 text-[var(--muted-foreground)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]'
                }`}
              >
                {t(STATUS_LABELS[s])}
              </button>
            ))}
          </div>

          {/* Application cards */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8 text-[var(--primary)]" />}
              title={t('miscNoAppsTitle')}
              description={t('miscNoAppsDesc')}
            />
          ) : (
            filtered.map((app) => {
              const badge = STATUS_BADGE[app.status]
              return (
                <div
                  key={app.id}
                  className="glass-card rounded-2xl p-5 mb-3 transition-all hover:shadow-md"
                >
                  {/* Row 1: Avatar + name + role + date */}
                  <div className="flex items-start gap-3 mb-3 relative">
                    <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-semibold flex items-center justify-center flex-shrink-0">
                      {app.userName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--foreground)] text-sm">
                        {app.userName}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {app.userRole}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0">
                      {app.createdAt}
                    </span>
                  </div>

                  {/* Row 2: Requested role */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {t('miscRequestedRoleColon')}
                    </span>
                    <span className="bg-[var(--accent)]/10 text-[var(--foreground)] text-xs rounded-lg px-2 py-0.5 font-medium">
                      {app.requestedRole}
                    </span>
                  </div>

                  {/* Row 3: Message */}
                  <p className="text-sm text-[var(--muted-foreground)] italic line-clamp-2 mb-3 leading-relaxed">
                    &quot;{app.message}&quot;
                  </p>

                  {/* Row 4: Project badge + status + actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[var(--primary)]/8 text-[var(--primary)] text-xs rounded-lg px-2 py-0.5 font-medium">
                      {app.projectName}
                    </span>

                    <span
                      className={`text-xs rounded-lg px-2 py-0.5 font-medium ${badge.className}`}
                    >
                      {t(badge.labelKey)}
                    </span>

                    {app.status === 'pending' && (
                      <div className="flex gap-2 mr-auto">
                        <button
                          onClick={() => handleAccept(app.id)}
                          className="flex items-center gap-1 bg-[var(--secondary)] text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity"
                        >
                          <Check className="w-3 h-3" />
                          {t('miscApprove')}
                        </button>
                        <button
                          onClick={() => handleReject(app.id)}
                          className="flex items-center gap-1 bg-red-50 text-red-500 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-100 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          {t('miscReject')}
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => handleChat(app)}
                      className="mr-auto flex items-center gap-1 border border-[var(--border)] text-[var(--foreground)] rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-[var(--primary)]/5 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      {t('miscOpenChat')}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </main>
      </div>
    </div>
  )
}
