import { ComingSoonPanel } from "@/components/admin/coming-soon-panel";

export default function AdminHackathonsPage() {
  return (
    <>
      <h1 className="m-0 text-3xl font-bold text-fg tracking-tight mb-6">Hackathon</h1>
      <ComingSoonPanel
        title="Quản lý hackathon"
        description="Theo dõi sự kiện, thành viên team, prize và dự án liên quan. Có ở Phase 2."
        tables={["hackathons"]}
      />
    </>
  );
}
