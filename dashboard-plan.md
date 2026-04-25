# PLAN: Personal Dashboard - Airdrops / Hackathons / CV

> **Stack:** Next.js 14 (App Router) + Vercel + Supabase — **chi phí 0đ/tháng**
> **Mục tiêu:** Vừa là công cụ quản lý cá nhân (private) vừa là portfolio show off (public)
> **Timeline đề xuất:** 3–4 tuần nếu làm buổi tối sau giờ học/làm

---

## 1. Kiến trúc tổng thể

Dashboard chia làm **2 tầng** trên cùng một codebase:

| Tầng | Route | Ai xem được | Mục đích |
|------|-------|-------------|----------|
| **Public** | `/`, `/portfolio`, `/projects`, `/cv` | Mọi người | Show off, nhà tuyển dụng / founder dự án xem |
| **Private** | `/admin/*` | Chỉ bạn (login) | CRUD airdrops, hackathon, task, ghi chú |

Key insight: dữ liệu lưu 1 chỗ (Supabase), cùng 1 bản ghi có flag `is_public` → bạn toggle "khoe" hay "giấu" mà không cần copy-paste.

---

## 2. Tính năng theo từng module

### 2.1. Module Airdrops (private + optional public stats)
- Danh sách airdrop đang farm: tên project, chain, ví dùng, ngày bắt đầu, status (farming / claimed / dead / scam)
- Checklist task hằng ngày / hằng tuần (swap, bridge, vote, stake...)
- Trường `estimated_value` + `actual_received` để sau đánh giá ROI thời gian
- Tag theo chain (Solana, Monad, Berachain, Base...) và theo loại (testnet, mainnet, points program)
- **Public view (tuỳ chọn):** "Tôi đã farm X projects, claim được $Y tổng" — không lộ ví

### 2.2. Module Hackathons / Dapp
- Hackathon: tên, tổ chức (ETHGlobal, Solana, Encode...), thời gian, team, tech stack, link submission, kết quả (winner / finalist / participant), prize
- Mỗi hackathon link tới 1 "Project" card có: demo link, GitHub, video, screenshots
- Grid public `/projects` kéo từ bảng này với filter theo chain / category
- Đây sẽ là phần **ấn tượng nhất với nhà tuyển dụng Web3**

### 2.3. Module CV / About
- `/cv` dạng 1 trang: intro, skills, experience, hackathon wins, contact
- Có nút "Download PDF" — render CV từ cùng data bằng `@react-pdf/renderer`
- `og:image` tự generate từ `next/og` để khi share Twitter/LinkedIn trông pro

### 2.4. Dashboard trang chủ admin
- Widget: số airdrop đang active, task hôm nay, hackathon sắp tới (countdown), tổng prize đã thắng
- Nhập liệu nhanh (quick add) cho airdrop task

---

## 3. Tech stack chi tiết (free tier hết)

| Layer | Service | Free tier limit | Ghi chú |
|-------|---------|-----------------|---------|
| Framework | Next.js 14 App Router | — | React Server Components để SEO tốt phần public |
| Hosting | Vercel Hobby | 100GB bandwidth/tháng | Auto deploy từ GitHub |
| Database | Supabase Free | 500MB DB, 50K MAU auth | Postgres + Auth + RLS |
| Styling | Tailwind CSS + shadcn/ui | — | Copy component, không phải npm bloat |
| ORM | Drizzle hoặc Supabase client | — | Drizzle gọn hơn, type-safe |
| Auth | Supabase Auth (magic link) | — | Chỉ mình bạn login → whitelist email |
| Analytics | Vercel Analytics (free tier) hoặc Umami self-host | 2.5K events/tháng | Xem ai vào portfolio |
| Icons | Lucide React | — | |
| Charts | Recharts | — | Cho thống kê airdrop |

**Tổng: $0/tháng** (trừ domain).

---

## 4. Schema database gợi ý (Supabase / Postgres)

```sql
-- airdrops
create table airdrops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  chain text,
  status text check (status in ('farming','claimed','dead','scam','waiting')),
  started_at date,
  claimed_at date,
  estimated_value numeric,
  actual_received numeric,
  wallet_label text,  -- đừng lưu private key!
  notes text,
  is_public boolean default false,
  created_at timestamptz default now()
);

-- airdrop_tasks (checklist định kỳ)
create table airdrop_tasks (
  id uuid primary key default gen_random_uuid(),
  airdrop_id uuid references airdrops(id) on delete cascade,
  title text,
  frequency text, -- 'daily' | 'weekly' | 'once'
  last_done_at timestamptz
);

-- hackathons
create table hackathons (
  id uuid primary key default gen_random_uuid(),
  name text,
  organizer text,
  start_date date,
  end_date date,
  result text, -- 'winner','finalist','participant'
  prize_usd numeric,
  team_members text[],
  is_public boolean default true
);

-- projects (dapp/demo, link tới hackathon hoặc standalone)
create table projects (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid references hackathons(id),
  title text,
  tagline text,
  description text,
  tech_stack text[],
  demo_url text,
  github_url text,
  video_url text,
  cover_image text,
  is_public boolean default true
);

-- cv_sections (để CV có thể CRUD từ admin)
create table cv_sections (
  id uuid primary key default gen_random_uuid(),
  section_type text, -- 'experience','education','skill','contact'
  title text,
  subtitle text,
  content text,
  start_date date,
  end_date date,
  order_index int
);
```

Bật **Row Level Security** cho tất cả bảng: public route chỉ `select` được khi `is_public = true`; admin route authenticate rồi làm gì cũng được.

---

## 5. Cấu trúc thư mục Next.js

```
app/
  (public)/
    page.tsx              ← landing / hero
    projects/page.tsx
    projects/[slug]/page.tsx
    cv/page.tsx
    cv/download/route.ts  ← PDF endpoint
  (admin)/
    admin/
      layout.tsx          ← kiểm tra auth
      page.tsx            ← dashboard tổng
      airdrops/page.tsx
      airdrops/[id]/page.tsx
      hackathons/page.tsx
      cv/page.tsx         ← edit CV sections
  api/
    og/route.tsx          ← generate OG image
  login/page.tsx
lib/
  supabase/
    client.ts
    server.ts
  db/schema.ts            ← nếu dùng Drizzle
components/
  ui/                     ← shadcn
  dashboard/
  portfolio/
```

---

## 6. Roadmap triển khai (4 tuần)

### Tuần 1 — Setup & Foundation
- [ ] Tạo repo GitHub, init Next.js 14 `npx create-next-app@latest`
- [ ] Setup Tailwind + shadcn/ui, chọn theme (dark mode là mặc định cho vibe Web3)
- [ ] Tạo project Supabase, chạy schema SQL ở trên, bật RLS
- [ ] Setup Supabase Auth magic link, whitelist email của bạn
- [ ] Deploy lên Vercel, connect Supabase env vars
- [ ] **Mốc:** truy cập được `/admin` sau khi login, public thấy landing trống

### Tuần 2 — Admin CRUD
- [ ] Trang admin airdrops: list + form add/edit + delete confirm
- [ ] Trang admin hackathons + projects (projects nested)
- [ ] Trang admin CV sections (drag-and-drop sắp xếp — dùng `@dnd-kit/core`)
- [ ] Dashboard tổng với widget thống kê

### Tuần 3 — Public & CV
- [ ] Landing page: hero + highlight 3 project đỉnh + stats airdrop
- [ ] `/projects` grid với filter theo chain/tech
- [ ] `/projects/[slug]` detail page có gallery, tech pill, link demo
- [ ] `/cv` render đẹp + nút download PDF (react-pdf)
- [ ] OG image dynamic cho mỗi project

### Tuần 4 — Polish & Domain
- [ ] SEO: metadata, sitemap.xml, robots.txt
- [ ] Vercel Analytics
- [ ] Trỏ tên miền (xem phần 7)
- [ ] Responsive check mobile
- [ ] README repo (để GitHub cũng là portfolio)

---

## 7. Trỏ tên miền về Vercel

### 7.1. Mua domain ở đâu (rẻ nhất)
- **Cloudflare Registrar** — giá đúng giá gốc, không markup. `.com` ~$10/năm, `.dev` ~$12/năm, `.xyz` ~$1 năm đầu
- **Namecheap / Porkbun** — tương tự, hay có coupon
- ⚠️ Tránh GoDaddy (giá gia hạn cao), tránh các registrar VN nếu không cần xuất hoá đơn

**Gợi ý TLD cho cá nhân Web3:** `.dev`, `.xyz`, `.build`, `.eth.limo` (nếu muốn ENS)

### 7.2. Cách trỏ về Vercel (3 bước)

**Bước 1 — Add domain trên Vercel:**
Project Settings → Domains → nhập `yourname.com` → Add

**Bước 2 — Vercel sẽ hiện 2 option, chọn 1:**

*Option A — Apex domain (yourname.com):*
Ở DNS registrar, thêm record:
```
Type: A    Name: @    Value: 76.76.21.21
```

*Option B — Subdomain (www.yourname.com hoặc dash.yourname.com):*
```
Type: CNAME    Name: www    Value: cname.vercel-dns.com
```

Khuyến nghị: add **cả apex lẫn www**, rồi vào Vercel set `www` redirect về apex (hoặc ngược lại) cho gọn.

**Bước 3 — Verify & SSL:**
Vercel tự verify trong ~5 phút và cấp SSL (Let's Encrypt) miễn phí. Nếu dùng Cloudflare DNS, nhớ set proxy status thành **"DNS only" (mây xám)** khi mới add, sau khi SSL ok thì bật lại proxy cam cũng được.

### 7.3. Email trên domain (tuỳ chọn, free)
- **Cloudflare Email Routing** — forward `hello@yourname.com` về Gmail cá nhân, miễn phí, không giới hạn địa chỉ
- Thêm MX record Cloudflare tự cấu hình

---

## 8. Security & best practice

- **Đừng bao giờ lưu private key / seed phrase** của ví vào DB, kể cả khi encrypted. Chỉ lưu `wallet_label` như "Wallet airdrop #1" hoặc địa chỉ public
- Env vars trên Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` là public OK, nhưng `SUPABASE_SERVICE_ROLE_KEY` tuyệt đối không `NEXT_PUBLIC_`
- RLS policy: test kỹ bằng cách logout rồi thử query public bảng airdrops → chỉ thấy row `is_public=true`
- Nếu show số tiền airdrop, cân nhắc chỉ show tổng chứ không show per-project (tránh bị target)

---

## 9. Chi tiết sẽ cần AI/Claude hỗ trợ

Khi bắt tay code, các chỗ nên nhờ Claude/Cursor:
1. Viết schema Drizzle + migration từ SQL ở trên
2. Generate shadcn table component với sort/filter cho trang airdrops
3. Viết `@react-pdf/renderer` template cho CV
4. Viết `app/api/og/route.tsx` — OG image dynamic
5. Viết RLS policy Supabase đầy đủ

---

## 10. Checklist trước khi "ra mắt"

- [ ] Lighthouse score > 90 cả 4 category
- [ ] Mobile responsive từ 360px trở lên
- [ ] Có favicon + og:image cho mọi page quan trọng
- [ ] GitHub repo public với README đẹp (pin lên profile)
- [ ] Link portfolio đã add vào: Twitter bio, LinkedIn, Telegram, Farcaster
- [ ] Test từ incognito xem private route có bị lộ không

---

**Next step gợi ý:** bắt đầu từ tuần 1, khi xong Supabase schema + login admin thì ping lại mình, mình sẽ giúp code phần CRUD airdrops trước.
