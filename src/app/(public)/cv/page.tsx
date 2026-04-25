import type { ReactNode } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

import { PrintButton } from "@/components/cv/print-button";
import {
  DiscordLogo,
  EnsLogo,
  GitHubLogo,
  TelegramLogo,
  XLogo,
  YouTubeLogo
} from "@/components/game/social-icons";
import { PROJECTS } from "@/lib/projects";

export const metadata = {
  title: "CV · Phan Minh Hiếu (Hugh)",
  description:
    "Phan Minh Hiếu (Hugh · pmhieu111.eth) — Kỹ sư xây dựng chuyển sang Web3 builder. AutoCAD/Revit/Lisp, Next.js, viem, Supabase, AI × AutoCAD."
};

const CONTACT_EMAIL = "pmhieu111@gmail.com";
const ENS_HANDLE = "pmhieu111.eth";

export default function CvPage() {
  return (
    <main className="container cv-page" style={{ paddingBottom: 72 }}>
      {/* HERO ------------------------------------------------------- */}
      <section className="glass" style={{ padding: 28, marginTop: 16 }}>
        <p
          style={{
            margin: 0,
            color: "var(--muted)",
            letterSpacing: "0.2em",
            fontSize: 12
          }}
        >
          HỒ SƠ CÁ NHÂN
        </p>
        <h1 style={{ margin: "12px 0 6px", fontSize: 48, lineHeight: 1.1 }}>
          Phan Minh Hiếu
        </h1>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: 18,
            color: "#ffd479"
          }}
        >
          Hugh
        </p>
        <p
          style={{
            margin: "0 0 12px",
            color: "#72d9ff",
            fontSize: 16,
            fontFamily: "'Space Mono', ui-monospace, monospace",
            letterSpacing: "0.02em"
          }}
        >
          {ENS_HANDLE}
        </p>
        <p
          style={{
            margin: 0,
            color: "var(--muted)",
            fontSize: 18,
            lineHeight: 1.6,
            maxWidth: 760
          }}
        >
          Kỹ sư xây dựng chuyển sang Web3 builder. Mười năm — hai ngành: từ
          shop drawing Novaworld đến dApp on-chain. Hiện độc lập build sản
          phẩm Web3 và nghiên cứu AI × AutoCAD.
        </p>

        <ul
          className="cv-contact-row"
          style={{
            listStyle: "none",
            padding: 0,
            margin: "20px 0 0",
            display: "flex",
            flexWrap: "wrap",
            gap: 10
          }}
        >
          <li>
            <a className="chip" href={`mailto:${CONTACT_EMAIL}`}>
              <Mail size={14} />
              <span style={{ marginLeft: 6 }}>{CONTACT_EMAIL}</span>
            </a>
          </li>
          <li>
            <a
              className="chip"
              href={`https://app.ens.domains/${ENS_HANDLE}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <EnsLogo size={13} />
              <span style={{ marginLeft: 6 }}>{ENS_HANDLE}</span>
            </a>
          </li>
          <li>
            <a
              className="chip"
              href="https://x.com/Hugh_0x"
              rel="noopener noreferrer"
              target="_blank"
            >
              <XLogo size={13} />
              <span style={{ marginLeft: 6 }}>@Hugh_0x</span>
            </a>
          </li>
          <li>
            <a
              className="chip"
              href="https://github.com/hieuwb"
              rel="noopener noreferrer"
              target="_blank"
            >
              <GitHubLogo size={13} />
              <span style={{ marginLeft: 6 }}>hieuwb</span>
            </a>
          </li>
          <li>
            <a
              className="chip"
              href="https://t.me/zminhhieu"
              rel="noopener noreferrer"
              target="_blank"
            >
              <TelegramLogo size={13} />
              <span style={{ marginLeft: 6 }}>t.me/zminhhieu</span>
            </a>
          </li>
          <li>
            <a
              className="chip"
              href="https://www.youtube.com/@HughanimePets"
              rel="noopener noreferrer"
              target="_blank"
            >
              <YouTubeLogo size={13} />
              <span style={{ marginLeft: 6 }}>@HughanimePets</span>
            </a>
          </li>
          <li>
            <span className="chip" title="Discord handle">
              <DiscordLogo size={13} />
              <span style={{ marginLeft: 6 }}>hieuwb</span>
            </span>
          </li>
          <li>
            <a className="chip" href="tel:+84397132572">
              <Phone size={13} />
              <span style={{ marginLeft: 6 }}>0397 132 572</span>
            </a>
          </li>
          <li>
            <span className="chip">
              <MapPin size={14} />
              <span style={{ marginLeft: 6 }}>Bắc Trạch, Quảng Trị</span>
            </span>
          </li>
        </ul>

        <div
          className="cv-cta-row"
          style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}
        >
          <PrintButton />
          <a className="btn" href={`mailto:${CONTACT_EMAIL}`}>
            Gửi email
          </a>
          <a className="btn" href="/">
            Mở CV 3D
          </a>
        </div>
      </section>

      {/* GIỚI THIỆU ------------------------------------------------- */}
      <section className="glass" style={{ padding: 24, marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Giới thiệu</h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, marginTop: 0 }}>
          Tốt nghiệp <strong>Kỹ thuật Xây dựng</strong> năm 2021. Bốn năm
          shop drawing và hồ sơ chất lượng cho{" "}
          <strong>Novaworld Hồ Tràm (Novaland)</strong> — học cách triển khai
          chi tiết, quản lý dung sai và làm việc với 200+ bản vẽ song song.
        </p>
        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          COVID 2023 là bước ngoặt. Lisp tự động hoá AutoCAD kéo mình vào
          lập trình, rồi chạm Web3. Từ 2024 build độc lập:{" "}
          <strong>dApp swap với Zama FHE</strong>, demo storage trên Shelby,
          tool farming testnet, bot tin tức Binance.
        </p>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 0 }}>
          Hướng đi 2025+: <strong>AI × AutoCAD</strong> — ra lệnh bản vẽ bằng
          prompt, kết hợp domain knowledge xây dựng với Web3 + AI.
        </p>
      </section>

      {/* KỸ NĂNG ---------------------------------------------------- */}
      <section className="glass" style={{ padding: 24, marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Kỹ năng</h2>
        <SkillGroup
          label="🦺 Xây dựng"
          items={[
            "AutoCAD",
            "Revit",
            "Civil 3D",
            "Shop drawing (kết cấu + MEP)",
            "Lisp / DCL — automation AutoCAD",
            "Hồ sơ chất lượng (QA/QC)"
          ]}
        />
        <SkillGroup
          label="🖥️ Web3 / Frontend"
          items={[
            "TypeScript",
            "Next.js 14 (App Router)",
            "React 18",
            "Tailwind CSS",
            "viem · Wagmi",
            "Solidity (cơ bản)"
          ]}
        />
        <SkillGroup
          label="⛓️ Blockchain ops"
          items={[
            "EVM: Ethereum, Base, Arbitrum, Optimism, Polygon, Monad, Berachain",
            "Solana cơ bản",
            "Zama FHE — fully-homomorphic encryption demo",
            "Shelby — decentralized storage",
            "Multi-wallet ops · Anti-Sybil",
            "Argon2id + AES-256-GCM (envelope encryption)"
          ]}
        />
        <SkillGroup
          label="🤖 AI & automation"
          items={[
            "AI vibe coding (Claude, GPT, Gemini)",
            "Prompt engineering cho design tools",
            "Telegram bots — Node.js + CEX APIs",
            "Workflow automation"
          ]}
        />
        <SkillGroup
          label="🛠️ DevOps & hạ tầng"
          items={[
            "Supabase (Auth + RLS)",
            "Vercel",
            "Cloudflare (DNS + Email Routing)",
            "Upstash QStash",
            "GitHub Actions"
          ]}
        />
      </section>

      {/* DỰ ÁN ------------------------------------------------------ */}
      <section className="glass" style={{ padding: 24, marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Dự án</h2>
        {PROJECTS.map((p) => (
          <Project
            key={p.slug}
            title={p.title}
            tagline={p.displayUrl}
            description={p.description}
            tech={p.tags}
            link={{
              label: p.kind === "github" ? "Mở GitHub →" : "Mở demo →",
              href: p.url
            }}
            featured={p.featured}
          />
        ))}
      </section>

      {/* KINH NGHIỆM ------------------------------------------------ */}
      <section className="glass" style={{ padding: 24, marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Kinh nghiệm</h2>

        <Experience
          period="2025 – nay"
          role="Researcher · AI × AutoCAD"
          org="Độc lập"
          bullets={[
            "Nghiên cứu cách AI điều khiển trực tiếp AutoCAD/Revit qua prompt",
            "Kết hợp Lisp automation + LLM API để gen bản vẽ shop drawing"
          ]}
        />

        <Experience
          period="2024 – nay"
          role="Web3 Developer · Independent"
          org="Solo builder"
          bullets={[
            "Build 5+ dApp/tool/bot công khai (xem mục Dự án)",
            "Multi-chain ops: Ethereum, Base, Arbitrum, Solana, Berachain, Monad",
            "Wallet manager với envelope encryption (Argon2id + AES-256-GCM)",
            "Tham gia testnet & airdrop farming có hệ thống (anti-Sybil)"
          ]}
        />

        <Experience
          period="2021 – 2025"
          role="Kỹ sư Shop Drawing"
          org="Novaworld Hồ Tràm · Novaland"
          bullets={[
            "Triển khai chi tiết bản vẽ thi công cho khu nghỉ dưỡng Hồ Tràm",
            "Quản lý hồ sơ chất lượng (QA/QC) cho hạng mục được giao",
            "Phối hợp đa nhóm: kết cấu, kiến trúc, MEP, giám sát hiện trường"
          ]}
        />

        <Experience
          period="2021 – 2025"
          role="Kỹ sư Xây dựng"
          org="Công ty TNHH Vận Tải Đại Nam"
          bullets={[
            "Tham gia thiết kế và triển khai các công trình hạ tầng",
            "Sử dụng AutoCAD + Civil 3D cho thiết kế đường + công trình kỹ thuật"
          ]}
        />
      </section>

      {/* HỌC VẤN ---------------------------------------------------- */}
      <section className="glass" style={{ padding: 24, marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Học vấn</h2>
        <Experience
          period="2016 – 2021"
          role="Kỹ sư Kỹ thuật Xây dựng"
          org="Đại học Kinh Tế – Kỹ Thuật Bình Dương"
          bullets={[
            "Chuyên ngành: Kỹ thuật Xây dựng",
            "Đồ án tốt nghiệp về thiết kế kết cấu công trình dân dụng"
          ]}
        />
      </section>

      {/* HÀNH TRÌNH ------------------------------------------------- */}
      <section className="glass" style={{ padding: 24, marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Hành trình rẽ ngành</h2>
        <ol
          style={{
            margin: 0,
            paddingLeft: 18,
            color: "var(--muted)",
            lineHeight: 1.8
          }}
        >
          <li>
            <strong>2016 – 2021</strong> — Sinh viên Kỹ thuật Xây dựng tại
            ĐH Kinh Tế – KT Bình Dương.
          </li>
          <li>
            <strong>2021 – 2025</strong> — Kỹ sư xây dựng + shop drawing.
            Novaworld Hồ Tràm là dự án lớn nhất.
          </li>
          <li>
            <strong>2023</strong> — COVID. Bắt đầu viết Lisp tự động hoá
            AutoCAD → bước chân vào lập trình thật sự.
          </li>
          <li>
            <strong>2024 – nay</strong> — Web3 dev độc lập. Học EVM, viem,
            Next.js. Build dApp + bot + tool.
          </li>
          <li>
            <strong>2025 – nay</strong> — AI × AutoCAD. Tận dụng cả hai
            ngành để làm điều mà ít người Việt đang làm.
          </li>
        </ol>
      </section>

      {/* LIÊN HỆ --------------------------------------------------- */}
      <section
        className="glass"
        style={{ padding: 24, marginTop: 18, marginBottom: 0 }}
      >
        <h2 style={{ marginTop: 0 }}>Liên hệ</h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, marginTop: 0 }}>
          Cần xây dApp, tool farming, bot Telegram, hoặc bàn ý tưởng AI ×
          CAD — nhắn qua bất kỳ kênh nào dưới đây. Email là kênh trả lời
          nhanh nhất (trong 24h).
        </p>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "14px 0 0",
            display: "grid",
            gap: 10,
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))"
          }}
        >
          <ContactRow
            icon={<Mail size={16} />}
            label="Email"
            value={CONTACT_EMAIL}
            href={`mailto:${CONTACT_EMAIL}`}
          />
          <ContactRow
            icon={<EnsLogo size={14} />}
            label="Web3 identity"
            value={ENS_HANDLE}
            href={`https://app.ens.domains/${ENS_HANDLE}`}
          />
          <ContactRow
            icon={<XLogo size={14} />}
            label="X"
            value="@Hugh_0x"
            href="https://x.com/Hugh_0x"
          />
          <ContactRow
            icon={<GitHubLogo size={14} />}
            label="GitHub"
            value="github.com/hieuwb"
            href="https://github.com/hieuwb"
          />
          <ContactRow
            icon={<TelegramLogo size={14} />}
            label="Telegram"
            value="t.me/zminhhieu"
            href="https://t.me/zminhhieu"
          />
          <ContactRow
            icon={<YouTubeLogo size={14} />}
            label="YouTube"
            value="@HughanimePets"
            href="https://www.youtube.com/@HughanimePets"
          />
          <ContactRow
            icon={<DiscordLogo size={14} />}
            label="Discord"
            value="hieuwb"
          />
          <ContactRow
            icon={<Phone size={14} />}
            label="Điện thoại"
            value="0397 132 572"
            href="tel:+84397132572"
          />
          <ContactRow
            icon={<MapPin size={14} />}
            label="Nơi ở"
            value="Bắc Trạch, Quảng Trị · VN"
          />
        </ul>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <a className="btn primary" href={`mailto:${CONTACT_EMAIL}`}>
            <Mail size={16} />
            <span style={{ marginLeft: 6 }}>Gửi email ngay</span>
          </a>
        </div>
      </section>
    </main>
  );
}

// --------------------------------------------------------------- helpers

function SkillGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={{ marginTop: 14 }}>
      <p
        style={{
          margin: "0 0 8px",
          color: "var(--muted)",
          fontSize: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase"
        }}
      >
        {label}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((s) => (
          <span className="chip" key={s} style={{ fontSize: 13 }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function Project({
  title,
  tagline,
  description,
  tech,
  link,
  featured
}: {
  title: string;
  tagline: string;
  description: ReactNode;
  tech: string[];
  link?: { label: string; href: string };
  featured?: boolean;
}) {
  return (
    <article
      style={{
        border: featured
          ? "1px solid rgba(244,194,107,0.5)"
          : "1px solid rgba(255,255,255,0.18)",
        borderRadius: 14,
        padding: 18,
        marginTop: 14,
        background: featured ? "rgba(244,194,107,0.04)" : undefined
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10
        }}
      >
        <h3 style={{ margin: 0 }}>
          {featured && <span style={{ color: "#ffd479", marginRight: 6 }}>★</span>}
          {title}
        </h3>
        {link ? (
          <a
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            style={{ color: "#72d9ff", fontSize: 14, fontWeight: 600 }}
          >
            {link.label}
          </a>
        ) : null}
      </div>
      <p
        style={{
          margin: "4px 0 10px",
          color: "var(--muted)",
          fontSize: 13,
          fontFamily: "ui-monospace, monospace"
        }}
      >
        {tagline}
      </p>
      <p style={{ color: "var(--muted)", lineHeight: 1.65, margin: "0 0 12px" }}>
        {description}
      </p>
      {tech.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tech.map((t) => (
            <span className="chip" key={t} style={{ fontSize: 12, padding: "4px 10px" }}>
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function Experience({
  period,
  role,
  org,
  bullets
}: {
  period: string;
  role: string;
  org: string;
  bullets: string[];
}) {
  return (
    <article
      style={{
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 12,
        padding: 16,
        marginTop: 12
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8
        }}
      >
        <h3 style={{ margin: 0, fontSize: 17 }}>{role}</h3>
        <span
          style={{
            fontSize: 12,
            color: "#72d9ff",
            fontFamily: "ui-monospace, monospace",
            letterSpacing: "0.04em"
          }}
        >
          {period}
        </span>
      </div>
      <p
        style={{
          margin: "4px 0 10px",
          color: "var(--muted)",
          fontSize: 14,
          fontStyle: "italic"
        }}
      >
        {org}
      </p>
      <ul
        style={{
          margin: 0,
          paddingLeft: 18,
          color: "var(--muted)",
          lineHeight: 1.65
        }}
      >
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </article>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <>
      <span
        aria-hidden
        style={{
          display: "grid",
          placeItems: "center",
          width: 36,
          height: 36,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(255,255,255,0.04)",
          color: "#72d9ff",
          flexShrink: 0
        }}
      >
        {icon}
      </span>
      <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--muted)"
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 13,
            color: "var(--ink)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {value}
        </span>
      </span>
    </>
  );
  const commonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 12
  };
  if (!href) {
    return <li style={commonStyle}>{body}</li>;
  }
  return (
    <li>
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        style={{ ...commonStyle, color: "inherit", textDecoration: "none" }}
      >
        {body}
      </a>
    </li>
  );
}
