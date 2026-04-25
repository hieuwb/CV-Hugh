import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Trash2 } from "lucide-react";

import { CopyButton } from "./copy-button";
import { SocialBadge } from "./social-badge";
import { chainMeta } from "@/lib/chain-meta";
import { cn } from "@/lib/utils";
import type { MockWallet } from "@/lib/mock/dashboard";

type Props = {
  items: MockWallet[];
  total: number;
  page?: number;
  pageCount?: number;
  perPage?: number;
};

// Bảng quản lý ví — 10 cột theo mock-up MyHub.
// Phase 1 là static; Phase 2 sẽ chuyển thành client component có sort/filter.
export function WalletTable({
  items,
  total,
  page = 1,
  pageCount = 4,
  perPage = 10
}: Props) {
  const rangeFrom = (page - 1) * perPage + 1;
  const rangeTo = Math.min(page * perPage, total);

  return (
    <section className="rounded-xl border border-line bg-bg-surface shadow-card">
      <header className="flex items-center justify-between px-5 py-4 border-b border-line">
        <h2 className="m-0 text-base font-semibold text-fg">Quản lý ví</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand text-white text-sm font-medium px-3.5 py-2 hover:bg-brand-hover transition-colors"
        >
          <Plus size={16} />
          Thêm ví mới
        </button>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-fg-muted bg-bg-muted/60 border-b border-line">
              <Th className="pl-5 w-[50px]">#</Th>
              <Th>Tên ví</Th>
              <Th>Địa chỉ</Th>
              <Th>Blockchain</Th>
              <Th className="text-right">Số dư (USD)</Th>
              <Th>Twitter</Th>
              <Th>Discord</Th>
              <Th>Email</Th>
              <Th>Ghi chú</Th>
              <Th className="pr-5">Thao tác</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((w) => (
              <Row key={w.id} wallet={w} />
            ))}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center gap-4 justify-between px-5 py-3 border-t border-line text-sm text-fg-muted">
        <span>
          Hiển thị <span className="text-fg font-medium">{rangeFrom} - {rangeTo}</span> của{" "}
          <span className="text-fg font-medium">{total}</span> ví
        </span>
        <Pagination page={page} pageCount={pageCount} />
        <PerPageSelect value={perPage} />
      </footer>
    </section>
  );
}

function Th({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className={`py-3 px-3 font-medium uppercase tracking-wide text-[11px] ${className}`}
    >
      {children}
    </th>
  );
}

function Row({ wallet: w }: { wallet: MockWallet }) {
  const addr = shortenAddress(w.address);
  return (
    <tr className="border-b border-line last:border-b-0 hover:bg-bg-muted/40 transition-colors">
      <td className="pl-5 py-4 text-fg-muted tabular-nums">{w.index}</td>
      <td className="py-4 px-3">
        <div className="flex items-center gap-2.5">
          <span
            className="grid place-items-center w-8 h-8 rounded-full text-white font-semibold text-xs"
            style={{ backgroundColor: w.avatarColor }}
          >
            {w.initial}
          </span>
          <span className="font-medium text-fg">{w.name}</span>
        </div>
      </td>
      <td className="py-4 px-3">
        <div className="flex items-center gap-1.5 text-fg-muted font-mono text-xs">
          <span>{addr}</span>
          <CopyButton value={w.address} />
        </div>
      </td>
      <td className="py-4 px-3">
        <div className="flex items-center gap-2">
          <MiniChainLogo chain={w.chain} />
          <span className="text-fg">{chainMeta(w.chain).label}</span>
        </div>
      </td>
      <td className="py-4 px-3 text-right font-semibold text-emerald-600 tabular-nums">
        {formatUsd(w.balanceUsd)}
      </td>
      <td className="py-4 px-3">
        {w.twitter ? <SocialBadge kind="twitter" handle={w.twitter} /> : "—"}
      </td>
      <td className="py-4 px-3">
        {w.discord ? <SocialBadge kind="discord" handle={w.discord} /> : "—"}
      </td>
      <td className="py-4 px-3">
        {w.email ? <SocialBadge kind="email" handle={w.email} /> : "—"}
      </td>
      <td className="py-4 px-3 text-fg-muted max-w-[180px] truncate" title={w.notes ?? ""}>
        {w.notes ?? "—"}
      </td>
      <td className="pr-5 py-4 px-3">
        <div className="flex items-center gap-1">
          <IconBtn aria-label="Xem chi tiết"><Eye size={16} /></IconBtn>
          <IconBtn aria-label="Sửa"><Pencil size={16} /></IconBtn>
          <IconBtn aria-label="Xoá" danger><Trash2 size={16} /></IconBtn>
        </div>
      </td>
    </tr>
  );
}

function IconBtn({
  children,
  danger = false,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      type="button"
      {...rest}
      className={`grid place-items-center w-8 h-8 rounded-md transition-colors ${
        danger
          ? "text-rose-400 hover:text-white hover:bg-rose-500"
          : "text-fg-soft hover:text-fg hover:bg-bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function Pagination({ page, pageCount }: { page: number; pageCount: number }) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <nav className="flex items-center gap-1" aria-label="Phân trang">
      <PagerBtn aria-label="Trang trước">
        <ChevronLeft size={14} />
      </PagerBtn>
      {pages.map((p) => {
        const active = p === page;
        return (
          <button
            key={p}
            type="button"
            aria-current={active ? "page" : undefined}
            className={`min-w-[32px] h-8 rounded-md text-sm font-medium transition-colors ${
              active
                ? "bg-brand text-white"
                : "text-fg-muted hover:text-fg hover:bg-bg-muted"
            }`}
          >
            {p}
          </button>
        );
      })}
      <PagerBtn aria-label="Trang kế">
        <ChevronRight size={14} />
      </PagerBtn>
    </nav>
  );
}

function PagerBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className="grid place-items-center w-8 h-8 rounded-md text-fg-muted hover:text-fg hover:bg-bg-muted transition-colors"
    >
      {children}
    </button>
  );
}

function PerPageSelect({ value }: { value: number }) {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">Số dòng mỗi trang</span>
      <div className="inline-flex items-center gap-1 rounded-md border border-line bg-bg-surface px-2.5 py-1.5 text-sm text-fg">
        <span>{value} / trang</span>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    </label>
  );
}

// Logo chain nhỏ 22×22 cho cột Blockchain — glyph ký tự trên nền màu nhạt.
function MiniChainLogo({ chain }: { chain: string }) {
  const m = chainMeta(chain);
  return (
    <span
      className={cn(
        "inline-grid place-items-center w-[22px] h-[22px] rounded-md text-xs font-semibold",
        m.glyphBg,
        m.glyphFg
      )}
      aria-hidden
    >
      {m.glyph}
    </span>
  );
}

function shortenAddress(addr: string) {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatUsd(v: number) {
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
