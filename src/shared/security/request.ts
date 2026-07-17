import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { getPublicEnv, isSupabaseConfigured } from "@/shared/config/env";

const PRIVATE_NO_STORE = "private, no-store, max-age=0, must-revalidate";

export function withPrivateNoStore<T extends NextResponse>(response: T): T {
  response.headers.set("Cache-Control", PRIVATE_NO_STORE);
  response.headers.set("Pragma", "no-cache");
  return response;
}

export function isTrustedRequestOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const requestOrigin = host
    ? `${request.nextUrl.protocol}//${host}`
    : request.nextUrl.origin;
  const expectedOrigin = isSupabaseConfigured()
    ? new URL(getPublicEnv().NEXT_PUBLIC_APP_URL).origin
    : requestOrigin;

  if (origin) return origin === expectedOrigin;

  // Browsers attach Origin to modern form POSTs. This preserves a safe fallback
  // for older same-origin navigations without allowing cross-site requests.
  return request.headers.get("sec-fetch-site") === "same-origin";
}

export function rejectUntrustedMutation(request: NextRequest) {
  if (isTrustedRequestOrigin(request)) return null;

  return NextResponse.json(
    {
      error: {
        code: "invalid_origin",
        message: "This request must originate from SMMatch.",
      },
    },
    { status: 403, headers: { "Cache-Control": PRIVATE_NO_STORE } },
  );
}
