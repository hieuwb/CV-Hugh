import Link from "next/link";
import { ReactNode } from "react";

// Shell cho các trang public (landing / projects / cv).
// Gói toàn bộ nội dung trong wrapper `.theme-ocean` để CSS legacy hoạt động.
// Admin có layout riêng (sidebar) nên không dùng shell này.
export function OceanShell({ children }: { children: ReactNode }) {
  return (
    <div className="theme-ocean">
      <header style={{ position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(10px)" }}>
        <div
          className="container"
          style={{ display: "flex", justifyContent: "space-between", padding: "18px 0" }}
        >
          <Link href="/" style={{ fontWeight: 700, letterSpacing: "0.4px" }}>
            Ocean CV
          </Link>
          <nav style={{ display: "flex", gap: 10 }} aria-label="Điều hướng chính">
            <Link className="chip" href="/#gioi-thieu">
              Giới thiệu
            </Link>
            <Link className="chip" href="/projects">
              Dự án
            </Link>
            <Link className="chip" href="/cv">
              CV
            </Link>
            <Link className="chip" href="/admin">
              Bảng điều khiển
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
