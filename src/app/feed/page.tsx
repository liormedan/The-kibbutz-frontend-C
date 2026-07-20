import AppShell from "@/components/AppShell";
import FeedView from "@/components/views/FeedView";

// The feed page — rendered inside the shared app shell (fixed sidebar).
export default function FeedPage() {
  return (
    <AppShell>
      <FeedView />
    </AppShell>
  );
}
