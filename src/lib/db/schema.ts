import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  numeric,
  date,
  timestamp,
  jsonb,
  customType,
  unique,
  index,
  check,
  primaryKey
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  }
});

// =====================================================================
// Admin allowlist
// =====================================================================
export const adminUsers = pgTable("admin_users", {
  userId: uuid("user_id").primaryKey(),
  email: text("email").notNull().unique(),
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull()
});

// =====================================================================
// Portfolio
// =====================================================================
export const airdrops = pgTable(
  "airdrops",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull(),
    name: text("name").notNull(),
    chain: text("chain"),
    status: text("status").notNull().default("farming"),
    category: text("category"),
    startedAt: date("started_at"),
    claimedAt: date("claimed_at"),
    estimatedValue: numeric("estimated_value", { precision: 18, scale: 2 }),
    actualReceived: numeric("actual_received", { precision: 18, scale: 2 }),
    walletLabel: text("wallet_label"),
    notes: text("notes"),
    isPublic: boolean("is_public").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => ({
    ownerIdx: index("airdrops_owner_idx").on(t.ownerId),
    statusIdx: index("airdrops_status_idx").on(t.status),
    statusCheck: check(
      "airdrops_status_check",
      sql`${t.status} in ('farming','claimed','dead','scam','waiting')`
    )
  })
);

export const airdropTasks = pgTable(
  "airdrop_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    airdropId: uuid("airdrop_id")
      .notNull()
      .references(() => airdrops.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    frequency: text("frequency").notNull().default("daily"),
    lastDoneAt: timestamp("last_done_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => ({
    airdropIdx: index("airdrop_tasks_airdrop_idx").on(t.airdropId),
    frequencyCheck: check(
      "airdrop_tasks_frequency_check",
      sql`${t.frequency} in ('daily','weekly','once')`
    )
  })
);

export const hackathons = pgTable(
  "hackathons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull(),
    name: text("name").notNull(),
    organizer: text("organizer"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    result: text("result"),
    prizeUsd: numeric("prize_usd", { precision: 18, scale: 2 }),
    teamMembers: text("team_members")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    notes: text("notes"),
    isPublic: boolean("is_public").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => ({
    ownerIdx: index("hackathons_owner_idx").on(t.ownerId),
    resultCheck: check(
      "hackathons_result_check",
      sql`${t.result} is null or ${t.result} in ('winner','finalist','participant','upcoming')`
    )
  })
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull(),
    hackathonId: uuid("hackathon_id").references(() => hackathons.id, { onDelete: "set null" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    tagline: text("tagline"),
    description: text("description"),
    techStack: text("tech_stack")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    chains: text("chains")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    demoUrl: text("demo_url"),
    githubUrl: text("github_url"),
    videoUrl: text("video_url"),
    coverImage: text("cover_image"),
    gallery: text("gallery")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    isPublic: boolean("is_public").notNull().default(true),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => ({
    ownerIdx: index("projects_owner_idx").on(t.ownerId),
    slugUnique: unique("projects_owner_slug_unique").on(t.ownerId, t.slug)
  })
);

export const cvSections = pgTable(
  "cv_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull(),
    sectionType: text("section_type").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    content: text("content"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    orderIndex: integer("order_index").notNull().default(0),
    isPublic: boolean("is_public").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => ({
    ownerIdx: index("cv_sections_owner_idx").on(t.ownerId),
    typeIdx: index("cv_sections_type_idx").on(t.sectionType),
    typeCheck: check(
      "cv_sections_type_check",
      sql`${t.sectionType} in ('intro','experience','education','skill','contact','award')`
    )
  })
);

// =====================================================================
// Wallet module
// =====================================================================
export const userVault = pgTable("user_vault", {
  userId: uuid("user_id").primaryKey(),
  salt: bytea("salt").notNull(),
  kdfParams: jsonb("kdf_params").notNull(),
  verifier: bytea("verifier").notNull(),
  verifierIv: bytea("verifier_iv").notNull(),
  verifierAuthTag: bytea("verifier_auth_tag").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  rotatedAt: timestamp("rotated_at", { withTimezone: true })
});

export const wallets = pgTable(
  "wallets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull(),
    label: text("label").notNull(),
    address: text("address").notNull(),
    walletType: text("wallet_type").notNull(),
    chainFamily: text("chain_family").notNull(),
    encryptedPk: bytea("encrypted_pk"),
    iv: bytea("iv"),
    authTag: bytea("auth_tag"),
    groupLabel: text("group_label"),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    twitterHandle: text("twitter_handle"),
    discordHandle: text("discord_handle"),
    email: text("email"),
    notes: text("notes"),
    avatarColor: text("avatar_color"),
    isArchived: boolean("is_archived").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => ({
    addressUnique: unique("wallets_owner_address_unique").on(t.ownerId, t.address),
    ownerIdx: index("wallets_owner_idx").on(t.ownerId),
    groupIdx: index("wallets_group_idx").on(t.groupLabel),
    typeCheck: check(
      "wallets_type_check",
      sql`${t.walletType} in ('connected','burner')`
    ),
    familyCheck: check(
      "wallets_family_check",
      sql`${t.chainFamily} in ('evm','solana','cosmos')`
    )
  })
);

export const tokenRegistry = pgTable(
  "token_registry",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull(),
    chain: text("chain").notNull(),
    tokenAddress: text("token_address"),
    symbol: text("symbol").notNull(),
    name: text("name"),
    decimals: integer("decimals").notNull().default(18),
    logoUrl: text("logo_url"),
    isHidden: boolean("is_hidden").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => ({
    ownerIdx: index("token_registry_owner_idx").on(t.ownerId),
    unq: unique("token_registry_owner_chain_addr_unique").on(t.ownerId, t.chain, t.tokenAddress)
  })
);

export const walletBalances = pgTable(
  "wallet_balances",
  {
    walletId: uuid("wallet_id")
      .notNull()
      .references(() => wallets.id, { onDelete: "cascade" }),
    chain: text("chain").notNull(),
    tokenAddress: text("token_address").notNull().default(""),
    symbol: text("symbol"),
    decimals: integer("decimals").notNull().default(18),
    balance: numeric("balance", { precision: 78, scale: 0 }).notNull().default("0"),
    usdValue: numeric("usd_value", { precision: 18, scale: 2 }),
    priceUsd: numeric("price_usd", { precision: 24, scale: 10 }),
    lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => ({
    pk: primaryKey({ columns: [t.walletId, t.chain, t.tokenAddress] }),
    walletIdx: index("wallet_balances_wallet_idx").on(t.walletId)
  })
);

export const portfolioSnapshots = pgTable(
  "portfolio_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull(),
    snapshotDate: date("snapshot_date").notNull(),
    totalUsd: numeric("total_usd", { precision: 18, scale: 2 }).notNull(),
    byChain: jsonb("by_chain").notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => ({
    ownerIdx: index("portfolio_snapshots_owner_idx").on(t.ownerId),
    unq: unique("portfolio_snapshots_owner_date_unique").on(t.ownerId, t.snapshotDate)
  })
);

export const walletOperations = pgTable(
  "wallet_operations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull(),
    operationType: text("operation_type").notNull(),
    fromAddresses: text("from_addresses")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    toAddresses: text("to_addresses")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    chain: text("chain"),
    status: text("status").notNull().default("pending"),
    txHashes: text("tx_hashes")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    totalValueUsd: numeric("total_value_usd", { precision: 18, scale: 2 }),
    randomizationConfig: jsonb("randomization_config"),
    notes: text("notes"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => ({
    ownerIdx: index("wallet_ops_owner_idx").on(t.ownerId),
    statusIdx: index("wallet_ops_status_idx").on(t.status),
    opTypeCheck: check(
      "wallet_ops_type_check",
      sql`${t.operationType} in ('gas_distribute','token_consolidate','single_transfer')`
    ),
    statusCheck: check(
      "wallet_ops_status_check",
      sql`${t.status} in ('pending','signing','broadcasting','confirmed','failed','cancelled')`
    )
  })
);

// =====================================================================
// Type exports for app code
// =====================================================================
export type Airdrop = typeof airdrops.$inferSelect;
export type NewAirdrop = typeof airdrops.$inferInsert;
export type AirdropTask = typeof airdropTasks.$inferSelect;
export type Hackathon = typeof hackathons.$inferSelect;
export type NewHackathon = typeof hackathons.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type CvSection = typeof cvSections.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type WalletBalance = typeof walletBalances.$inferSelect;
export type WalletOperation = typeof walletOperations.$inferSelect;
export type UserVault = typeof userVault.$inferSelect;
