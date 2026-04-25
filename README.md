# Ocean CV — Personal Dashboard

Phase 1 foundation for the project described in `dashboard-plan.md` and
`dashboard-wallet-plan.md`. Stack: Next.js 14 App Router + Supabase + Drizzle +
Tailwind (shadcn-ready). $0/month on free tiers.

## Quick start (Phase 1 — no Supabase required)

```bash
npm install
cp .env.example .env.local          # edit DASHBOARD_PASSWORD at minimum
npm run dev
```

- Public landing: http://localhost:3000
- Admin area:    http://localhost:3000/admin  (password gate at `/login`)

All `/admin/*` navigation already exists as stubs. Data-driven screens light up
in Phase 2 once Supabase is wired.

## Repository layout

```
src/
  app/
    layout.tsx              ← global header + font
    page.tsx                ← public landing
    login/page.tsx          ← password gate (Phase 1) → magic link (Phase 2)
    (public)/
      projects/page.tsx     ← stub, Phase 3
      cv/page.tsx           ← stub, Phase 3
    (admin)/
      admin/
        layout.tsx          ← sidebar nav + logout
        page.tsx            ← overview widgets
        airdrops/page.tsx   ← stub, Phase 2
        hackathons/page.tsx ← stub, Phase 2
        projects/page.tsx   ← stub, Phase 2
        cv/page.tsx         ← stub, Phase 2
        wallets/page.tsx    ← stub, Phase 4
    api/auth/{login,logout}/route.ts
    dashboard/*             ← legacy redirects (safe to delete, see below)
  components/logout-button.tsx
  lib/
    env.ts                  ← single source of truth for env vars
    utils.ts                ← cn, formatUsd, formatDate, slugify
    auth/session.ts         ← legacy password cookie helper
    supabase/
      client.ts             ← browser client
      server.ts             ← Server Component / Server Action client
      middleware.ts         ← (currently unused, middleware.ts does the work)
      admin.ts              ← service-role client (server-only)
    db/
      schema.ts             ← full Drizzle schema
      client.ts             ← postgres-js + drizzle singleton
  middleware.ts             ← auth gate on /admin/*, redirects /dashboard/*
supabase/
  migrations/0001_init.sql  ← portfolio + wallet tables + RLS
```

## Manual cleanup

The sandbox couldn't delete `src/app/dashboard/` (permission denied). Those two
files are now redirect stubs. Once you pull locally, delete the folder:

```bash
rm -rf src/app/dashboard
```

Middleware already redirects `/dashboard/*` → `/admin/*`, so URLs keep working.

## Phase 2 setup — Supabase

1. Create a project at https://supabase.com/ (free tier).
2. Project settings → API → copy the URL, anon key, and service role key into
   `.env.local`.
3. Project settings → Database → copy the **Session mode pooler** connection
   string into `DATABASE_URL` (port 5432, not 6543 — transaction mode breaks
   Drizzle prepared statements).
4. Run the migration:
   - Option A (SQL editor): paste `supabase/migrations/0001_init.sql`.
   - Option B (CLI): `npx supabase db push` after linking the project.
5. Turn on **Magic Link** in Authentication → Providers, set redirect URL to
   `http://localhost:3000/auth/callback` and your prod domain.
6. Sign in once via the magic link, then grant yourself admin:

   ```sql
   insert into admin_users (user_id, email)
   select id, email from auth.users where email = 'you@example.com';
   ```

7. Set `ADMIN_EMAIL_ALLOWLIST=you@example.com` in `.env.local` + Vercel envs.
8. Remove `DASHBOARD_PASSWORD` from your environment once Phase 2 lands — the
   password gate is only a stopgap.

## Phase 4 setup — Wallet module

Additional env vars (see `.env.example`):

- `ENCRYPTION_PEPPER` — `openssl rand -hex 32`
- `ALCHEMY_API_KEY`, `HELIUS_API_KEY`, `NEXT_PUBLIC_WC_PROJECT_ID`
- `QSTASH_*` for scheduled gas-drip jobs

Security invariants enforced at the schema level:

- `user_vault` stores only salt + KDF params + a verifier ciphertext.
- `wallets` has a CHECK constraint: any row with `wallet_type='burner'` must
  include `encrypted_pk + iv + auth_tag`. Plaintext PKs are never stored.
- All wallet tables have RLS gated on `is_admin()`; even leaked anon keys
  cannot read them.

## Scripts

```bash
npm run dev          # next dev --turbo (Turbopack — required on this Windows host, see below)
npm run dev:webpack  # fallback webpack-mode dev (known to hang, don't use)
npm run build        # production build — hangs on Windows 10 + Next 14.2 webpack, use Vercel CI instead
npm run start
npm run lint
npm run typecheck
npm run db:generate  # drizzle-kit generate — emit SQL from schema.ts
npm run db:push      # drizzle-kit push     — apply schema directly (dev)
npm run db:studio    # drizzle-kit studio   — local browser GUI
```

### Known issue: `npm run build` hangs on this host

Next 14.2 webpack build deadlocks on this Windows 10 + Node 22 setup. Verified
that it hangs with a fresh `.next`, no env file, no middleware, and the minimal
config — so it's an environment issue, not a code issue. Workarounds:

1. **Recommended:** push to GitHub, let **Vercel** build on Linux. Vercel build
   works fine — this issue is local only.
2. Build in **WSL2**: `cd /mnt/d/Crypto/DASHBOARD && npm run build`.
3. Upgrade to **Next 15** later — `next build --turbopack` is stable there.

`npm run dev` (Turbopack) is unaffected, compiles in ~13 s first time / sub-second
on HMR.

## Phase status

- [x] **Phase 1** — foundation (this commit)
- [ ] **Phase 2** — Supabase Auth magic link + admin CRUD
- [ ] **Phase 3** — public portfolio + `/cv` + PDF export + OG images
- [ ] **Phase 4** — wallet manager (a–d, see `dashboard-wallet-plan.md`)

## Next step

Confirm Phase 1 runs locally (`npm install && npm run dev`, visit `/` and
`/admin` with the password), then we move to Phase 2.
