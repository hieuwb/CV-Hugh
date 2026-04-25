import { cn } from "@/lib/utils";
import { chainMeta } from "@/lib/chain-meta";

type Props = {
  chain: string;
  size?: "sm" | "md";
};

// Pill hiển thị tên chain với màu chủ đạo của chain đó.
export function ChainChip({ chain, size = "sm" }: Props) {
  const m = chainMeta(chain);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        m.chipBg,
        m.chipFg
      )}
    >
      {m.label}
    </span>
  );
}

// Ô vuông 40×40 hiển thị glyph chain — dùng ở đầu mỗi row project.
export function ChainGlyph({ chain }: { chain: string }) {
  const m = chainMeta(chain);
  return (
    <div
      className={cn(
        "grid place-items-center w-10 h-10 rounded-lg font-semibold text-lg",
        m.glyphBg,
        m.glyphFg
      )}
      aria-hidden
    >
      {m.glyph}
    </div>
  );
}
