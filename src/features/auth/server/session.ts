import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import type {
  AuthenticatedRole,
  CurrentUser,
} from "@/entities/user/model/types";
import { getRoleHome } from "@/features/auth/config/access";
import { isSupabaseConfigured } from "@/shared/config/env";
import { createClient } from "@/shared/api/supabase/server";

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) return null;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, email, display_name, avatar_url, role")
    .eq("id", userId)
    .single();

  if (profileError || !profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    role: profile.role,
  };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return user;
}

export async function requireRole(allowedRoles: readonly AuthenticatedRole[]) {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) redirect("/unauthorized");
  return user;
}

export async function redirectToRoleHome() {
  const user = await requireUser();
  redirect(getRoleHome(user.role));
}
