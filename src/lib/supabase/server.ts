import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { requireSupabasePublic } from "@/lib/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// For use in Server Components, Route Handlers, and Server Actions.
export async function createSupabaseServerClient() {
  const { url, anonKey } = requireSupabasePublic();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; middleware will refresh them.
        }
      }
    }
  });
}
