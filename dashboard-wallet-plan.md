# PLAN MỞ RỘNG: Wallet Manager Module

> Bổ sung cho dashboard, phần quản lý ví multi-chain với token tracking, transfer ops, và anti-Sybil.
> **Nguyên tắc vàng:** Ví chính (có tài sản) → Rabby/MetaMask ký. Ví farm burner (chỉ có gas) → private key mã hoá server-side với khoá derive từ master password của bạn.

---

## 1. Kiến trúc 2-tier Wallet Security

Đây là phần **quan trọng nhất cả plan**, đọc kỹ trước khi code.

### 1.1. Phân loại ví

| Loại ví | Mục đích | Cách lưu | Cách ký tx |
|---------|----------|----------|------------|
| **Main Wallet** | Giữ tài sản thật (ETH, USDC, NFT giá trị) | Không lưu key. Chỉ connect qua Rabby/MetaMask | Popup Rabby/MetaMask |
| **Farm Wallet (burner)** | Làm airdrop, chỉ có gas + token testnet | Private key mã hoá AES-256-GCM trong Supabase | Backend ký bằng viem/ethers sau khi user nhập master password |
| **Vault Wallet** | Ví trung gian để gom tài sản | Connect Rabby — không lưu key | Popup |

### 1.2. Mã hoá private key đúng cách

**KHÔNG BAO GIỜ** lưu private key plaintext. Dùng **envelope encryption**:

```
User nhập Master Password (chỉ trong session, không lưu DB)
       ↓
  Argon2id KDF (salt lưu DB, pepper lưu env Vercel)
       ↓
   → Derived Key (DK)
       ↓
Private key PK → AES-256-GCM encrypt bằng DK → ciphertext + IV + authTag lưu DB
```

**Lưu trong DB chỉ 3 trường:**
- `encrypted_pk` (ciphertext)
- `iv` (12 bytes random mỗi ví)
- `auth_tag` (16 bytes, verify integrity)
- `salt` (16 bytes, per-user, không phải per-wallet)

**Không bao giờ lưu:**
- ❌ Master password (kể cả hash)
- ❌ Derived key
- ❌ Private key plaintext

**Flow sử dụng:**
1. User login vào admin dashboard (Supabase magic link)
2. Sau đó nhập **Master Password** vào 1 modal — password này chỉ tồn tại trong React state (memory), tự xoá khi close tab
3. Mỗi lần cần ký tx, frontend gửi master password qua HTTPS tới Next.js API route
4. API route derive key → decrypt PK → ký tx → trả signed tx → **không bao giờ trả PK về client**
5. Sau khi có signed tx, broadcast lên chain

**Pepper (server secret):** thêm 1 biến env `ENCRYPTION_PEPPER` (32 bytes random) trên Vercel, concat vào password trước khi Argon2. Như vậy kể cả DB bị leak, attacker không decrypt được nếu không có pepper.

### 1.3. Thay đổi schema Supabase

```sql
-- Bảng user config (1 row cho chính bạn)
create table user_vault (
  user_id uuid primary key references auth.users(id),
  salt bytea not null,         -- 16 bytes, dùng cho Argon2
  kdf_params jsonb not null,   -- { m: 65536, t: 3, p: 4 } cho Argon2id
  verifier bytea not null      -- encrypt 1 chuỗi known để verify đúng password
);

-- Mở rộng wallets table
create table wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  label text not null,                    -- "Main Rabby", "Farm #01", "Vault"
  address text not null,                  -- public address (EVM 0x... hoặc base58 Solana)
  wallet_type text not null check (wallet_type in ('connected','burner')),
  chain_family text not null check (chain_family in ('evm','solana','cosmos')),
  
  -- CHỈ cho burner:
  encrypted_pk bytea,
  iv bytea,
  auth_tag bytea,
  
  -- Metadata
  group_label text,                       -- "Monad farm batch 1", "Berachain wave 2"
  is_archived boolean default false,
  created_at timestamptz default now(),
  unique(user_id, address)
);

-- Cache token balance (giảm API call)
create table wallet_balances (
  wallet_id uuid references wallets(id) on delete cascade,
  chain text not null,
  token_address text,                     -- null = native token
  symbol text,
  decimals int,
  balance numeric,                        -- raw balance / 10^decimals
  usd_value numeric,
  last_updated timestamptz default now(),
  primary key (wallet_id, chain, token_address)
);

-- Transaction log (audit mọi lệnh gom/gửi gas)
create table wallet_operations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  operation_type text check (operation_type in ('gas_distribute','token_consolidate','single_transfer')),
  from_addresses text[],
  to_addresses text[],
  chain text,
  status text default 'pending',          -- pending/signing/broadcasting/confirmed/failed
  tx_hashes text[],
  total_value_usd numeric,
  randomization_config jsonb,             -- lưu config anti-Sybil đã dùng
  created_at timestamptz default now()
);
```

---

## 2. Module Import Token & Token Discovery

### 2.1. Import token thủ công
Form: chọn chain → paste contract address → auto-fetch metadata (symbol, decimals, logo) từ CoinGecko contract endpoint → lưu vào `token_registry` của user.

### 2.2. Auto-discovery token mỗi ví

Mỗi chain có API/indexer khác nhau. Free tier tốt nhất:

| Chain | API | Free tier | Method |
|-------|-----|-----------|--------|
| **EVM mainnet (ETH, Base, Arb, Op, Polygon, BSC)** | Alchemy `getTokenBalances` | 30M CU/tháng | 1 call trả về toàn bộ ERC20 |
| **Linea, Scroll, Mantle, zkSync** | Alchemy (đã support) | cùng quota | |
| **Monad, Berachain, Sei** | RPC native + multicall scan | Free | Scan top 100 token contracts của chain |
| **Solana** | Helius RPC free (1M req/tháng) | Tốt nhất | `getTokenAccountsByOwner` |
| **Cosmos (Injective, dYdX, Celestia)** | LCD endpoint chain | Free public | `/cosmos/bank/v1beta1/balances/{addr}` |

**Chiến lược tối ưu call:**
1. Cache balance trong bảng `wallet_balances` với TTL 5 phút
2. User bấm "Refresh" mới gọi lại, không auto-poll
3. Batch call nhiều ví cùng chain thành 1 request (Alchemy hỗ trợ `alchemy_getTokenBalances` multicall)

### 2.3. Top token & Gas token per chain

Hard-code bảng `chain_config`:

```typescript
// lib/chains.ts
export const CHAINS = {
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    rpc: process.env.ALCHEMY_ETH_RPC,
    nativeSymbol: 'ETH',
    topTokens: ['USDC','USDT','DAI','WETH','WBTC','LINK'],
    explorer: 'https://etherscan.io'
  },
  base: { chainId: 8453, nativeSymbol: 'ETH', topTokens: ['USDC','DAI','cbETH'], ... },
  monad: { chainId: 10143, nativeSymbol: 'MON', topTokens: ['USDC','WMON'], ... },
  berachain: { chainId: 80094, nativeSymbol: 'BERA', topTokens: ['HONEY','WBERA'], ... },
  // ...
}
```

UI hiển thị cho mỗi ví:
- **Native balance** (gas token) - luôn hiển thị đầu tiên, màu nổi bật
- **Top stablecoin/bluechip** của chain đó
- **Other tokens** expand khi cần

---

## 3. Module Price Check

### 3.1. Nguồn giá (free-first)

| Provider | Free tier | Dùng cho |
|----------|-----------|----------|
| **CoinGecko Demo** | 10K call/tháng, 30 req/phút | Giá coin mainstream (/simple/price) |
| **DeFiLlama Price API** | **Không giới hạn, không cần key** | Giá mọi token bằng `chain:address`, cực tốt cho token lạ |
| **GeckoTerminal API** | Free, rate limit mềm | Giá token DEX-native, pool data |

**Recommend:** dùng **DeFiLlama làm chính**, CoinGecko backup.

```typescript
// Example call DeFiLlama
GET https://coins.llama.fi/prices/current/ethereum:0xA0b8...,base:0x833589...
// Trả về { coins: { "ethereum:0xA0b8...": { price: 0.9998, symbol: "USDC" }, ... }}
```

### 3.2. Display
- Mỗi row token: balance × price = USD value
- Tổng USD toàn bộ ví ở top dashboard
- Chart phân bổ tài sản theo chain (Recharts Pie)
- Ghi lại snapshot hằng ngày → vẽ chart "Net worth theo thời gian"

---

## 4. Module Connect Wallet (Rabby + MetaMask)

### 4.1. Stack
Dùng **Wagmi v2 + RainbowKit** hoặc **ConnectKit**. Rabby inject như MetaMask nên xài `injected` connector là bắt được cả hai.

```bash
npm i wagmi viem @tanstack/react-query connectkit
```

```tsx
// app/providers.tsx
const config = createConfig({
  chains: [mainnet, base, arbitrum, optimism, polygon, bsc, /* monad, berachain testnet... */],
  connectors: [
    injected(),           // Rabby, MetaMask, Brave, Phantom EVM...
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID }),
    coinbaseWallet({ appName: 'My Dashboard' })
  ],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_ETH),
    // ...
  }
})
```

### 4.2. Solana
Tách provider riêng: `@solana/wallet-adapter-react` + Phantom/Solflare. Không gộp chung với wagmi được.

### 4.3. UX khi connect
- Chỉ dùng connected wallet cho các thao tác "ký" từ ví chính (gom về, approve, sign message xác thực)
- KHÔNG import ví chính qua private key — connect là đủ
- Khi connect, lưu địa chỉ vào bảng `wallets` với `wallet_type='connected'`, không có encrypted_pk

---

## 5. Module Gom Token về 1 ví (Token Consolidator)

### 5.1. Flow
1. User chọn **destination wallet** (thường là ví chính đã connect Rabby)
2. User chọn **source wallets** (nhiều ví, thường là burner)
3. User chọn **chain** và **tokens** muốn gom
4. System preview: mỗi ví sẽ gửi bao nhiêu, gas ước tính, USD value
5. User nhập **Master Password** → API route decrypt key từng burner → build tx → ký → broadcast
6. Log vào `wallet_operations`

### 5.2. Logic code (pseudo)

```typescript
async function consolidate({ sources, destination, chain, tokens, masterPassword }) {
  const derivedKey = await deriveKey(masterPassword, user.salt, ENV.PEPPER)
  
  for (const src of sources) {
    const pk = decrypt(src.encrypted_pk, src.iv, src.auth_tag, derivedKey)
    const account = privateKeyToAccount(pk)
    const client = createWalletClient({ account, chain, transport: http(RPC) })
    
    for (const token of tokens) {
      const balance = await getBalance(src.address, token, chain)
      if (balance === 0n) continue
      
      // Để lại 0.001 native để sau còn rút được
      const amount = token.isNative ? balance - reserveGas : balance
      
      const hash = await client.sendTransaction({
        to: token.isNative ? destination : token.address,
        value: token.isNative ? amount : 0n,
        data: token.isNative ? undefined : encodeTransfer(destination, amount)
      })
      
      await applyRandomDelay(1000, 5000)   // anti-Sybil delay
      logOperation(hash)
      
      // Zero hoá biến nhạy cảm
      pk.fill?.(0)
    }
  }
  
  derivedKey.fill(0)
}
```

### 5.3. Edge cases phải handle
- **Gas insufficient:** burner không đủ native gas → skip và warning, gợi ý "chạy Gas Distribute trước"
- **Token bị freeze/blacklist:** catch revert, log và continue
- **Dust amount:** skip token < $0.50 USD (configurable)
- **Nonce conflict:** nếu ký nhiều tx cho 1 ví, auto-increment nonce thủ công

---

## 6. Module Gửi Gas hàng loạt + Anti-Sybil

Đây là phần dễ **burn farm** nếu làm sai. Logic anti-Sybil ở đây **chỉ giảm risk, không loại trừ hoàn toàn** — vì nếu cùng IP, cùng device fingerprint, cùng thời điểm mua gas từ CEX, thì project vẫn detect được.

### 6.1. Các chiêu anti-Sybil chuẩn

**Amount randomization:**
```typescript
const base = 0.005 // ETH
const jitter = 0.3 // 30%
const amount = base * (1 + (Math.random() - 0.5) * jitter * 2)
// → khoảng [0.00425, 0.00575]
```

**Time randomization:**
```typescript
// Delay giữa các tx, phân bố log-normal thay vì uniform
const delay = Math.floor(
  Math.exp(Math.log(30) + Math.random() * Math.log(10))
) * 1000  // 30s ~ 300s, log-normal
```

**Order randomization:**
```typescript
const shuffled = [...wallets].sort(() => Math.random() - 0.5)
```

**Gas price jitter:** không dùng cùng 1 gas price cho mọi tx, vary ±10%.

**Không đồng loạt:** KHÔNG Promise.all — sequential với delay.

### 6.2. UI config

Cho user chỉnh:
- Base amount + jitter %
- Delay range (min/max)
- Mix với "noise tx" (1 vài ví nhận 2 lần thay vì 1 lần, amount khác nhau)
- Pause/Resume nếu chạy dài

### 6.3. Warning phải show to

> ⚠️ **Reminder:** Nếu bạn đang farm 1 project nghiêm túc, gửi gas trực tiếp từ 1 funding wallet tới nhiều burner vẫn là **on-chain traceable** dù có random. Để hoàn toàn tách, nên route qua CEX (rút từ Binance/OKX tới từng burner). Tính năng này chỉ giảm fingerprint cơ bản, không thay thế CEX routing.

### 6.4. Worker chạy background

Vì delay có thể vài tiếng, không thể giữ 1 HTTP request sống. Giải pháp free-tier:
- **Vercel Cron + Upstash QStash** (free): enqueue từng tx riêng lẻ với `delay` param, QStash gọi lại endpoint khi tới giờ
- Hoặc đơn giản hơn: mở tab dashboard, chạy worker ngay trong browser (ký server-side nhưng schedule client-side). Đóng tab = pause.

---

## 7. Rủi ro và Khuyến nghị cuối

**Bạn PHẢI làm:**
- ✅ Bật 2FA Supabase account
- ✅ Whitelist email login Supabase
- ✅ Vercel project set **password protection** cho preview deployments
- ✅ Master password **khác hoàn toàn** mọi password khác, không lưu password manager cloud (dùng local KeePass)
- ✅ Backup seed phrase burner **offline** — file encrypted trên DB không phải là backup đáng tin
- ✅ Giới hạn tài sản trên burner — không bao giờ giữ > $50 trên 1 ví farm

**Bạn KHÔNG BAO GIỜ được:**
- ❌ Import private key của ví chính vào hệ thống
- ❌ Commit `.env` lên Git (dùng Vercel env vars)
- ❌ Log private key ra console/Sentry/bất kỳ đâu
- ❌ Dùng free public RPC cho tx broadcast (MEV risk) — dùng Alchemy private RPC

---

## 8. Roadmap cập nhật

### Tuần 1-2: (giữ nguyên plan cũ)
Setup Next.js + Supabase + admin login

### Tuần 3: Wallet module cơ bản
- [ ] Schema wallets, user_vault, wallet_balances, wallet_operations
- [ ] Argon2 + AES-GCM utility (dùng `@noble/hashes` và Node `crypto`)
- [ ] Setup Wagmi + ConnectKit, connect Rabby/MetaMask
- [ ] Trang `/admin/wallets` list + add burner (nhập PK → mã hoá lưu)
- [ ] Master password modal flow

### Tuần 4: Balance & Price
- [ ] Integrate Alchemy getTokenBalances cho tất cả chain EVM chính
- [ ] Helius cho Solana, LCD cho Cosmos
- [ ] DeFiLlama price batch
- [ ] Cache layer trong Supabase với TTL

### Tuần 5: Operations
- [ ] Token consolidator với ký popup (destination = connected wallet)
- [ ] Burner-side signing cho gom từ farm wallets
- [ ] Gas distributor với randomization config UI
- [ ] Operation log page với replay/cancel

### Tuần 6: Polish
- [ ] Portfolio chart history (daily snapshot via cron)
- [ ] Auto-discover new tokens via Alchemy Notify webhook (free tier)
- [ ] Export CSV transactions cho báo cáo thuế / tracking

---

## 9. Tổng kết stack mới thêm

| Package | Purpose |
|---------|---------|
| `wagmi` + `viem` | EVM connection + tx signing |
| `connectkit` | Wallet connect UI |
| `@solana/web3.js` + `@solana/wallet-adapter-react` | Solana |
| `@cosmjs/stargate` | Cosmos chains |
| `@noble/hashes` + `@noble/ciphers` | Crypto primitives (audit OK) |
| `argon2-browser` hoặc Node native | KDF |
| **Alchemy API** | RPC + token balance đa chain (free 30M CU) |
| **Helius API** | Solana RPC (free 1M req) |
| **DeFiLlama Price API** | Giá token free unlimited |
| **Upstash QStash** | Delayed job queue (free 500/ngày) |

**Chi phí: vẫn $0/tháng** với quota free tier đủ cho cá nhân farm < 50 ví.
