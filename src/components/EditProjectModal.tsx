'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { updateProject } from '@/services/project.service';
import type { Project, ProjectStatus } from '@/types/project.types';

interface Props {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProjectModal({ project, isOpen, onClose }: Props) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [tags, setTags] = useState(project.tags.join(', '));
  const [maxMembers, setMaxMembers] = useState(project.maxMembers);
  const [websiteUrl, setWebsiteUrl] = useState(project.websiteUrl ?? '');
  const [visualUrl, setVisualUrl] = useState(project.visualUrl ?? '');
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync state with project if it changes
  useEffect(() => {
    queueMicrotask(() => {
      setTitle(project.title);
      setDescription(project.description);
      setTags(project.tags.join(', '));
      setMaxMembers(project.maxMembers);
      setWebsiteUrl(project.websiteUrl ?? '');
      setVisualUrl(project.visualUrl ?? '');
      setStatus(project.status);
    });
  }, [project]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('נא להזין כותרת לפרויקט');
      return;
    }
    if (!description.trim()) {
      setError('נא להזין תיאור לפרויקט');
      return;
    }

    const tagsArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    setError('');
    setLoading(true);

    try {
      await updateProject(project.id, {
        title: title.trim(),
        description: description.trim(),
        tags: tagsArray,
        maxMembers: Number(maxMembers),
        websiteUrl: websiteUrl.trim() || undefined,
        visualUrl: visualUrl.trim() || undefined,
        status,
      });
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError('שגיאה בעדכון הפרויקט. נא לנסות שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleOverlayClick}
      dir="rtl"
    >
      <div className="relative max-w-lg w-full glass-panel rounded-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="סגור"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-bold text-foreground mb-1">עריכת פרטי פרויקט</h2>
        <p className="text-xs text-muted-foreground mb-5">
          עדכן את פרטי הפרויקט שיוצגו למועמדים ולחברי הקהילה.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">שם הפרויקט *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="שם הפרויקט"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">תיאור הפרויקט *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="תאר את הפרויקט, המטרות שלו ומי קהל היעד..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">תגיות (מופרדות בפסיקים)</label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="לדוגמה: React, Python, AI"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">מספר חברים מקסימלי</label>
              <input
                type="number"
                value={maxMembers}
                onChange={e => setMaxMembers(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">קישור לאתר אינטרנט</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">קישור לדמו ויזואלי / Figma</label>
              <input
                type="url"
                value={visualUrl}
                onChange={e => setVisualUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="https://figma.com/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">סטטוס פרויקט</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ProjectStatus)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
            >
              <option value="open">פתוח לגיוס שותפים (Open)</option>
              <option value="closed">סגור / הושלם (Closed)</option>
            </select>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #d2642d, #e8753d)' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              שמור שינויים
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
      </div>
    </div>
  );
}
