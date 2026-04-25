import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { DASHBOARD_COOKIE_NAME, DASHBOARD_COOKIE_VALUE, getDashboardPassword } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { password?: string };

  if (!body.password || body.password !== getDashboardPassword()) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(DASHBOARD_COOKIE_NAME, DASHBOARD_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return NextResponse.json({ ok: true });
}
