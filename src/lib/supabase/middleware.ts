import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { env, requireSupabasePublic } from "@/lib/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Refreshes the Supabase session cookies so Server Components see a fresh user.
// Also enforces the admin email allowlist on /admin/* routes.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // If Supabase isn't configured yet (Phase 1 with only DASHBOARD_PASSWORD),
  // skip the session refresh entirely so dev still works.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const { url, anonKey } = requireSupabasePublic();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    const allowlist = env.ADMIN_EMAIL_ALLOWLIST;
    const emailOk = user?.email ? allowlist.includes(user.email.toLowerCase()) : false;

    // Allow if: logged in with allowed email
    // OR legacy cookie is set (Phase 1 fallback) — checked in middleware itself below.
    if (!emailOk) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}
