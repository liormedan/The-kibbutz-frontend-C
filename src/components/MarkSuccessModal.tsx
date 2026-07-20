'use client';

import { Award, Check, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { approveProjectSuccess } from '@/services/project.service';

interface Member {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

interface Props {
  projectId: string;
  projectTitle: string;
  members: Member[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MarkSuccessModal({ projectId, projectTitle, members, isOpen, onClose }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) return;
    setLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(userId =>
          approveProjectSuccess(projectId, userId)
        )
      );
      setSuccess(true);
    } catch (err) {
      console.error('[MarkSuccessModal] approveProjectSuccess failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="relative max-w-lg w-full glass-panel rounded-2xl p-6"
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
          <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
            <Award className="w-14 h-14 text-accent" />
            <div>
              <p className="font-bold text-foreground text-lg mb-1">הוענקו תגי הצלחה בהצלחה!</p>
              <p className="text-sm text-muted-foreground">המשתתפים שנבחרו יקבלו תג הצלחה בפרופיל שלהם.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col gap-3 mb-5">
              <div className="flex items-center gap-2 pr-2">
                <Award className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-bold text-foreground">אישור הצלחת פרויקט</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                סמן את המשתמשים שתרמו להצלחה — הם יקבלו תג הצלחה בפרופיל שלהם
              </p>
              {/* Project badge */}
              <span className="inline-block self-start bg-primary/10 text-primary rounded-lg px-3 py-1 text-sm font-medium">
                {projectTitle}
              </span>
            </div>

            {/* Members list */}
            <div className="flex flex-col gap-2 mb-5 max-h-64 overflow-y-auto">
              {members.map((member) => {
                const isSelected = selectedIds.has(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className={`flex items-center gap-3 cursor-pointer border rounded-xl p-3 transition-colors ${
                      isSelected
                        ? 'border-secondary/40 bg-secondary/5'
                        : 'border-[var(--border)] hover:border-secondary/20'
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-secondary border-secondary'
                          : 'border-[var(--border)] bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>

                    {/* Avatar initials */}
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center flex-shrink-0">
                      {member.name.charAt(0)}
                    </div>

                    {/* Name & role */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">{member.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{member.role}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={selectedIds.size === 0 || loading}
                style={{ background: 'linear-gradient(135deg, #d2642d, #e8753d)' }}
                className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-50 transition-opacity"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Award className="w-4 h-4" />
                )}
                אשר הצלחה ({selectedIds.size} משתתפים)
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
          </>
        )}
      </div>
    </div>
  );
}
