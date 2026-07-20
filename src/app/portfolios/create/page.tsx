"use client";
// הקיבוץ – Create portfolio page (NEW — backed by POST /api/portfolios)

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, Send } from "lucide-react";
import { createPortfolio } from "@/services/portfolio.service";

const CATEGORIES = ["עיצוב", "פיתוח", "אמנות", "צילום", "אחר"];

export default function CreatePortfolioPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();
    if (!trimmedTitle || !trimmedCategory) {
      setError("יש למלא כותרת וקטגוריה");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const created = await createPortfolio({
        title: trimmedTitle,
        category: trimmedCategory,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
      });
      router.push(`/portfolios/${created.portfolioId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "יצירת תיק העבודות נכשלה");
      setPending(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Back */}
        <Link
          href="/portfolios"
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
          חזרה לתיקי העבודות
        </Link>

        <h1 className="mb-6 text-xl font-bold text-foreground">צור תיק עבודות</h1>

        {error && (
          <div className="mb-4 rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl bg-card p-6 shadow-sm border border-[var(--border)]"
        >
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              כותרת <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="שם תיק העבודות"
              required
              className="w-full rounded-xl bg-background-subtle p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              קטגוריה <span className="text-primary">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full rounded-xl bg-background-subtle p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              תיאור
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ספרו על תיק העבודות..."
              rows={4}
              className="w-full resize-none rounded-xl bg-background-subtle p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              כתובת תמונה
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              dir="ltr"
              className="w-full rounded-xl bg-background-subtle p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">
              תגיות
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="הפרדה בפסיקים, לדוגמה: עיצוב, לוגו, מיתוג"
              className="w-full rounded-xl bg-background-subtle p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending || !title.trim() || !category.trim()}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              יצירה
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
