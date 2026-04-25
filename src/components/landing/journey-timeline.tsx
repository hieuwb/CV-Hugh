import { Reveal } from "./reveal";

type Milestone = {
  period: string;
  title: string;
  sub?: string;
  tag: "edu" | "civil" | "pivot" | "web3" | "ai";
};

const TAG_COLOR: Record<Milestone["tag"], string> = {
  edu: "bg-white/10 text-white/70",
  civil: "bg-[#f4c26b]/15 text-[#f4c26b]",
  pivot: "bg-[#ef6e54]/15 text-[#ef6e54]",
  web3: "bg-[#72d9ff]/15 text-[#72d9ff]",
  ai: "bg-[#b388ff]/15 text-[#b388ff]"
};
const TAG_LABEL: Record<Milestone["tag"], string> = {
  edu: "Học vấn",
  civil: "Xây dựng",
  pivot: "Chuyển hướng",
  web3: "Web3",
  ai: "AI"
};

const MILESTONES: Milestone[] = [
  {
    period: "10/2016 – 04/2021",
    title: "ĐH Kinh Tế – Kỹ Thuật Bình Dương",
    sub: "Kỹ thuật Xây dựng · GPA Khá 2.53/2.66 · Ban chuyên môn CLB SV khoa Xây dựng",
    tag: "edu"
  },
  {
    period: "04/2021 – 01/2025",
    title: "Kỹ sư Xây dựng @ Công ty TNHH Vận Tải Đại Nam",
    sub: "Thiết kế & chỉnh sửa bản vẽ kỹ thuật · Biện pháp thi công · Hồ sơ chất lượng · Bóc khối lượng quyết toán.",
    tag: "civil"
  },
  {
    period: "08/2021 – 01/2025",
    title: "Shop drawing — Novaworld Hồ Tràm (Novaland)",
    sub: "Bổ nhiệm làm shop drawing, rồi mở rộng sang hồ sơ chất lượng và quyết toán. Học được rất nhiều từ sân bay trực thăng và đắp đê chắn sóng.",
    tag: "civil"
  },
  {
    period: "2023",
    title: "Viết Lisp tự động hoá AutoCAD → yêu code lúc nào không hay",
    sub: "Mấy dòng Lisp đầu tiên để đỡ vẽ tay → sa đà vào lập trình → chạm Web3.",
    tag: "pivot"
  },
  {
    period: "2024 – nay",
    title: "Web3 developer · Independent builder",
    sub: "Ship dApp, bot trading, tool farming airdrop. Viem/Wagmi, Next.js 14, Supabase, Solidity cơ bản.",
    tag: "web3"
  },
  {
    period: "2025 – nay",
    title: "AI × AutoCAD: ra lệnh bằng prompt",
    sub: "Nghiên cứu dùng AI tự động hoá thao tác bản vẽ xây dựng — ghim tọa độ, dim kích thước, tính khối lượng.",
    tag: "ai"
  }
];

export function JourneyTimeline() {
  return (
    <section className="relative px-6 md:px-12 lg:px-20 py-20 md:py-28 border-t border-[var(--land-line)]">
      <Reveal>
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--land-muted)] mb-4">
          Hành trình
        </p>
      </Reveal>
      <Reveal delay={60}>
        <h2 className="m-0 text-3xl md:text-4xl font-bold max-w-3xl">
          Mười năm, hai ngành, một người.
        </h2>
      </Reveal>

      <ol className="mt-12 landing-timeline pl-7 md:pl-10 max-w-4xl flex flex-col gap-8">
        {MILESTONES.map((m, i) => (
          <Reveal as="li" key={`${m.period}-${m.title}`} delay={80 + i * 60}>
            <div className="relative">
              {/* Dot on rail */}
              <span
                className="absolute -left-7 md:-left-10 top-1.5 w-4 h-4 rounded-full border-2 border-[var(--land-bg)] bg-[var(--land-accent)]"
                aria-hidden
              />
              <div className="flex flex-wrap items-center gap-3 mb-1.5">
                <span
                  className={`text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full ${TAG_COLOR[m.tag]}`}
                >
                  {TAG_LABEL[m.tag]}
                </span>
                <span className="text-xs md:text-sm text-[var(--land-muted)] font-mono">
                  {m.period}
                </span>
              </div>
              <h3 className="m-0 text-lg md:text-xl font-semibold">{m.title}</h3>
              {m.sub ? (
                <p className="mt-1.5 mb-0 text-[var(--land-muted)] leading-relaxed text-sm md:text-base max-w-2xl">
                  {m.sub}
                </p>
              ) : null}
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
