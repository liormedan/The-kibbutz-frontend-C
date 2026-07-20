"use client";
// הקיבוץ – Portfolio detail page (NEW — backed by /api/portfolios/:id)

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Heart, Eye, Loader2 } from "lucide-react";
import SocialNav from "@/components/SocialNav";
import {
  fetchPortfolio,
  likePortfolio,
  unlikePortfolio,
} from "@/services/portfolio.service";
import type { PortfolioDto } from "@/lib/api/types";

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("");
}

export default function PortfolioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [portfolio, setPortfolio] = useState<PortfolioDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await fetchPortfolio(id);
      setPortfolio(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "טעינת תיק העבודות נכשלה");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleLike = async () => {
    if (!portfolio) return;
    const liked = portfolio.isLikedByCurrentUser;
    // optimistic
    setPortfolio((prev) =>
      prev
        ? {
            ...prev,
            isLikedByCurrentUser: !liked,
            likesCount: prev.likesCount + (liked ? -1 : 1),
          }
        : prev,
    );
    try {
      if (liked) await unlikePortfolio(portfolio.portfolioId);
      else await likePortfolio(portfolio.portfolioId);
    } catch {
      void load(); // revert to server truth
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <SocialNav />
      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Back */}
        <Link
          href="/portfolios"
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
          חזרה לתיקי העבודות
        </Link>

        {error && (
          <div className="mb-4 rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !portfolio ? (
          <div className="rounded-2xl bg-card p-10 text-center text-muted-foreground border border-[var(--border)]">
            תיק העבודות לא נמצא.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-card shadow-sm border border-[var(--border)]">
            {/* Image */}
            {portfolio.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portfolio.imageUrl}
                alt={portfolio.title}
                className="max-h-96 w-full object-cover"
              />
            ) : (
              <div className="flex h-56 w-full items-center justify-center bg-primary/10 text-6xl font-bold text-primary">
                {portfolio.title.trim().charAt(0)}
              </div>
            )}

            <div className="p-6">
              {/* Title + category */}
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold text-foreground">{portfolio.title}</h1>
                <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {portfolio.category}
                </span>
              </div>

              {/* Owner */}
              <div className="mt-4 flex items-center gap-3">
                {portfolio.owner.profilePictureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={portfolio.owner.profilePictureUrl}
                    alt={portfolio.owner.fullName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {initials(portfolio.owner.fullName)}
                  </div>
                )}
                <p className="text-sm font-semibold text-foreground">
                  {portfolio.owner.fullName}
                </p>
              </div>

              {/* Description */}
              {portfolio.description && (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {portfolio.description}
                </p>
              )}

              {/* Tags */}
              {portfolio.tags && portfolio.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {portfolio.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-background-subtle px-3 py-1 text-xs text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats + like */}
              <div className="mt-6 flex items-center gap-5 border-t border-[var(--border)] pt-4 text-muted-foreground">
                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-1.5 text-sm transition-colors hover:text-primary ${
                    portfolio.isLikedByCurrentUser ? "text-primary" : ""
                  }`}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={portfolio.isLikedByCurrentUser ? "currentColor" : "none"}
                  />
                  {portfolio.likesCount}
                </button>
                <span className="flex items-center gap-1.5 text-sm">
                  <Eye className="h-4 w-4" />
                  {portfolio.viewsCount}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
