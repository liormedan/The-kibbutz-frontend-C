"use client";
// הקיבוץ – Portfolios view (backed by /api/portfolios)
// Rendered inside the dashboard shell as the "portfolios" tab, and on /portfolios.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Eye, Plus, Loader2 } from "lucide-react";
import { fetchPortfolios } from "@/services/portfolio.service";
import type { PortfolioDto } from "@/lib/api/types";

export default function PortfoliosView() {
  const [portfolios, setPortfolios] = useState<PortfolioDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchPortfolios(1, 12);
      setPortfolios(page?.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "טעינת תיקי העבודות נכשלה");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div dir="rtl" className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">תיקי עבודות</h1>
        <Link
          href="/portfolios/create"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          צור תיק עבודות
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : portfolios.length === 0 ? (
        <div className="rounded-2xl bg-card p-10 text-center text-muted-foreground border border-[var(--border)]">
          אין עדיין תיקי עבודות. צרו את הראשון!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio) => (
            <Link
              key={portfolio.portfolioId}
              href={`/portfolios/${portfolio.portfolioId}`}
              className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm border border-[var(--border)] transition-shadow hover:shadow-md"
            >
              {portfolio.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={portfolio.imageUrl} alt={portfolio.title} className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-primary/10 text-4xl font-bold text-primary">
                  {portfolio.title.trim().charAt(0)}
                </div>
              )}

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold text-foreground line-clamp-2">{portfolio.title}</h2>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                    {portfolio.category}
                  </span>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">{portfolio.owner.fullName}</p>

                <div className="mt-auto flex items-center gap-4 pt-3 text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-xs">
                    <Heart className="h-4 w-4" fill={portfolio.isLikedByCurrentUser ? "currentColor" : "none"} />
                    {portfolio.likesCount}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <Eye className="h-4 w-4" />
                    {portfolio.viewsCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
