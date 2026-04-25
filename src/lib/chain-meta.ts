// Metadata hiển thị cho từng chain — logo glyph (chữ cái đầu hoặc symbol)
// + 2 màu background/foreground cho chip. Dùng cho Phase 1 mock-up.
// Phase 4 sẽ thay bằng logo thật (ảnh từ /public) khi wallet module online.

export type ChainKey =
  | "monad"
  | "berachain"
  | "solana"
  | "ethereum"
  | "multi-chain"
  | "starknet"
  | "zetachain"
  | "manta"
  | "arbitrum"
  | "base"
  | "optimism"
  | "polygon";

export type ChainMeta = {
  label: string;
  chipBg: string;       // Tailwind class cho pill background
  chipFg: string;       // Tailwind class cho pill text
  glyphBg: string;      // Tailwind class cho icon box background
  glyphFg: string;      // Tailwind class cho icon box text
  glyph: string;        // Ký tự/symbol hiển thị trong ô 8×8
};

export const CHAIN_META: Record<ChainKey, ChainMeta> = {
  monad: {
    label: "Monad",
    chipBg: "bg-indigo-100",
    chipFg: "text-indigo-700",
    glyphBg: "bg-indigo-50",
    glyphFg: "text-indigo-600",
    glyph: "◆"
  },
  berachain: {
    label: "Berachain",
    chipBg: "bg-amber-100",
    chipFg: "text-amber-700",
    glyphBg: "bg-amber-50",
    glyphFg: "text-amber-700",
    glyph: "🐻"
  },
  solana: {
    label: "Solana",
    chipBg: "bg-emerald-100",
    chipFg: "text-emerald-700",
    glyphBg: "bg-emerald-50",
    glyphFg: "text-emerald-600",
    glyph: "S"
  },
  ethereum: {
    label: "Ethereum",
    chipBg: "bg-sky-100",
    chipFg: "text-sky-700",
    glyphBg: "bg-sky-50",
    glyphFg: "text-sky-700",
    glyph: "Ξ"
  },
  "multi-chain": {
    label: "Multi-chain",
    chipBg: "bg-slate-100",
    chipFg: "text-slate-700",
    glyphBg: "bg-slate-100",
    glyphFg: "text-slate-600",
    glyph: "⬡"
  },
  starknet: {
    label: "StarkNet",
    chipBg: "bg-fuchsia-100",
    chipFg: "text-fuchsia-700",
    glyphBg: "bg-fuchsia-50",
    glyphFg: "text-fuchsia-700",
    glyph: "★"
  },
  zetachain: {
    label: "ZetaChain",
    chipBg: "bg-teal-100",
    chipFg: "text-teal-700",
    glyphBg: "bg-teal-50",
    glyphFg: "text-teal-700",
    glyph: "Z"
  },
  manta: {
    label: "Manta",
    chipBg: "bg-cyan-100",
    chipFg: "text-cyan-700",
    glyphBg: "bg-cyan-50",
    glyphFg: "text-cyan-700",
    glyph: "M"
  },
  arbitrum: {
    label: "Arbitrum",
    chipBg: "bg-blue-100",
    chipFg: "text-blue-700",
    glyphBg: "bg-blue-50",
    glyphFg: "text-blue-700",
    glyph: "Ar"
  },
  base: {
    label: "Base",
    chipBg: "bg-blue-100",
    chipFg: "text-blue-700",
    glyphBg: "bg-blue-50",
    glyphFg: "text-blue-700",
    glyph: "B"
  },
  optimism: {
    label: "Optimism",
    chipBg: "bg-rose-100",
    chipFg: "text-rose-700",
    glyphBg: "bg-rose-50",
    glyphFg: "text-rose-700",
    glyph: "Op"
  },
  polygon: {
    label: "Polygon",
    chipBg: "bg-purple-100",
    chipFg: "text-purple-700",
    glyphBg: "bg-purple-50",
    glyphFg: "text-purple-700",
    glyph: "P"
  }
};

export function chainMeta(key: string): ChainMeta {
  return CHAIN_META[key as ChainKey] ?? CHAIN_META["multi-chain"];
}
