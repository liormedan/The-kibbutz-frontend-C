import { redirect } from "next/navigation";

// Portfolios now live inside the dashboard shell as a tab.
// Keep this route as a redirect so old links / bookmarks still work.
export default function PortfoliosPage() {
  redirect("/dashboard?tab=portfolios");
}
