import { ComingSoonPanel } from "@/components/admin/coming-soon-panel";

export default function AdminCvPage() {
  return (
    <>
      <h1 className="m-0 text-3xl font-bold text-fg tracking-tight mb-6">Mục trong CV</h1>
      <ComingSoonPanel
        title="Trình soạn CV kéo-thả"
        description="Chỉnh sửa intro / kinh nghiệm / kỹ năng / liên hệ, kèm preview PDF. Có ở Phase 2."
        tables={["cv_sections"]}
      />
    </>
  );
}
