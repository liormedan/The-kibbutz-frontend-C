'use client'
/**
 * הקיבוץ – Global Error Boundary
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Compass } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter()

  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4' dir='rtl'>
      <div className='glass-panel max-w-md w-full rounded-2xl p-8 text-center'>
        <div className='w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6'>
          <AlertTriangle className='w-8 h-8 text-red-500' />
        </div>
        <h1 className='text-2xl font-bold text-foreground mb-2'>אופס! משהו השתבש</h1>
        <p className='text-sm text-muted-foreground mb-6'>אירעה שגיאה בלתי צפויה. נסה שוב או חזור לדף הבית.</p>
        {error.digest && (
          <div className='glass-card rounded-xl px-3 py-2 text-xs font-mono text-muted-foreground mb-6 text-right'>
            קוד שגיאה: {error.digest}
          </div>
        )}
        <div className='flex gap-3 justify-center'>
          <button
            onClick={reset}
            style={{ background: 'linear-gradient(135deg, #d2642d, #e8753d)' }}
            className='flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity'
          >
            נסה שוב
          </button>
          <button
            onClick={() => router.push('/')}
            className='flex items-center gap-2 border border-[var(--border)] px-5 py-2.5 rounded-xl font-medium text-sm text-foreground hover:border-primary transition-colors'
          >
            <Compass className='w-4 h-4' />
            דף הבית
          </button>
        </div>
      </div>
    </div>
  )
}
