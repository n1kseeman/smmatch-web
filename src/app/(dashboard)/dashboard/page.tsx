import { redirectToRoleHome } from "@/features/auth/server/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await redirectToRoleHome();
}
