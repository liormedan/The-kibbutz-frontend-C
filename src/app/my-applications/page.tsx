import { redirect } from "next/navigation";

// Sent applications are now a tab of the project management hub.
export default function MyApplicationsRedirect() {
  redirect("/my-projects/applications");
}
