'use client'
/**
 * הקיבוץ – Empty State Component
 * קומפוננטה רב-שימושית להצגת מצב ריק במערכת
 */

import React from 'react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className="glass-panel rounded-2xl p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8 gap-4 border border-[var(--border)]/60"
      dir="rtl"
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center flex-shrink-0 mb-2">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-[var(--foreground)] leading-tight">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-xs">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
