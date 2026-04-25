import { Mail, Phone, MapPin } from "lucide-react";

import { Reveal } from "./reveal";

export function ContactCta() {
  return (
    <section
      id="contact"
      className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32 border-t border-[var(--land-line)]"
    >
      <div className="max-w-4xl">
        <Reveal>
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--land-muted)] mb-4">
            Liên hệ
          </p>
        </Reveal>

        <Reveal delay={60}>
          <h2 className="m-0 text-4xl md:text-6xl font-bold leading-[1.05]">
            Có ý tưởng Web3?
            <br />
            Hoặc cần tự động hoá bản vẽ xây dựng?{" "}
            <span className="text-[var(--land-accent)]">Nói chuyện nhé.</span>
          </h2>
        </Reveal>

        <Reveal delay={140}>
          <div className="mt-10 md:mt-14 grid gap-4 md:grid-cols-2 max-w-3xl">
            <ContactRow
              icon={<Mail size={18} />}
              label="Email"
              value="pmhieu111@gmail.com"
              href="mailto:pmhieu111@gmail.com"
            />
            <ContactRow
              icon={
                <span className="font-mono text-base" aria-hidden>
                  Ξ
                </span>
              }
              label="Web3 identity"
              value="pmhieu111.eth"
              href="https://app.ens.domains/pmhieu111.eth"
            />
            <ContactRow
              icon={<Phone size={18} />}
              label="Điện thoại"
              value="0397 132 572"
              href="tel:+84397132572"
            />
            <ContactRow
              icon={<MapPin size={18} />}
              label="Nơi ở"
              value="Bắc Trạch, Quảng Trị · Việt Nam"
            />
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-10 md:mt-12 flex flex-wrap gap-3">
            <a
              href="mailto:pmhieu111@gmail.com"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--land-accent)] text-[#1a1508] font-semibold px-6 py-3 hover:bg-[#ffd78a] transition-colors"
            >
              Gửi email
            </a>
            <a
              href="/cv"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--land-line)] bg-white/5 text-[var(--land-ink)] px-6 py-3 hover:bg-white/10 transition-colors"
            >
              Tải CV PDF
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="grid place-items-center w-10 h-10 rounded-lg border border-[var(--land-line)] bg-white/[0.03] text-[var(--land-accent)] shrink-0">
        {icon}
      </span>
      <span className="flex flex-col min-w-0">
        <span className="text-[11px] tracking-widest uppercase text-[var(--land-muted)]">
          {label}
        </span>
        <span className="font-mono text-sm md:text-base text-[var(--land-ink)] truncate">
          {value}
        </span>
      </span>
    </>
  );

  return href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-4 rounded-xl border border-[var(--land-line)] bg-white/[0.02] p-4 hover:bg-white/[0.05] hover:border-white/20 transition-colors"
    >
      {body}
    </a>
  ) : (
    <div className="flex items-center gap-4 rounded-xl border border-[var(--land-line)] bg-white/[0.02] p-4">
      {body}
    </div>
  );
}
