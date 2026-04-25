import { ComingSoonPanel } from "@/components/admin/coming-soon-panel";

export default function AdminProjectsPage() {
  return (
    <>
      <h1 className="m-0 text-3xl font-bold text-fg tracking-tight mb-6">Dự án</h1>
      <ComingSoonPanel
        title="Quản lý dự án"
        description="Thêm thẻ dự án kèm tagline / gallery / link demo / GitHub. Có ở Phase 2."
        tables={["projects"]}
      />
    </>
  );
}
