"use client";

import { ArrowUpRight, Github, Star } from "lucide-react";

import type { ProjectItem } from "@/lib/projects";

type Props = {
  project: ProjectItem;
  featured?: boolean;
};

// Thẻ dự án: gradient artwork + mô tả + link. Pure CSS tilt (class .landing-proj)
// + glow theo cursor qua CSS custom props (-mx / -my) cập nhật trong onMouseMove.
export function ProjectCard({ project, featured = false }: Props) {
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${mx}%`);
    el.style.setProperty("--my", `${my}%`);
  }

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`landing-proj group relative flex flex-col rounded-2xl overflow-hidden border border-[var(--land-line)] bg-white/[0.03] backdrop-blur-sm ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
      data-cursor-link
    >
      <div
        className="relative overflow-hidden"
        onMouseMove={onMove}
        style={{ aspectRatio: featured ? "16/10" : "16/9" }}
      >
        <ArtworkFor project={project} featured={featured} />
        <div className="landing-proj-glow" aria-hidden />
        {featured ? (
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-[var(--land-accent)] text-[#1a1508] font-semibold">
            <Star size={11} /> Featured
          </span>
        ) : null}
      </div>

      <div className="p-5 md:p-6 flex flex-col gap-3 grow">
        <div className="flex items-start justify-between gap-3">
          <h3 className={`m-0 font-semibold ${featured ? "text-2xl" : "text-lg"}`}>
            {project.title}
          </h3>
          <span className="grid place-items-center w-8 h-8 rounded-full border border-[var(--land-line)] text-[var(--land-muted)] group-hover:text-[var(--land-accent)] group-hover:border-[var(--land-accent)]/40 transition-colors shrink-0">
            {project.kind === "github" ? (
              <Github size={14} />
            ) : (
              <ArrowUpRight size={14} />
            )}
          </span>
        </div>

        <p
          className={`m-0 text-[var(--land-muted)] leading-relaxed ${
            featured ? "text-base" : "text-sm"
          }`}
        >
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {project.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] md:text-xs px-2 py-0.5 rounded-full border border-[var(--land-line)] bg-white/[0.03] text-[var(--land-ink)]/75"
            >
              {t}
            </span>
          ))}
        </div>

        <p className="m-0 text-[11px] font-mono text-[var(--land-muted)] truncate">
          {project.displayUrl}
        </p>
      </div>
    </a>
  );
}

/* ------------------------------------------------------------------
   Artwork: mỗi dự án 1 gradient + glyph — rẻ, không tải ảnh ngoài.
   Khi user thật sự muốn, có thể thay bằng <img src="/og-<slug>.png" />
   ------------------------------------------------------------------ */
function ArtworkFor({
  project,
  featured
}: {
  project: ProjectItem;
  featured: boolean;
}) {
  const bg = project.artwork.gradient;
  const ring = project.artwork.ring;
  const glyph = project.artwork.glyph;

  return (
    <div className="absolute inset-0" style={{ background: bg }}>
      {/* Grid dạng vân kẻ mờ */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
        aria-hidden
      />
      {/* Orb lớn làm tâm điểm */}
      <span
        aria-hidden
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          width: featured ? 340 : 220,
          height: featured ? 340 : 220,
          transform: "translate(-50%, -50%)",
          borderRadius: "999px",
          background: ring,
          filter: "blur(32px)",
          opacity: 0.55
        }}
      />
      {/* Glyph center */}
      <div
        className={`absolute inset-0 grid place-items-center font-extrabold tracking-tight ${
          featured ? "text-[96px] md:text-[120px]" : "text-[64px]"
        }`}
        style={{ color: "rgba(255,255,255,0.92)", textShadow: "0 4px 40px rgba(0,0,0,0.35)" }}
      >
        {glyph}
      </div>
    </div>
  );
}
