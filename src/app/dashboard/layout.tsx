import AppShell from "@/components/AppShell";

// The whole /dashboard segment (explore home + applications) is hosted by the
// shared app shell (fixed sidebar). No page here stands alone.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
