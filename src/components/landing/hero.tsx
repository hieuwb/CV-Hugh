import { ArrowDown, ArrowUpRight } from "lucide-react";

import { CyclingPhrase } from "./cycling-phrase";

const PHRASES = [
  "Kỹ sư xây dựng",
  "Web3 builder",
  "Vibe coder",
  "AI tinkerer"
];

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-24 pb-16 overflow-hidden">
      {/* Ambient orbs — CSS only, rất nhẹ */}
      <span
        className="landing-orb"
        style={{
          width: 520,
          height: 520,
          left: "-120px",
          top: "-60px",
          background: "radial-gradient(circle, rgba(244,194,107,0.5), transparent 65%)"
        }}
        aria-hidden
      />
      <span
        className="landing-orb"
        style={{
          width: 460,
          height: 460,
          right: "-100px",
          top: "30%",
          background: "radial-gradient(circle, rgba(114,217,255,0.35), transparent 65%)",
          animationDelay: "-6s"
        }}
        aria-hidden
      />

      {/* Top micro-header: chỉ ENS handle, không nav cồng kềnh */}
      <div className="absolute top-6 left-6 md:top-8 md:left-12 lg:left-20 z-10 flex items-center gap-3">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--land-accent)] animate-pulse" />
        <span className="font-mono text-xs md:text-sm tracking-widest text-[var(--land-muted)]">
          pmhieu111.eth
        </span>
      </div>

      {/* Top-right mini nav */}
      <nav
        className="absolute top-6 right-6 md:top-8 md:right-12 lg:right-20 z-10 flex items-center gap-4 text-sm"
        aria-label="Điều hướng phụ"
      >
        <a
          href="#projects"
          className="text-[var(--land-muted)] hover:text-[var(--land-ink)] transition-colors"
        >
          Dự án
        </a>
        <a
          href="/cv"
          className="text-[var(--land-muted)] hover:text-[var(--land-ink)] transition-colors"
        >
          CV
        </a>
        <a
          href="/admin"
          className="text-[var(--land-muted)] hover:text-[var(--land-ink)] transition-colors"
          title="Khu vực riêng tư"
        >
          Admin
        </a>
      </nav>

      {/* Main hero block */}
      <div className="relative z-[1] max-w-5xl">
        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--land-muted)] mb-5">
          Xin chào &mdash; đây là Hugh
        </p>
        <h1 className="m-0 font-extrabold tracking-tight leading-[0.95] text-[clamp(44px,9vw,120px)]">
          Phan Minh
          <br />
          <span className="bg-gradient-to-r from-[var(--land-accent)] via-[var(--land-accent-hot)] to-[var(--land-accent-2)] bg-clip-text text-transparent">
            Hiếu
          </span>
        </h1>

        <p className="mt-6 md:mt-8 text-xl md:text-2xl lg:text-3xl font-medium text-[var(--land-ink)]/90 leading-snug">
          <CyclingPhrase phrases={PHRASES} />
          <span className="text-[var(--land-muted)]">
            {" "}
            từ công trường đến on-chain.
          </span>
        </p>

        <p className="mt-6 max-w-[640px] text-[var(--land-muted)] leading-relaxed text-base md:text-lg">
          Hơn ba năm vẽ shop drawing và giám sát hiện trường cho Novaworld Hồ Tràm.
          Rồi một con COVID, một vài dòng Lisp, vài ly cà phê muộn &mdash; và mình
          rẽ sang build dApp. Giờ mình code dApp, bot trading, tool airdrop, và
          nghiên cứu cách dùng AI để tự động hoá bản vẽ xây dựng.
        </p>

        <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-3 md:gap-4">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--land-accent)] text-[#1a1508] font-semibold px-5 py-3 hover:bg-[#ffd78a] transition-colors"
          >
            Xem dự án
            <ArrowUpRight size={16} />
          </a>
          <a
            href="/cv"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--land-line)] bg-white/5 text-[var(--land-ink)] px-5 py-3 hover:bg-white/10 transition-colors"
          >
            Đọc CV đầy đủ
          </a>
          <a
            href="mailto:pmhieu111@gmail.com"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--land-line)] text-[var(--land-muted)] px-5 py-3 hover:text-[var(--land-ink)] hover:border-white/20 transition-colors"
          >
            pmhieu111@gmail.com
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--land-muted)]"
        aria-hidden
      >
        <span className="text-xs tracking-widest">CUỘN</span>
        <span className="landing-scroll-dot">
          <ArrowDown size={16} />
        </span>
      </div>
    </section>
  );
}
