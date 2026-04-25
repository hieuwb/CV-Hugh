# Prompt cho Google Stitch — Ocean CV Dashboard

Hướng dẫn dùng:

1. Vào https://stitch.withgoogle.com/
2. Mỗi mục dưới đây là **một prompt riêng biệt**. Dán cả khối (phần trong hộp) vào Stitch, tạo một design mới.
3. Khi Stitch cho output (React + Tailwind), copy code trả cho tôi, tôi sẽ nối vào Next.js + Supabase.
4. Nếu Stitch đề nghị chỉnh sửa, cứ làm rồi gửi lại bản cuối cùng.

**Thiết kế chung (paste ở đầu MỌI prompt):**

```
Brand: Ocean CV — personal Web3 dashboard.
Style: dark glassmorphism. Deep-ocean palette — primary #031829, surface #073b59,
  accent #72d9ff, ink #e9fbff, muted #a9d8ea, hairline border rgba(255,255,255,0.18).
Background: radial glow từ góc trái trên + gradient dọc từ surface xuống primary.
Typography: Space Grotesk. H1 48px/1.05, H2 22px, body 15px, caption 12-13px
  uppercase letter-spacing 0.2em màu muted.
Card: border 1px hairline, background gradient 135deg rgba(255,255,255,0.14) →
  rgba(255,255,255,0.05), backdrop-filter blur(10px), border-radius 20px.
Chip / badge: pill shape, border hairline, background rgba(255,255,255,0.06), 13px.
Button primary: gradient ngang #72d9ff → #108cc5, chữ #052335, pill, bold.
Button ghost: chip style + padding lớn hơn.
Input: background rgba(255,255,255,0.07), border hairline, border-radius 12,
  padding 10-12px, placeholder muted.
Toàn bộ NGÔN NGỮ TIẾNG VIỆT. Nhãn ngày giờ theo dd/MM/yyyy.
Responsive: 360-1080px, desktop 3 cột, tablet 2 cột, mobile 1 cột.
Output: React + Tailwind, dùng lucide-react icons.
```

---

## Phần A — Bảng điều khiển (plan 1)

### A1. `/admin` — Tổng quan

```
[dán thiết kế chung ở trên]

Tạo trang "Tổng quan" cho admin dashboard:
- Header sticky: logo "Ocean CV" bên trái, nav-chips: Tổng quan / Airdrop /
  Hackathon / Dự án / CV / Ví, nút "Đăng xuất" bên phải.
- Hero card: badge "KHU VỰC RIÊNG TƯ", H1 "Bảng điều khiển cá nhân",
  câu phụ "Tất cả dữ liệu lưu ở Supabase, chỉ mình bạn thấy."
- Grid 4 widget card (2×2 desktop, 1 cột mobile):
  1. "Airdrop đang farm" — số lớn, so sánh ±X so với tuần trước
  2. "Việc cần làm hôm nay" — số + progress bar hoàn thành
  3. "Hackathon sắp diễn ra" — số + countdown gần nhất
  4. "Tổng prize đã thắng" — USD + icon trophy
- Panel "Thêm nhanh": 3 shortcut
     + Thêm airdrop mới (icon Plus)
     + Thêm task hôm nay (icon CheckSquare)
     + Ghi chú hackathon (icon Award)
- Timeline hôm nay: 5-6 dòng sự kiện kiểu "08:30 Swap trên Base để farm Aerodrome"
  với checkbox tròn bên trái, hover hiện icon Pencil và Trash.
- Sidebar phụ (desktop): "Ví nổi bật" — 2-3 row ví kèm chain badge và
  balance USD, nút "Xem tất cả".
```

### A2. `/admin/airdrops` — Danh sách airdrop

```
[dán thiết kế chung]

Trang quản lý airdrop:
- Toolbar: H1 "Airdrop", bên phải nút primary "Thêm airdrop".
- Filter row: select "Chain" (Monad / Base / Solana / Berachain...),
  select "Trạng thái" (Đang farm / Đã claim / Đã chết / Scam / Chờ), ô search,
  toggle "Chỉ hiện public".
- Bảng dữ liệu (TanStack/shadcn Table style) cột:
     Tên dự án (avatar tròn + tên + badge category)
     Chain (chip màu)
     Trạng thái (badge: xanh dương = farming, xanh lá = claimed, đỏ = dead,
       vàng = waiting, tím = scam)
     Ngày bắt đầu
     Est value $ (canh phải)
     Actual $ (canh phải, màu accent nếu > 0)
     Public (icon mắt bật/tắt)
     Hành động (3 dot menu: sửa / xoá / mở chi tiết)
- Empty state: icon Sparkles lớn, "Chưa có airdrop nào. Thêm cái đầu tiên
  để bắt đầu theo dõi ROI." kèm nút primary.
- Modal "Thêm airdrop": form 2 cột
     Tên, Chain (combobox có sẵn tuỳ chọn + tự gõ), Trạng thái (radio chips),
     Category (testnet/mainnet/points), Ngày bắt đầu (date picker),
     Estimated value $, Wallet label, Notes (textarea), Toggle "Công khai".
     Footer: "Huỷ" ghost + "Lưu" primary.
```

### A3. `/admin/airdrops/[id]` — Chi tiết + checklist task

```
[dán thiết kế chung]

Trang chi tiết 1 airdrop:
- Breadcrumb: Airdrop / Tên dự án, nút "Sửa" và "Xoá" bên phải.
- Header card: tên dự án, 3 chip (chain / status / category), Est vs Actual
  progress bar, ngày bắt đầu.
- Grid 2 cột (desktop):
  Cột trái: card "Task lặp" — danh sách task với
     checkbox tròn, tiêu đề, frequency badge (Hằng ngày / Tuần / 1 lần),
     last_done relative "2 giờ trước" màu muted, trong hover hiện sửa/xoá.
     Footer có ô "Thêm task mới" inline.
  Cột phải:
     Card "Ghi chú" markdown-style + nút Lưu
     Card "Ví dùng" - list wallet_label có icon link ra trang ví
     Card "Lịch sử" - timeline thay đổi status
- Sticky bottom bar mobile: nút "+ Task" primary.
```

### A4. `/admin/hackathons` — Timeline hackathon

```
[dán thiết kế chung]

Trang quản lý hackathon:
- H1 "Hackathon" + nút primary "Thêm hackathon".
- View toggle: "Lưới" / "Dòng thời gian" (segmented control).
- Grid lưới: mỗi card hackathon hiển thị
     cover gradient + logo organizer (ETHGlobal / Solana / Encode...)
     Tên, date range, team pill list (avatar chồng), kết quả
     (badge màu: winner=gold, finalist=silver, participant=muted, upcoming=accent)
     Prize lớn $X, link "Mở dự án →" nếu có project kèm theo.
- Dòng thời gian: trục dọc, hackathon xếp theo thời gian, mỗi node là card nhỏ.
- Modal thêm/sửa: Tên, Organizer, Ngày bắt đầu / kết thúc, Team members
  (tag input), Kết quả (radio), Prize USD, Ghi chú.
```

### A5. `/admin/projects` — Dự án (có link hackathon)

```
[dán thiết kế chung]

Trang quản lý dự án:
- H1 "Dự án", nút primary "Thêm dự án".
- View grid card, mỗi card:
     Cover image (tỉ lệ 16:9), tên dự án, tagline 1 dòng,
     chip list tech stack (hiện 4, còn lại "+N"), chain chips,
     Row link: Demo / GitHub / Video với icon, toggle Public,
     Hover hiện nút "Sửa" trên cover.
- Drawer sửa từ phải vào: form đầy đủ
     slug (auto từ tên), title, tagline, description (textarea lớn),
     tech_stack (multi-tag), chains (multi-tag), demo_url, github_url,
     video_url, cover_image (upload + preview), gallery (multi upload),
     hackathon_id (combobox liên kết bảng hackathons), order_index (number),
     Toggle Public.
```

### A6. `/admin/cv` — Trình soạn CV (kéo-thả)

```
[dán thiết kế chung]

Trang soạn CV:
- H1 "Mục trong CV".
- Sidebar trái (200px): filter theo loại section — Giới thiệu / Kinh nghiệm /
  Học vấn / Kỹ năng / Liên hệ / Giải thưởng. Click = filter list bên phải.
- Main: list card kéo-thả theo thứ tự (có grip handle icon 6 dot bên trái),
  mỗi row: type badge, title, subtitle muted, date range,
  hover hiện sửa / xoá / ẩn (eye icon). Public/private toggle đầu mỗi row.
- Nút "+ Thêm mục" floating dưới cùng, mở modal chọn loại trước rồi nhập nội dung.
- Preview pane bên phải (desktop, collapsible): render CV dạng 1 cột trông
  giống PDF export. Có nút "Tải PDF" primary.
```

---

## Phần B — Quản lý ví (plan 2)

### B1. `/admin/wallets` — Danh sách ví

```
[dán thiết kế chung]

Trang chính quản lý ví:
- Toolbar: H1 "Ví của tôi", bên phải:
     Nút ghost "Kết nối ví chính" (icon link)
     Nút primary "Thêm burner" (icon Plus)
     Nút ghost nhỏ "Làm mới số dư" (icon RefreshCw) — spinner khi loading
- Panel tóm tắt trên cùng: "Tổng tài sản" USD lớn, pie chart nhỏ phân bổ
  theo chain (Recharts), "Cập nhật X phút trước".
- Filter: segmented control "Tất cả / Ví chính / Burner", select nhóm
  (dropdown "Monad batch 1", "Berachain wave 2"...), search.
- Bảng ví (hoặc card list):
     Cột: Label (+ icon loại), Địa chỉ rút gọn 0xabc...123 (có nút copy),
     Chain family badge (EVM / Solana / Cosmos),
     Số dư native token + "+N tokens", USD quy đổi,
     Nhóm (chip), Action 3-dot (sửa label / lưu trữ / xoá).
- Khi click row → mở drawer chi tiết (B2).
- Empty state: icon Wallet lớn, "Chưa có ví nào. Kết nối ví chính trước hoặc
  thêm burner đã mã hoá." + 2 nút CTA.
```

### B2. Drawer chi tiết 1 ví

```
[dán thiết kế chung]

Drawer từ phải (width 480 desktop, full mobile):
- Header: label ví + chip loại (Ví chính / Burner), nút sửa label, nút copy
  địa chỉ đầy đủ, link ra explorer (Etherscan / Solscan).
- Tabs: "Tổng quan" / "Token" / "Lịch sử tx".
- Tab Tổng quan:
     Big number: balance USD.
     Pie chart token distribution.
     3 nút lớn: "Gửi" / "Nhận (QR)" / "Gom vào ví chính" (nếu là burner).
- Tab Token:
     List token row: logo + symbol + name, balance (số + quy USD),
     price $, %24h (xanh/đỏ), nút ẩn token (icon EyeOff).
     Nút "Thêm token thủ công" dưới cùng mở modal (paste contract).
- Tab Lịch sử tx:
     Timeline tx gần nhất: hướng in/out với mũi tên, amount + token,
     counterparty address rút gọn, thời gian relative, link explorer.
```

### B3. Modal "Kết nối ví chính"

```
[dán thiết kế chung]

Modal chọn cách kết nối ví (Wagmi / ConnectKit style):
- Tiêu đề "Kết nối ví chính", phụ đề "Ví này chỉ ký giao dịch, KHÔNG lưu
  private key."
- Grid 4 card: Rabby (khuyên dùng) / MetaMask / WalletConnect / Phantom.
  Mỗi card: logo, tên, trạng thái "Đã cài" hoặc "Cài đặt".
- Tab thứ 2: "Solana" — Phantom / Solflare.
- Tab thứ 3: "Cosmos" — Keplr / Leap.
- Footer: link "Học cách chọn ví an toàn →".
```

### B4. Modal "Thêm burner wallet"

```
[dán thiết kế chung]

Modal 2 bước:
Bước 1 — Nhập key:
- Cảnh báo vàng trên cùng: icon triangle, "Chỉ dùng burner. Không nhập
  private key của ví chứa tài sản lớn."
- Input multiline "Private key (hex, 64 ký tự)" — chế độ password, có nút
  Eye bật/tắt hiện.
- Input "Tên gợi nhớ" ví dụ "Monad farm #07".
- Select Chain family: EVM / Solana / Cosmos.
- Select nhóm (combobox cho phép tạo mới) "Monad farm batch 1".
- Tag input "Nhãn" — nhiều chip.
- Nút primary "Tiếp tục".

Bước 2 — Nhập master password để mã hoá:
- Input password với yêu cầu: tối thiểu 12 ký tự, có số, ký tự đặc biệt.
- Thanh strength meter.
- Checkbox "Tôi hiểu nếu quên master password, key này sẽ mất vĩnh viễn."
- Nút primary "Mã hoá & lưu" (disabled khi checkbox chưa tick).
- Loading state: "Đang derive key bằng Argon2id..." + spinner 4-6 giây.
- Success: toast xanh "Đã thêm burner Monad farm #07. Địa chỉ 0xABC...".
```

### B5. Modal "Nhập Master Password" (mỗi session)

```
[dán thiết kế chung]

Modal nhỏ trung tâm:
- Lock icon lớn màu accent.
- H2 "Nhập master password".
- Phụ đề muted "Mật khẩu này chỉ tồn tại trong bộ nhớ trình duyệt, không gửi về server."
- Input password có nút Eye.
- Checkbox "Ghi nhớ trong session này (2 giờ)".
- Footer 2 nút: Huỷ ghost, "Mở khoá" primary.
- State error: "Sai mật khẩu. Còn X lần thử" màu đỏ nhạt.
- Rate-limit state: "Quá nhiều lần thử. Thử lại sau 5 phút." + disabled.
```

### B6. `/admin/wallets/consolidate` — Gom token về ví chính

```
[dán thiết kế chung]

Wizard 4 bước, top có step indicator:
Bước 1 — Chọn đích:
- Radio card chọn ví chính (Rabby đã kết nối) làm destination.
- Cảnh báo "Ví đích phải cùng chain family với nguồn".
Bước 2 — Chọn nguồn:
- List checkbox tất cả burner ví, cho select multi, có nút "Chọn tất cả burner
  trong nhóm X". Cột bên cạnh hiện USD total sẽ gom.
Bước 3 — Chọn token + chain:
- Dropdown Chain (Base / Arb / Monad...).
- Bảng token có trong các ví đã chọn: checkbox, symbol, tổng balance, USD,
  số ví có token đó. Có nút "Chọn tất cả stablecoin".
- Toggle "Bỏ qua dust < $0.50".
- Toggle "Để lại 0.001 native làm gas rút sau".
Bước 4 — Preview & confirm:
- Bảng tóm tắt: từng ví → số sẽ gửi, gas ước tính, tx hash placeholder.
- Tổng USD chuyển, gas USD, thời gian ước tính (có delay random).
- Nút primary to "Ký & gửi" — mở modal Master Password (B5).
- Progress panel runtime: mỗi dòng ví có spinner / tick / x đỏ khi fail,
  link tx hash khi thành công. Nút "Tạm dừng" / "Huỷ các tx còn lại".
```

### B7. `/admin/wallets/gas-distribute` — Rải gas + anti-Sybil

```
[dán thiết kế chung]

Wizard tương tự B6 nhưng ngược:
Bước 1 — Chọn ví nguồn (funding wallet): radio list ví có native balance.
Bước 2 — Chọn ví đích (nhận gas): multi-select burner, có upload CSV tuỳ chọn.
Bước 3 — Cấu hình anti-Sybil:
- Số tiền base (ví dụ 0.005 ETH) + slider jitter % (10-50%).
- Khoảng delay giữa tx: min-max seconds (30-300 gợi ý), toggle "Phân bố log-normal".
- Toggle "Trộn thêm noise tx" (một số ví nhận 2 lần).
- Cảnh báo đỏ: icon AlertTriangle, block cảnh báo CEX-routing:
  "Tính năng này chỉ giảm fingerprint, không thay thế CEX routing nếu farm
   nghiêm túc."
Bước 4 — Preview & schedule:
- Bảng từng ví: amount dự kiến, delay thứ tự, ETA.
- Nút primary "Bắt đầu" (mở master password modal).
- Runtime panel: tx đang ký / đang broadcast / confirmed, có thể pause/resume.
- Banner nhỏ "Đang chạy nền qua QStash - có thể đóng tab".
```

### B8. `/admin/wallets/operations` — Lịch sử thao tác

```
[dán thiết kế chung]

Trang log các thao tác wallet_operations:
- Filter: loại (Rải gas / Gom token / Chuyển 1 ví), trạng thái, chain,
  date range.
- Bảng: Thời gian, Loại op, Chain, Số ví liên quan, Tổng USD,
  Trạng thái (pending / signing / broadcasting / confirmed / failed /
  cancelled — mỗi trạng thái 1 badge màu), Số tx.
- Expand row: hiển thị danh sách tx hash với link explorer, randomization
  config đã dùng, error nếu có.
- Nút "Export CSV" trên cùng.
```

---

## Phần C — Tinh chỉnh sau (optional)

Để dùng khi 2 phần chính đã vào form:

- `/admin/wallets/tokens` — Token registry: list token user đã import thủ công.
- `/admin/wallets/snapshots` — Chart net worth theo ngày (line chart Recharts).
- Component `<MasterPasswordProvider>` UI: banner trên cùng dashboard
  "🔓 Đã mở khoá · hết hạn trong XX:XX", nút "Khoá ngay".

---

## Sau khi có output Stitch

Gửi tôi (paste vào chat) bất cứ thứ nào có trong:

1. Code React component Stitch xuất ra (luôn là JSX + Tailwind).
2. Screenshot thiết kế (nếu Stitch cho preview hình ảnh).
3. Design tokens / CSS custom được generate.

Tôi sẽ:
- Đặt file vào `src/components/admin/` hoặc `src/components/wallets/` đúng chỗ.
- Cài thêm shadcn components cần thiết (Dialog, Table, Drawer, DropdownMenu…).
- Wire logic thật vào Supabase / Drizzle / Wagmi.
- Thêm validation với Zod + react-hook-form.
- Giữ nguyên design Stitch, không tự bịa lại UI.
