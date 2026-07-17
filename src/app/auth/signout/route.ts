import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/shared/config/env";
import { createClient } from "@/shared/api/supabase/server";
import {
  rejectUntrustedMutation,
  withPrivateNoStore,
} from "@/shared/security/request";

export async function POST(request: NextRequest) {
  const rejected = rejectUntrustedMutation(request);
  if (rejected) return rejected;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  return withPrivateNoStore(
    NextResponse.redirect(new URL("/auth/login", request.url), 303),
  );
}
