import AppShell from "@/components/AppShell";

// Hosted by the shared app shell (fixed sidebar). No page stands alone.
export default function MyPortfolioLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
