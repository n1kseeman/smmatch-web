import type { ReactNode } from "react";

import { requireRole } from "@/features/auth/server/session";
import { DashboardShell } from "@/widgets/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function BusinessDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole(["customer", "admin"]);
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
