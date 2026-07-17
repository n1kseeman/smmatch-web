import { requireRole } from "@/features/auth/server/session";
import { DashboardOverview } from "@/widgets/dashboard-overview";

export default async function BusinessDashboardPage() {
  const user = await requireRole(["customer", "admin"]);
  return <DashboardOverview mode="customer" user={user} />;
}
