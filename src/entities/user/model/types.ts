export const appRoles = ["guest", "customer", "freelancer", "admin"] as const;

export type AppRole = (typeof appRoles)[number];
export type AuthenticatedRole = Exclude<AppRole, "guest">;

export type CurrentUser = {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  role: AuthenticatedRole;
};
