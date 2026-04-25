import { ComingSoonPanel } from "@/components/admin/coming-soon-panel";

export default function AdminNotesPage() {
  return (
    <>
      <h1 className="m-0 text-3xl font-bold text-fg tracking-tight mb-6">Ghi chú</h1>
      <ComingSoonPanel
        title="Ghi chú tự do"
        description="Markdown nhẹ, gắn tag, tìm kiếm nhanh. Dự kiến lên ở Phase 3."
      />
    </>
  );
}
