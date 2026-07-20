/**
 * הקיבוץ – 404 Not Found Page
 */

import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4' dir='rtl'>
      <div className='glass-panel max-w-md w-full rounded-2xl p-8 text-center'>
        <div className='text-8xl font-black text-primary/20 mb-4 leading-none'>404</div>
        <div className='w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4'>
          <Compass className='w-7 h-7 text-primary' />
        </div>
        <h1 className='text-2xl font-bold text-foreground mb-2'>דף לא נמצא</h1>
        <p className='text-sm text-muted-foreground mb-8'>העמוד שחיפשת לא קיים. ייתכן שהקישור שגוי או שהדף הוסר.</p>
        <div className='flex gap-3 justify-center flex-wrap'>
          <Link
            href='/dashboard'
            style={{ background: 'linear-gradient(135deg, #d2642d, #e8753d)' }}
            className='text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity'
          >
            חזור לדשבורד
          </Link>
          <Link
            href='/'
            className='border border-[var(--border)] px-5 py-2.5 rounded-xl font-medium text-sm text-foreground hover:border-primary transition-colors'
          >
            דף הבית
          </Link>
        </div>
      </div>
    </div>
  )
}
