import { redirect } from "next/navigation";

// Legacy route. Middleware already redirects /dashboard/* to /admin/*,
// this file is just a safety net. Safe to delete once you remove the folder.
export default function LegacyDashboard() {
  redirect("/admin");
}
