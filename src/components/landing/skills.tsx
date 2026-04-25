import { HardHat, Cpu } from "lucide-react";

import { Reveal } from "./reveal";

const CIVIL = [
  "AutoCAD",
  "Revit",
  "Civil 3D",
  "Shop drawing",
  "Bóc khối lượng",
  "Hồ sơ chất lượng",
  "Biện pháp thi công",
  "Giám sát hiện trường",
  "AutoCAD Lisp"
];

const WEB3 = [
  "TypeScript",
  "React 18",
  "Next.js 14",
  "Node.js",
  "viem / Wagmi",
  "Supabase",
  "PostgreSQL",
  "Solidity (cơ bản)",
  "Alchemy · Helius",
  "AI / Vibe coding",
  "Tailwind CSS"
];

export function Skills() {
  return (
    <section className="relative px-6 md:px-12 lg:px-20 py-20 md:py-28 border-t border-[var(--land-line)]">
      <Reveal>
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--land-muted)] mb-4">
          Kỹ năng
        </p>
      </Reveal>
      <Reveal delay={60}>
        <h2 className="m-0 text-3xl md:text-4xl font-bold max-w-3xl">
          Hai bộ công cụ. Một người cầm.
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-6 md:gap-10 md:grid-cols-2 max-w-5xl">
        <Reveal delay={120}>
          <SkillGroup
            icon={<HardHat size={22} />}
            accent="amber"
            label="Xây dựng"
            hint="Nền tảng 4 năm trên công trường Novaworld Hồ Tràm"
            items={CIVIL}
          />
        </Reveal>
        <Reveal delay={200}>
          <SkillGroup
            icon={<Cpu size={22} />}
            accent="cyan"
            label="Web3 & Dev"
            hint="Ship nhiều dApp trên Vercel, tự host tool airdrop"
            items={WEB3}
          />
        </Reveal>
      </div>
    </section>
  );
}

function SkillGroup({
  icon,
  label,
  hint,
  items,
  accent
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  items: string[];
  accent: "amber" | "cyan";
}) {
  const ring =
    accent === "amber"
      ? "bg-[#f4c26b]/10 text-[#f4c26b] ring-[#f4c26b]/30"
      : "bg-[#72d9ff]/10 text-[#72d9ff] ring-[#72d9ff]/30";
  return (
    <article className="rounded-2xl border border-[var(--land-line)] bg-white/[0.02] backdrop-blur-sm p-6 md:p-7 h-full">
      <div className="flex items-center gap-3">
        <span
          className={`grid place-items-center w-11 h-11 rounded-xl ring-1 ${ring}`}
        >
          {icon}
        </span>
        <div>
          <h3 className="m-0 text-lg font-semibold">{label}</h3>
          <p className="m-0 text-xs text-[var(--land-muted)]">{hint}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((s) => (
          <span
            key={s}
            className="text-xs md:text-sm px-3 py-1.5 rounded-full border border-[var(--land-line)] bg-white/[0.03] text-[var(--land-ink)]/85"
          >
            {s}
          </span>
        ))}
      </div>
    </article>
  );
}
