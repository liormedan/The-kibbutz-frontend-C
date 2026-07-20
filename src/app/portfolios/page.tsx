import AppShell from "@/components/AppShell";
import PortfoliosView from "@/components/views/PortfoliosView";

// The portfolios page — rendered inside the shared app shell (fixed sidebar).
export default function PortfoliosPage() {
  return (
    <AppShell>
      <PortfoliosView />
    </AppShell>
  );
}
