import { NextResponse } from "next/server";

import { getCurrentUser } from "@/features/auth/server/session";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Authentication required" } },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return NextResponse.json(
    { data: user },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
