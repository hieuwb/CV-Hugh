import { cn } from "@/lib/utils";

type SocialKind = "twitter" | "discord" | "email";

// Badge tài khoản social gắn với ví — logo glyph + handle.
// Không cần ảnh ngoài; glyph bằng SVG inline nhỏ.
const KIND: Record<SocialKind, { bg: string; fg: string; Glyph: () => JSX.Element }> = {
  twitter: {
    bg: "bg-sky-50",
    fg: "text-sky-600",
    Glyph: () => (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
      </svg>
    )
  },
  discord: {
    bg: "bg-indigo-50",
    fg: "text-indigo-600",
    Glyph: () => (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3a14.84 14.84 0 0 0-.671 1.384 18.34 18.34 0 0 0-5.482 0A12.84 12.84 0 0 0 9.73 3a19.74 19.74 0 0 0-3.76 1.369C2.632 9.02 1.673 13.553 2.114 18.022a19.95 19.95 0 0 0 6.073 3.066 14.76 14.76 0 0 0 1.29-2.099 12.94 12.94 0 0 1-2.03-.973c.17-.123.336-.252.497-.385a14.25 14.25 0 0 0 12.114 0c.162.134.328.263.498.385a12.86 12.86 0 0 1-2.034.974 14.74 14.74 0 0 0 1.29 2.099 19.93 19.93 0 0 0 6.076-3.066c.516-5.178-.94-9.671-3.571-13.653ZM8.52 15.333c-1.18 0-2.152-1.094-2.152-2.438 0-1.345.947-2.44 2.152-2.44 1.205 0 2.177 1.095 2.152 2.44 0 1.344-.947 2.438-2.152 2.438Zm7.957 0c-1.18 0-2.152-1.094-2.152-2.438 0-1.345.947-2.44 2.152-2.44 1.205 0 2.177 1.095 2.152 2.44 0 1.344-.947 2.438-2.152 2.438Z" />
      </svg>
    )
  },
  email: {
    bg: "bg-rose-50",
    fg: "text-rose-600",
    Glyph: () => (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M2 6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5v-11Zm2.28-.5 7.72 5.79L19.72 6H4.28Zm15.72 1.64-7.28 5.47a1 1 0 0 1-1.44 0L4 7.64V17.5c0 .28.22.5.5.5h15a.5.5 0 0 0 .5-.5V7.64Z" />
      </svg>
    )
  }
};

export function SocialBadge({
  kind,
  handle
}: {
  kind: SocialKind;
  handle: string;
}) {
  const m = KIND[kind];
  const Glyph = m.Glyph;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium max-w-full",
        m.bg,
        m.fg
      )}
      title={handle}
    >
      <Glyph />
      <span className="truncate max-w-[140px]">{handle}</span>
    </span>
  );
}
