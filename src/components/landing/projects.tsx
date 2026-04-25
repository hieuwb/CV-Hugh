import { Reveal } from "./reveal";
import { ProjectCard } from "./project-card";
import { PROJECTS } from "@/lib/projects";

export function Projects() {
  const featured = PROJECTS.find((p) => p.featured);
  const rest = PROJECTS.filter((p) => !p.featured);

  return (
    <section
      id="projects"
      className="relative px-6 md:px-12 lg:px-20 py-20 md:py-28 border-t border-[var(--land-line)]"
    >
      <Reveal>
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--land-muted)] mb-4">
          Dự án
        </p>
      </Reveal>
      <Reveal delay={60}>
        <h2 className="m-0 text-3xl md:text-4xl font-bold max-w-3xl">
          Những thứ mình đã ship.
        </h2>
      </Reveal>
      <Reveal delay={120}>
        <p className="mt-4 text-[var(--land-muted)] max-w-2xl leading-relaxed">
          Hai năm rẽ vào Web3, mình build dApp, tool farming và bot — tất cả live
          trên Vercel hoặc GitHub. Click để ghé, Blob Alpha là thứ mình thích nhất.
        </p>
      </Reveal>

      <div className="mt-10 md:mt-14 grid gap-5 md:gap-6 md:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2">
        {featured ? (
          <Reveal delay={160} className="md:col-span-2 xl:row-span-2">
            <ProjectCard project={featured} featured />
          </Reveal>
        ) : null}
        {rest.map((p, i) => (
          <Reveal key={p.slug} delay={220 + i * 80}>
            <ProjectCard project={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
