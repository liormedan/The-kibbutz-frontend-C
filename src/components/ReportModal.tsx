'use client';

import { useState } from 'react';
import { AlertTriangle, X, Loader2, Check } from 'lucide-react';
import { createReport } from '@/services/report.service';

interface Props {
  reportedUserId: string;
  reportedName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({ reportedUserId, reportedName, isOpen, onClose }: Props) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      setError('נא לפרט את הסיבה (לפחות 10 תווים)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createReport(reportedUserId, reason.trim());
      setSuccess(true);
    } catch {
      setError('שגיאה בשליחת הדיווח. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="relative max-w-md w-full glass-panel rounded-2xl p-6" dir="rtl">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="סגור"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="flex flex-col items-center py-8 text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-foreground text-lg mb-1">הדיווח נשלח</p>
              <p className="text-sm text-muted-foreground">נבחן את הדיווח בהקדם. תודה.</p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl border border-[var(--border)] text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              סגור
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4 pr-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-foreground">דיווח על {reportedName}</h2>
            </div>

            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              הדיווחים נבדקים ע&quot;י צוות הקיבוץ. שימוש לרעה במנגנון הדיווח עלול להוביל לחסימת חשבון.
            </p>

            <textarea
              value={reason}
              onChange={e => { setReason(e.target.value); setError(''); }}
              placeholder="תאר את הבעיה: הטרדה, התנהגות לא ראויה, שימוש לרעה..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-background text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none mb-2"
            />

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                שלח דיווח
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ביטול
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
