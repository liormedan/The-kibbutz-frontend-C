// הקיבוץ – Portfolios Service (REST)
// Backend PortfoliosController (/api/portfolios).
// Powers the NEW portfolio pages (the backend's real showcase feature).

import { api } from "@/lib/api/client";
import type {
  PaginatedResponse,
  PortfolioDto,
  CreatePortfolioDto,
} from "@/lib/api/types";

export function fetchPortfolios(pageNumber = 1, pageSize = 12) {
  return api.get<PaginatedResponse<PortfolioDto>>("/api/portfolios", {
    pageNumber,
    pageSize,
  });
}

export function fetchPortfolio(portfolioId: string) {
  return api.get<PortfolioDto>(`/api/portfolios/${portfolioId}`);
}

export function createPortfolio(input: CreatePortfolioDto) {
  return api.post<PortfolioDto>("/api/portfolios", input);
}

export function likePortfolio(portfolioId: string) {
  return api.post<boolean>(`/api/portfolios/${portfolioId}/like`);
}

export function unlikePortfolio(portfolioId: string) {
  return api.del<boolean>(`/api/portfolios/${portfolioId}/like`);
}

export function deletePortfolio(portfolioId: string) {
  return api.del<boolean>(`/api/portfolios/${portfolioId}`);
}
