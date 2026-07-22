"use client";
// הקיבוץ – My portfolio (/my-portfolio)
// The personal counterpart to /portfolios: only the current user's own items.
// The backend has no "my portfolios" endpoint yet, so we fetch the list and
// filter by owner — see BACKEND_GAPS.md.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, Eye, Heart, Loader2, Plus } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { fetchPortfolios } from "@/services/portfolio.service";
import type { PortfolioDto } from "@/lib/api/types";
import { useAuthStore } from "@/store/useAuthStore";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function MyPortfolioView() {
  const { t, dir } = useI18n();
  const currentUser = useAuthStore((s) => s.user);
  const [all, setAll] = useState<PortfolioDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchPortfolios(1, 50);
      setAll(page?.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("socialPortfoliosLoadError"));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const mine = useMemo(
    () => all.filter((p) => p.owner?.userId && p.owner.userId === currentUser?.id),
    [all, currentUser?.id],
  );

  return (
    <div dir={dir} className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Briefcase className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("myPortfolio")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("myPortfolioSub")}</p>
          </div>
        </div>
        <Link
          href="/portfolios/create"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {t("socialCreatePortfolio")}
        </Link>
      </div>

      {error && (
        <p className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : mine.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-8 w-8 text-primary" />}
          title={t("myPortfolioEmpty")}
          description={t("myPortfolioEmptySub")}
        />
      ) : (
        <div className="space-y-3">
          {mine.map((p) => (
            <Link
              key={p.portfolioId}
              href={`/portfolios/${p.portfolioId}`}
              className="glass-card block rounded-2xl p-5 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{p.title}</p>
                  {p.description && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                  )}
                  <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                    {p.category}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{p.likesCount}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{p.viewsCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
