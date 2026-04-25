import { ComingSoonPanel } from "@/components/admin/coming-soon-panel";

export default function AdminStatsPage() {
  return (
    <>
      <h1 className="m-0 text-3xl font-bold text-fg tracking-tight mb-6">Thống kê</h1>
      <ComingSoonPanel
        title="Biểu đồ tổng hợp"
        description="Net worth theo ngày, phân bổ tài sản theo chain, ROI airdrop, tỉ lệ hoàn thành task — có ở Phase 3 khi đã có dữ liệu thật."
      />
    </>
  );
}
