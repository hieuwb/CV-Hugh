import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env, requireSupabasePublic } from "@/lib/env";

// Service-role client: bypasses RLS. Use SPARINGLY and only server-side
// (route handlers / server actions). Never import this in a client component.
export function createSupabaseAdminClient() {
  const { url } = requireSupabasePublic();
  return createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
