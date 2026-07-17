import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/shared/config/env";
import type { Database } from "@/shared/types/database.generated";

export function createAdminClient() {
  const env = getServerEnv();

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
