import { redirect } from "next/navigation";

// The feed now lives inside the dashboard shell as a tab.
// Keep this route as a redirect so old links / bookmarks still work.
export default function FeedPage() {
  redirect("/dashboard?tab=feed");
}
