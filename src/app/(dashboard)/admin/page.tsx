import { requireRole } from "@/features/auth/server/session";
import { DashboardOverview } from "@/widgets/dashboard-overview";

export default async function AdminPage() {
  const user = await requireRole(["admin"]);
  return <DashboardOverview mode="admin" user={user} />;
}
