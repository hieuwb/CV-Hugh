// Single place for reading env vars so typos fail loud.
// Mark vars as required only when code actually needs them at runtime.

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.length === 0) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

function optional(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

export const env = {
  // Supabase — public
  SUPABASE_URL: optional("NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_ANON_KEY: optional("NEXT_PUBLIC_SUPABASE_ANON_KEY"),

  // Supabase — server-only
  get SUPABASE_SERVICE_ROLE_KEY() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get DATABASE_URL() {
    return required("DATABASE_URL");
  },

  // Legacy password gate (Phase 1 fallback; removed after Phase 2)
  DASHBOARD_PASSWORD: process.env.DASHBOARD_PASSWORD ?? "change-me",
  ADMIN_EMAIL_ALLOWLIST: (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),

  // Wallet module (Phase 4)
  ENCRYPTION_PEPPER: optional("ENCRYPTION_PEPPER"),
  ALCHEMY_API_KEY: optional("ALCHEMY_API_KEY"),
  HELIUS_API_KEY: optional("HELIUS_API_KEY"),
  WC_PROJECT_ID: optional("NEXT_PUBLIC_WC_PROJECT_ID"),

  // Jobs
  QSTASH_TOKEN: optional("QSTASH_TOKEN"),

  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  IS_PROD: process.env.NODE_ENV === "production"
};

export function requireSupabasePublic(): { url: string; anonKey: string } {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase public env missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }
  return { url: env.SUPABASE_URL, anonKey: env.SUPABASE_ANON_KEY };
}
