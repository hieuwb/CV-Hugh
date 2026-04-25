export const metadata = { title: "Dự án · Ocean CV" };

export default function ProjectsPage() {
  return (
    <main className="container" style={{ paddingBottom: 48 }}>
      <section className="glass" style={{ padding: 24, marginTop: 16 }}>
        <p
          style={{ margin: 0, color: "var(--muted)", letterSpacing: "0.2em", fontSize: 12 }}
        >
          PORTFOLIO
        </p>
        <h1 style={{ marginTop: 8 }}>Dự án</h1>
        <p style={{ color: "var(--muted)", marginTop: 6, maxWidth: 620 }}>
          Các dự án hackathon và dapp sẽ xuất hiện tại đây khi Phase 3 hoàn tất.
          Nguồn dữ liệu lấy từ bảng <code>projects</code> lọc{" "}
          <code>is_public = true</code>.
        </p>
      </section>
    </main>
  );
}
