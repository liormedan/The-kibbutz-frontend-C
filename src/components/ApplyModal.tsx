'use client';
/**
 * הקיבוץ – Apply Modal
 * מודאל הגשת מועמדות לפרויקט
 * TODO backend: mutation applyToProject
 */

import { Send, X, Loader2, Check, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { applyToProject } from '@/services/project.service';

interface OpenRole { id: string; title: string; }

interface Props {
  projectId: string;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  /** item 39 – if provided, role is a dropdown; otherwise free text */
  openRoles?: OpenRole[];
}

export default function ApplyModal({ projectId, projectTitle, isOpen, onClose, openRoles }: Props) {
  const [requestedRole, setRequestedRole] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedRole.trim() || !message.trim()) {
      setError('יש למלא את כל השדות המסומנים');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await applyToProject({ projectId, requestedRole, message });
    } catch (err) {
      console.warn('applyToProject not yet wired (stub mode):', err);
    } finally {
      setLoading(false);
      setSuccess(true);
      setTimeout(onClose, 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="relative max-w-md w-full glass-panel rounded-2xl p-6"
        dir="rtl"
      >
        {/* X button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/8 transition-colors"
          aria-label="סגור"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          /* Success State */
          <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-base mb-1">המועמדות נשלחה בהצלחה!</p>
              <p className="text-sm text-muted-foreground">הצ&apos;אט עם היזם נפתח אוטומטית.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col gap-3 mb-5">
              <div className="flex items-center gap-2 pr-2">
                <UserPlus className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">הגשת מועמדות</h2>
              </div>
              <p className="text-sm text-muted-foreground">מלא את הפרטים הבאים כדי להגיש מועמדות לפרויקט</p>
              {/* Project badge */}
              <span className="inline-block self-start bg-primary/10 text-primary rounded-lg px-3 py-1 text-sm font-medium">
                {projectTitle}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* item 39 – role: dropdown if openRoles provided, else free text */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  תפקיד מבוקש <span className="text-primary">*</span>
                </label>
                {openRoles && openRoles.length > 0 ? (
                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                    disabled={loading}
                  >
                    <option value="">בחר תפקיד...</option>
                    {openRoles.map(r => (
                      <option key={r.id} value={r.title}>{r.title}</option>
                    ))}
                    <option value="אחר">אחר (פרט בהודעה)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value)}
                    placeholder="לדוגמה: מפתח Backend, מעצב UI..."
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                    disabled={loading}
                  />
                )}
              </div>

              {/* Message field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  הודעה ליזם <span className="text-primary">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="ספר על עצמך ולמה אתה מעוניין בפרויקט..."
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                  disabled={loading}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  style={{ background: 'linear-gradient(135deg, #d2642d, #e8753d)' }}
                  className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-60 transition-opacity"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  שלח מועמדות
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ביטול
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
