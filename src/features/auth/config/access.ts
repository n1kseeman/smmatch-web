import type { AppRole, AuthenticatedRole } from "@/entities/user/model/types";

type ProtectedRoute = {
  prefix: string;
  roles: readonly AuthenticatedRole[];
};

export const protectedRoutes: readonly ProtectedRoute[] = [
  { prefix: "/dashboard/business", roles: ["customer", "admin"] },
  { prefix: "/dashboard/customer", roles: ["customer", "admin"] },
  { prefix: "/dashboard/specialist", roles: ["freelancer", "admin"] },
  { prefix: "/admin", roles: ["admin"] },
  {
    prefix: "/messages",
    roles: ["customer", "freelancer", "admin"],
  },
  { prefix: "/orders", roles: ["customer", "freelancer", "admin"] },
  {
    prefix: "/auth/update-password",
    roles: ["customer", "freelancer", "admin"],
  },
];

export const guestOnlyRoutes = ["/auth/login", "/auth/register"] as const;

export function getRouteAccess(pathname: string) {
  return protectedRoutes.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function canAccessRoute(role: AppRole, pathname: string) {
  const access = getRouteAccess(pathname);
  if (!access) return true;
  return role !== "guest" && access.roles.includes(role);
}

export function getRoleHome(role: AuthenticatedRole) {
  if (role === "admin") return "/admin";
  if (role === "freelancer") return "/dashboard/specialist";
  return "/dashboard/business";
}
