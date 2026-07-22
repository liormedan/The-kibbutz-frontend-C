import { redirect } from "next/navigation";

// "My teams" is now a tab of the project management hub. The old community
// team browse (TeamsView) is no longer reachable from the navigation.
export default function TeamsRedirect() {
  redirect("/my-projects/teams");
}
