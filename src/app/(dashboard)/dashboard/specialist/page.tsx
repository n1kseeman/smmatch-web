import { requireRole } from "@/features/auth/server/session";
import { DashboardOverview } from "@/widgets/dashboard-overview";

export default async function SpecialistDashboardPage() {
  const user = await requireRole(["freelancer", "admin"]);
  return <DashboardOverview mode="freelancer" user={user} />;
}
