-- =====================================================================
-- 0002 — Mở rộng bảng wallets cho airdrop-farming workflow:
--        social accounts gắn với mỗi ví (Twitter/Discord/Email),
--        ghi chú tự do, màu avatar (để UI hiển thị chữ cái đầu).
-- =====================================================================

alter table wallets
  add column if not exists twitter_handle text,        -- "@airdrop_dung01"
  add column if not exists discord_handle text,        -- "farm01#5678"
  add column if not exists email text,                 -- "farm01@mail.com"
  add column if not exists notes text,                 -- "Farm airdrop Monad wave 2"
  add column if not exists avatar_color text;          -- "#5B5EF4" — cho chip chữ cái đầu

-- Không unique / không constraint: các trường này chỉ là metadata.
-- Không đánh index vì volume nhỏ (< vài trăm ví / user).
