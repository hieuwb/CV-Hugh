import { type LucideIcon, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Sparkline } from "./sparkline";

type Accent = "indigo" | "green" | "amber" | "violet";

type Props = {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  accent: Accent;
  sparkline: number[];
  trendIcon?: boolean;
};

// Map accent → tailwind classes + raw color cho Recharts.
const ACCENTS: Record<Accent, { soft: string; fg: string; chart: string }> = {
  indigo: {
    soft: "bg-indigo-100 text-indigo-600",
    fg: "text-indigo-600",
    chart: "#4F46E5"
  },
  green: {
    soft: "bg-emerald-100 text-emerald-600",
    fg: "text-emerald-600",
    chart: "#10B981"
  },
  amber: {
    soft: "bg-amber-100 text-amber-600",
    fg: "text-amber-600",
    chart: "#F59E0B"
  },
  violet: {
    soft: "bg-violet-100 text-violet-600",
    fg: "text-violet-600",
    chart: "#8B5CF6"
  }
};

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  sparkline,
  trendIcon = true
}: Props) {
  const a = ACCENTS[accent];
  return (
    <article className="rounded-xl border border-line bg-bg-surface shadow-card p-5 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className={cn("grid place-items-center w-11 h-11 rounded-xl shrink-0", a.soft)}>
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm text-fg-muted">{label}</p>
          <p className="m-0 mt-1 text-3xl font-bold text-fg tracking-tight">{value}</p>
        </div>
        <div className="w-20 -mr-1">
          <Sparkline data={sparkline} color={a.chart} height={44} />
        </div>
      </div>
      <p className={cn("m-0 text-xs font-medium flex items-center gap-1", a.fg)}>
        {trendIcon ? <TrendingUp size={12} /> : null}
        <span>{hint}</span>
      </p>
    </article>
  );
}
