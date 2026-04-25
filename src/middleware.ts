import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { DASHBOARD_COOKIE_NAME, DASHBOARD_COOKIE_VALUE } from "@/lib/auth/session";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Runs only on matched requests (see `config.matcher` below).
// - Redirects legacy /dashboard/* → /admin/*.
// - Gates /admin/* with either the legacy password cookie OR a Supabase
//   session whose email is on the allowlist.
// Public routes (/, /projects, /cv, /login, /api/auth/*) skip everything.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Legacy URL redirect — cheap, no network.
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/dashboard/, "/admin");
    return NextResponse.redirect(url);
  }

  // Everything after this point only applies to /admin/*.
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Fast path: legacy password cookie.
  if (request.cookies.get(DASHBOARD_COOKIE_NAME)?.value === DASHBOARD_COOKIE_VALUE) {
    return NextResponse.next();
  }

  // Otherwise try a Supabase session (Phase 2+).
  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseConfigured) {
    let response = NextResponse.next({ request });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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
      }
    );

    const { data } = await supabase.auth.getUser();
    const email = data.user?.email?.toLowerCase();
    const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (email && allowlist.includes(email)) {
      return response;
    }
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"]
};
