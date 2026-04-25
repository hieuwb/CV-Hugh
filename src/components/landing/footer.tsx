export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="px-6 md:px-12 lg:px-20 py-10 border-t border-[var(--land-line)] flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--land-muted)]">
      <span>
        © {year} Phan Minh Hiếu ·{" "}
        <span className="font-mono text-[var(--land-ink)]/70">pmhieu111.eth</span>
      </span>
      <span>
        Built with Next.js 14 · Tailwind · khoảng{" "}
        <span className="text-[var(--land-ink)]/70">2.5 cốc cà phê</span>.
      </span>
    </footer>
  );
}
