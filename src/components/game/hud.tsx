"use client";

import { Lock, Printer } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  nearTitle: string | null;
};

export function HUD({ nearTitle }: Props) {
  const [hideHint, setHideHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHideHint(true), 10000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Top-left: identity */}
      <div className="fixed top-4 left-4 md:top-6 md:left-8 z-20 flex items-center gap-2.5 pointer-events-none">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#f4c26b] animate-pulse" />
        <span className="font-mono text-[11px] md:text-xs tracking-widest text-white/70">
          pmhieu111.eth
        </span>
      </div>

      {/* Top-right: CV PDF + Admin */}
      <nav
        aria-label="Điều hướng"
        className="fixed top-4 right-4 md:top-6 md:right-8 z-20 flex items-center gap-2"
      >
        <Link
          href="/cv"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          title="Bản CV tĩnh để in PDF"
        >
          <Printer size={12} />
          CV PDF
        </Link>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          title="Cần mật khẩu"
        >
          <Lock size={12} />
          Admin
        </Link>
      </nav>

      {/* Bottom-right: credit Bruno Simon (MIT) */}
      <a
        href="https://bruno-simon.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 right-3 md:bottom-4 md:right-4 z-10 text-[10px] md:text-[11px] text-white/45 hover:text-white/80 transition-colors tracking-wider"
        title="Xe, cây, đèn và texture là asset MIT của Bruno Simon · folio-2025"
      >
        models & art · bruno-simon.com (MIT)
      </a>

      {/* Bottom-center: keyboard hint */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-700 ${
          hideHint && !nearTitle ? "opacity-30" : "opacity-100"
        }`}
      >
        <div className="flex gap-1.5 text-[11px] md:text-xs text-white/70">
          <Key>W</Key>
          <Key>A</Key>
          <Key>S</Key>
          <Key>D</Key>
          <span className="mx-2 text-white/40">·</span>
          <Key>Shift</Key>
          <span className="self-center text-white/60 ml-1">tăng tốc</span>
          <span className="mx-2 text-white/40">·</span>
          <Key>R</Key>
          <span className="self-center text-white/60 ml-1">reset xe</span>
        </div>
        {nearTitle ? (
          <div className="text-xs md:text-sm font-medium text-[#f4c26b]">
            → Đang ở: {nearTitle}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[10px] md:text-xs text-white/55 tracking-[0.2em] uppercase">
            <span className="text-[#f4c26b]">✦</span>
            <span>Lái khám phá thế giới của Hugh</span>
            <span className="text-[#f4c26b]">✦</span>
          </div>
        )}
      </div>
    </>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-grid place-items-center min-w-[22px] h-6 px-1.5 rounded border border-white/20 bg-white/8 font-mono text-[10px] md:text-[11px] text-white">
      {children}
    </kbd>
  );
}
