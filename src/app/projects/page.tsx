import { redirect } from "next/navigation";

// "Discover projects" lives at /dashboard (the authenticated home). The old
// public /projects browse was a duplicate of it, so this route now redirects.
// The real sub-pages /projects/[id] and /projects/create stay as-is.
export default function ProjectsIndexPage() {
  redirect("/dashboard");
}
