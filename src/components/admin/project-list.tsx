import Link from "next/link";
import { Check, MoreVertical } from "lucide-react";

import { ChainChip, ChainGlyph } from "./chain-chip";
import type {
  InProgressProject,
  CompletedProject
} from "@/lib/mock/dashboard";

// Card "Dự án đang làm" — 5 row, có progress bar màu theo %.
export function InProgressList({ items }: { items: InProgressProject[] }) {
  return (
    <ProjectCard title="Dự án đang làm" viewAllHref="/admin/airdrops">
      <ul className="flex flex-col">
        {items.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-4 py-3 border-b border-line last:border-b-0"
          >
            <ChainGlyph chain={p.chain} />
            <div className="w-40 min-w-0">
              <p className="m-0 text-sm font-semibold text-fg truncate">{p.name}</p>
            </div>
            <ChainChip chain={p.chain} />
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <ProgressBar value={p.progress} />
              <span className="text-sm font-semibold text-fg tabular-nums min-w-[40px] text-right">
                {p.progress}%
              </span>
            </div>
            <button
              type="button"
              className="grid place-items-center w-8 h-8 rounded-md text-fg-soft hover:text-fg hover:bg-bg-muted transition-colors"
              aria-label="Tuỳ chọn"
            >
              <MoreVertical size={16} />
            </button>
          </li>
        ))}
      </ul>
    </ProjectCard>
  );
}

// Card "Dự án hoàn thành gần đây" — row có check xanh + date phải.
export function CompletedList({ items }: { items: CompletedProject[] }) {
  return (
    <ProjectCard title="Dự án hoàn thành gần đây" viewAllHref="/admin/airdrops?status=claimed">
      <ul className="flex flex-col">
        {items.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-4 py-3 border-b border-line last:border-b-0"
          >
            <div className="grid place-items-center w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600">
              <Check size={18} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="m-0 text-sm font-semibold text-fg truncate">{p.name}</p>
            </div>
            <ChainChip chain={p.chain} />
            <span className="text-sm text-fg-muted tabular-nums min-w-[96px] text-right">
              {p.completedOn}
            </span>
          </li>
        ))}
      </ul>
    </ProjectCard>
  );
}

// Khung card chung — tiêu đề + "Xem tất cả".
function ProjectCard({
  title,
  viewAllHref,
  children
}: {
  title: string;
  viewAllHref: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-bg-surface shadow-card p-5">
      <header className="flex items-center justify-between mb-1">
        <h2 className="m-0 text-base font-semibold text-fg">{title}</h2>
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-brand hover:text-brand-hover transition-colors"
        >
          Xem tất cả
        </Link>
      </header>
      {children}
    </section>
  );
}

// Progress bar phẳng + fill brand.
function ProgressBar({ value }: { value: number }) {
  return (
    <div
      className="flex-1 h-2 rounded-full bg-bg-muted overflow-hidden"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-brand transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
