import { redirect } from "next/navigation";

// Join requests are now a tab of the project management hub.
export default function ApplicationsRedirect() {
  redirect("/my-projects/requests");
}
