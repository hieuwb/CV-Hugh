import { ComingSoonPanel } from "@/components/admin/coming-soon-panel";

export default function AdminAirdropsPage() {
  return (
    <>
      <h1 className="m-0 text-3xl font-bold text-fg tracking-tight mb-6">Nhiệm vụ</h1>
      <ComingSoonPanel
        title="Danh sách airdrop"
        description="Thêm / sửa / gắn thẻ theo chain / đánh dấu đã claim / theo dõi ROI sẽ có ở Phase 2."
        tables={["airdrops", "airdrop_tasks"]}
      />
    </>
  );
}
