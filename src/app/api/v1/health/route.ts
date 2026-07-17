import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/shared/config/env";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "smmatch-web",
      version: process.env.npm_package_version ?? "0.1.0",
      checks: {
        supabaseConfigured: isSupabaseConfigured(),
      },
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
