import AppShell from "@/components/AppShell";

// Rendered inside the shared app shell (fixed sidebar). No page stands alone.
export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
