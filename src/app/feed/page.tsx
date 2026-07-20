import FeedView from "@/components/views/FeedView";

// The feed page. The shared shell (fixed sidebar) is provided by feed/layout.tsx.
export default function FeedPage() {
  return (
    <div className="p-4 md:p-6">
      <FeedView />
    </div>
  );
}
