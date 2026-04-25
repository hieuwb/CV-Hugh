-- =====================================================================
-- Ocean CV Dashboard — initial schema (Phase 1)
-- Covers: portfolio module (airdrops, hackathons, projects, CV)
--         + wallet module scaffolding (user_vault, wallets, balances, ops)
-- All tables use Row Level Security. Public readers see only is_public = true.
-- Admin (authenticated + in allowlist) can do everything on their own rows.
-- =====================================================================

-- Required extensions (Supabase has pgcrypto available)
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------
-- Helper: is_admin() — a logged-in Supabase user whose email is whitelisted.
-- Whitelist is stored in a dedicated table so you can change it without
-- redeploying. Seed your own email once via SQL editor after running this.
-- ---------------------------------------------------------------------
create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  added_at timestamptz not null default now()
);

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from admin_users
    where user_id = auth.uid()
  );
$$;

-- =====================================================================
-- PORTFOLIO MODULE
-- =====================================================================

-- airdrops
create table if not exists airdrops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  chain text,
  status text not null default 'farming'
    check (status in ('farming','claimed','dead','scam','waiting')),
  category text, -- 'testnet' | 'mainnet' | 'points' | etc
  started_at date,
  claimed_at date,
  estimated_value numeric(18,2),
  actual_received numeric(18,2),
  wallet_label text,
  notes text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists airdrops_owner_idx on airdrops(owner_id);
create index if not exists airdrops_public_idx on airdrops(is_public) where is_public = true;
create index if not exists airdrops_status_idx on airdrops(status);

-- airdrop_tasks (recurring checklist)
create table if not exists airdrop_tasks (
  id uuid primary key default gen_random_uuid(),
  airdrop_id uuid not null references airdrops(id) on delete cascade,
  title text not null,
  frequency text not null default 'daily'
    check (frequency in ('daily','weekly','once')),
  last_done_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists airdrop_tasks_airdrop_idx on airdrop_tasks(airdrop_id);

-- hackathons
create table if not exists hackathons (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  organizer text,
  start_date date,
  end_date date,
  result text check (result in ('winner','finalist','participant','upcoming')),
  prize_usd numeric(18,2),
  team_members text[] not null default '{}',
  notes text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hackathons_owner_idx on hackathons(owner_id);
create index if not exists hackathons_public_idx on hackathons(is_public) where is_public = true;

-- projects (dapp/demo; may link to a hackathon)
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  hackathon_id uuid references hackathons(id) on delete set null,
  slug text not null,
  title text not null,
  tagline text,
  description text,
  tech_stack text[] not null default '{}',
  chains text[] not null default '{}',
  demo_url text,
  github_url text,
  video_url text,
  cover_image text,
  gallery text[] not null default '{}',
  is_public boolean not null default true,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, slug)
);

create index if not exists projects_owner_idx on projects(owner_id);
create index if not exists projects_public_idx on projects(is_public) where is_public = true;

-- cv_sections
create table if not exists cv_sections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  section_type text not null
    check (section_type in ('intro','experience','education','skill','contact','award')),
  title text not null,
  subtitle text,
  content text,
  start_date date,
  end_date date,
  order_index int not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cv_sections_owner_idx on cv_sections(owner_id);
create index if not exists cv_sections_type_idx on cv_sections(section_type);

-- =====================================================================
-- WALLET MODULE  (scaffolding — encryption columns stay empty until Phase 4)
-- =====================================================================

-- Per-user master password vault params
-- Only ONE row per user. Never store master password itself.
create table if not exists user_vault (
  user_id uuid primary key references auth.users(id) on delete cascade,
  salt bytea not null,               -- 16 bytes, random
  kdf_params jsonb not null,         -- { m: 65536, t: 3, p: 4 } (Argon2id)
  verifier bytea not null,           -- encrypt(known_plaintext, derivedKey)
  verifier_iv bytea not null,
  verifier_auth_tag bytea not null,
  created_at timestamptz not null default now(),
  rotated_at timestamptz
);

-- wallets: both connected (Rabby/MetaMask) and burner (PK encrypted)
create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  label text not null,
  address text not null,
  wallet_type text not null check (wallet_type in ('connected','burner')),
  chain_family text not null check (chain_family in ('evm','solana','cosmos')),

  -- burner only (null for connected). Never store plaintext PK.
  encrypted_pk bytea,
  iv bytea,
  auth_tag bytea,

  group_label text,
  tags text[] not null default '{}',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, address),
  constraint burner_has_cipher check (
    wallet_type <> 'burner' or (encrypted_pk is not null and iv is not null and auth_tag is not null)
  )
);

create index if not exists wallets_owner_idx on wallets(owner_id);
create index if not exists wallets_group_idx on wallets(group_label);
create index if not exists wallets_archived_idx on wallets(is_archived);

-- Token registry per owner (imported tokens)
create table if not exists token_registry (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  chain text not null,
  token_address text,          -- null = native token
  symbol text not null,
  name text,
  decimals int not null default 18,
  logo_url text,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  unique(owner_id, chain, token_address)
);

create index if not exists token_registry_owner_idx on token_registry(owner_id);

-- Cached balances (refreshed on-demand to save RPC calls)
create table if not exists wallet_balances (
  wallet_id uuid not null references wallets(id) on delete cascade,
  chain text not null,
  token_address text not null default '',  -- '' for native so PK works
  symbol text,
  decimals int not null default 18,
  balance numeric(78,0) not null default 0, -- raw on-chain units (uint256-ish)
  usd_value numeric(18,2),
  price_usd numeric(24,10),
  last_updated timestamptz not null default now(),
  primary key (wallet_id, chain, token_address)
);

create index if not exists wallet_balances_wallet_idx on wallet_balances(wallet_id);

-- Daily snapshot of portfolio value per user (for net worth chart)
create table if not exists portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  snapshot_date date not null,
  total_usd numeric(18,2) not null,
  by_chain jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(owner_id, snapshot_date)
);

create index if not exists portfolio_snapshots_owner_idx on portfolio_snapshots(owner_id);

-- Wallet operations log (gas distribute, consolidate, single transfer)
create table if not exists wallet_operations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  operation_type text not null
    check (operation_type in ('gas_distribute','token_consolidate','single_transfer')),
  from_addresses text[] not null default '{}',
  to_addresses text[] not null default '{}',
  chain text,
  status text not null default 'pending'
    check (status in ('pending','signing','broadcasting','confirmed','failed','cancelled')),
  tx_hashes text[] not null default '{}',
  total_value_usd numeric(18,2),
  randomization_config jsonb,
  notes text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wallet_ops_owner_idx on wallet_operations(owner_id);
create index if not exists wallet_ops_status_idx on wallet_operations(status);

-- =====================================================================
-- updated_at triggers
-- =====================================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  for t in
    select unnest(array[
      'airdrops','hackathons','projects','cv_sections',
      'wallets','wallet_operations'
    ])
  loop
    execute format('drop trigger if exists trg_%I_updated on %I;', t, t);
    execute format(
      'create trigger trg_%I_updated before update on %I
       for each row execute function set_updated_at();', t, t);
  end loop;
end $$;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

alter table admin_users        enable row level security;
alter table airdrops           enable row level security;
alter table airdrop_tasks      enable row level security;
alter table hackathons         enable row level security;
alter table projects           enable row level security;
alter table cv_sections        enable row level security;
alter table user_vault         enable row level security;
alter table wallets            enable row level security;
alter table token_registry     enable row level security;
alter table wallet_balances    enable row level security;
alter table portfolio_snapshots enable row level security;
alter table wallet_operations  enable row level security;

-- ---- admin_users ----
-- only an admin can see the allowlist; nothing public.
create policy admin_users_select on admin_users
  for select using (is_admin());

-- ---- airdrops ----
-- public: only is_public rows
create policy airdrops_public_read on airdrops
  for select using (is_public = true);
-- owner full access
create policy airdrops_owner_all on airdrops
  for all using (owner_id = auth.uid() and is_admin())
  with check (owner_id = auth.uid() and is_admin());

-- ---- airdrop_tasks ----
-- tasks inherit from parent; no public read.
create policy airdrop_tasks_owner_all on airdrop_tasks
  for all using (
    exists (select 1 from airdrops a where a.id = airdrop_tasks.airdrop_id
            and a.owner_id = auth.uid())
    and is_admin()
  )
  with check (
    exists (select 1 from airdrops a where a.id = airdrop_tasks.airdrop_id
            and a.owner_id = auth.uid())
    and is_admin()
  );

-- ---- hackathons ----
create policy hackathons_public_read on hackathons
  for select using (is_public = true);
create policy hackathons_owner_all on hackathons
  for all using (owner_id = auth.uid() and is_admin())
  with check (owner_id = auth.uid() and is_admin());

-- ---- projects ----
create policy projects_public_read on projects
  for select using (is_public = true);
create policy projects_owner_all on projects
  for all using (owner_id = auth.uid() and is_admin())
  with check (owner_id = auth.uid() and is_admin());

-- ---- cv_sections ----
create policy cv_sections_public_read on cv_sections
  for select using (is_public = true);
create policy cv_sections_owner_all on cv_sections
  for all using (owner_id = auth.uid() and is_admin())
  with check (owner_id = auth.uid() and is_admin());

-- ---- user_vault (private only) ----
create policy user_vault_owner_select on user_vault
  for select using (user_id = auth.uid() and is_admin());
create policy user_vault_owner_write on user_vault
  for all using (user_id = auth.uid() and is_admin())
  with check (user_id = auth.uid() and is_admin());

-- ---- wallets (private only) ----
create policy wallets_owner_all on wallets
  for all using (owner_id = auth.uid() and is_admin())
  with check (owner_id = auth.uid() and is_admin());

-- ---- token_registry (private only) ----
create policy token_registry_owner_all on token_registry
  for all using (owner_id = auth.uid() and is_admin())
  with check (owner_id = auth.uid() and is_admin());

-- ---- wallet_balances (private only; auth via parent wallet) ----
create policy wallet_balances_owner_all on wallet_balances
  for all using (
    exists (select 1 from wallets w where w.id = wallet_balances.wallet_id
            and w.owner_id = auth.uid())
    and is_admin()
  )
  with check (
    exists (select 1 from wallets w where w.id = wallet_balances.wallet_id
            and w.owner_id = auth.uid())
    and is_admin()
  );

-- ---- portfolio_snapshots (private only) ----
create policy portfolio_snapshots_owner_all on portfolio_snapshots
  for all using (owner_id = auth.uid() and is_admin())
  with check (owner_id = auth.uid() and is_admin());

-- ---- wallet_operations (private only) ----
create policy wallet_operations_owner_all on wallet_operations
  for all using (owner_id = auth.uid() and is_admin())
  with check (owner_id = auth.uid() and is_admin());

-- =====================================================================
-- Post-install seed note
-- =====================================================================
-- After running this migration, insert your own admin row:
--
--   insert into admin_users (user_id, email)
--   values ('<your-auth-user-uuid>', 'you@example.com');
--
-- Find your user_id in auth.users after signing in once via magic link.
-- =====================================================================
