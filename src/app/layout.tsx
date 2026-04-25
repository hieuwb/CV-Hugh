import type { Metadata } from "next";
import { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Ocean CV",
  description:
    "Trang cá nhân & bảng điều khiển riêng để theo dõi airdrop, hackathon và ví."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
