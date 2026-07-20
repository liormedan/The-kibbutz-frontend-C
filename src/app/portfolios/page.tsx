import PortfoliosView from "@/components/views/PortfoliosView";

// The portfolios page. The shared shell (fixed sidebar) is provided by portfolios/layout.tsx.
export default function PortfoliosPage() {
  return (
    <div className="p-4 md:p-6">
      <PortfoliosView />
    </div>
  );
}
