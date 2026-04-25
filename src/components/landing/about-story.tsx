import { Reveal } from "./reveal";

export function AboutStory() {
  return (
    <section className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32">
      <Reveal>
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--land-muted)] mb-4">
          Về mình
        </p>
      </Reveal>

      <Reveal delay={80}>
        <h2 className="m-0 text-3xl md:text-5xl font-bold leading-tight max-w-3xl">
          Từ công trường Hồ Tràm
          <br />
          đến deployment trên{" "}
          <span className="text-[var(--land-accent-2)]">on-chain</span>.
        </h2>
      </Reveal>

      <div className="mt-10 md:mt-14 grid gap-10 md:gap-16 md:grid-cols-2 max-w-5xl">
        <Reveal delay={120}>
          <p className="text-[var(--land-ink)]/80 leading-relaxed text-base md:text-lg">
            Tốt nghiệp kỹ thuật xây dựng 2021 ở ĐH Kinh Tế &mdash; Kỹ Thuật Bình
            Dương. Bốn năm kế tiếp mình làm kỹ sư shop drawing &amp; hồ sơ
            chất lượng cho{" "}
            <span className="text-[var(--land-accent)] font-semibold">
              Novaworld Hồ Tràm
            </span>{" "}
            &mdash; khu nghỉ dưỡng lớn của Novaland. Vẽ biện pháp thi công,
            bóc khối lượng, giám sát hiện trường, viết Lisp tự động hoá AutoCAD
            cho đỡ cực.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <p className="text-[var(--land-ink)]/80 leading-relaxed text-base md:text-lg">
            COVID 2023 là cột mốc. Mấy dòng Lisp dẫn mình tới lập trình thật sự,
            rồi chạm Web3 &mdash; và thế là không dừng lại được. Hiện mình build
            dApp, bot trading, tool farming airdrop, và đang nghiên cứu cách dùng
            AI để{" "}
            <span className="text-[var(--land-accent)] font-semibold">
              ra lệnh trực tiếp cho AutoCAD
            </span>{" "}
            &mdash; ghim tọa độ, dim kích thước, tính khối lượng bằng prompt.
            Nửa xây dựng nửa crypto, vibe-coding là trung điểm.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
