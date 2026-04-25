"use client";

import { Download } from "lucide-react";

// Trang CV chưa có endpoint render PDF bằng @react-pdf/renderer (lên ở Phase 3).
// Trong lúc chờ, nút này dùng window.print() — trình duyệt xuất ra PDF đủ tốt
// nhờ @media print trong globals.css đã ẩn nav + chuyển ocean về nền trắng.
export function PrintButton() {
  return (
    <button type="button" className="btn primary" onClick={() => window.print()}>
      <Download size={16} />
      Tải CV (PDF)
    </button>
  );
}
