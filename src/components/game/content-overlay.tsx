"use client";

import { X } from "lucide-react";

import type { ContactLink, Landmark } from "@/lib/game-content";

import { iconFor } from "./social-icons";

type Props = {
  landmark: Landmark | null;
  onDismiss: () => void;
};

// Panel nổi bên phải (hoặc dưới mobile) hiển thị nội dung landmark đang active.
// Slide-in nhờ CSS class, dismiss khi lái ra khỏi vùng hoặc bấm X.
export function ContentOverlay({ landmark, onDismiss }: Props) {
  const visible = Boolean(landmark);
  return (
    <aside
      aria-live="polite"
      className={`game-overlay fixed right-4 md:right-6 bottom-20 md:bottom-auto md:top-24 z-20 w-[min(440px,calc(100vw-2rem))] transition-all duration-500 ease-out ${
        visible
          ? "opacity-100 translate-x-0 pointer-events-auto"
          : "opacity-0 translate-x-8 pointer-events-none"
      }`}
    >
      {landmark ? (
        <div className="relative rounded-2xl border border-white/15 bg-[#0c0c16]/85 backdrop-blur-xl text-white p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Đóng"
            className="absolute top-3 right-3 grid place-items-center w-8 h-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>

          {landmark.subtitle ? (
            <p
              className="text-[10px] tracking-[0.25em] uppercase m-0 mb-2 font-semibold"
              style={{ color: landmark.accent }}
            >
              {landmark.subtitle}
            </p>
          ) : null}

          <h2 className="m-0 text-xl md:text-2xl font-bold leading-tight">
            {landmark.title}
          </h2>

          {landmark.body ? (
            <p className="mt-3 mb-0 text-sm md:text-[15px] text-white/80 leading-relaxed">
              {landmark.body}
            </p>
          ) : null}

          {landmark.bullets && landmark.bullets.length > 0 ? (
            <ul className="mt-3 list-none p-0 flex flex-col gap-1.5 text-sm text-white/85">
              {landmark.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span style={{ color: landmark.accent }} aria-hidden>
                    ◆
                  </span>
                  <span className="leading-snug">{b}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {landmark.links && landmark.links.length > 0 ? (
            <LinksGrid links={landmark.links} />
          ) : null}

          {landmark.ctaHref && landmark.ctaLabel ? (
            <a
              href={landmark.ctaHref}
              target={landmark.ctaHref.startsWith("http") ? "_blank" : undefined}
              rel={landmark.ctaHref.startsWith("http") ? "noopener noreferrer" : undefined}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                background: landmark.accent,
                color: "#1a1508"
              }}
            >
              {landmark.ctaLabel} →
            </a>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}

function LinksGrid({ links }: { links: ContactLink[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {links.map((link) => (
        <LinkPill key={`${link.kind}-${link.label}`} link={link} />
      ))}
    </div>
  );
}

function LinkPill({ link }: { link: ContactLink }) {
  const Icon = iconFor(link.kind);
  const body = (
    <>
      <span
        className="grid place-items-center w-7 h-7 rounded-md shrink-0"
        style={{
          background: `${link.accent}22`,
          color: link.accent
        }}
      >
        <Icon size={13} />
      </span>
      <span className="flex flex-col min-w-0 text-left">
        <span className="text-[10px] tracking-widest uppercase text-white/50 leading-tight">
          {labelFor(link.kind)}
        </span>
        <span className="font-mono text-[12px] text-white/90 truncate">
          {link.label}
        </span>
      </span>
    </>
  );

  if (!link.href) {
    return (
      <span
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2"
        title={`${labelFor(link.kind)} · ${link.label}`}
      >
        {body}
      </span>
    );
  }

  return (
    <a
      href={link.href}
      target={link.href.startsWith("http") ? "_blank" : undefined}
      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2 hover:bg-white/[0.07] hover:border-white/25 transition-colors"
    >
      {body}
    </a>
  );
}

function labelFor(kind: ContactLink["kind"]): string {
  switch (kind) {
    case "email":
      return "Email";
    case "ens":
      return "ENS";
    case "phone":
      return "Điện thoại";
    case "x":
      return "X";
    case "youtube":
      return "YouTube";
    case "discord":
      return "Discord";
    case "telegram":
      return "Telegram";
    case "github":
      return "GitHub";
    case "location":
      return "Nơi ở";
  }
}
