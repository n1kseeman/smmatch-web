import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getRouteAccess, guestOnlyRoutes } from "@/features/auth/config/access";
import { getPublicEnv, isSupabaseConfigured } from "@/shared/config/env";
import { withPrivateNoStore } from "@/shared/security/request";
import type { Database } from "@/shared/types/database.generated";

export async function updateSession(request: NextRequest) {
  const access = getRouteAccess(request.nextUrl.pathname);

  if (!isSupabaseConfigured()) {
    if (access) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      loginUrl.searchParams.set("error", "configuration");
      return withPrivateNoStore(NextResponse.redirect(loginUrl));
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const env = getPublicEnv();
  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  if (access && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return withPrivateNoStore(NextResponse.redirect(loginUrl));
  }

  if (
    isAuthenticated &&
    guestOnlyRoutes.some(
      (route) =>
        request.nextUrl.pathname === route ||
        request.nextUrl.pathname.startsWith(`${route}/`),
    )
  ) {
    return withPrivateNoStore(
      NextResponse.redirect(new URL("/dashboard", request.url)),
    );
  }

  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth/");
  return access || isAuthRoute ? withPrivateNoStore(response) : response;
}
