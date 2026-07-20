import AppShell from "@/components/AppShell";

// Every page in this segment renders inside the shared app shell
// (fixed sidebar: right in RTL / left in LTR). No page stands alone.
export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
