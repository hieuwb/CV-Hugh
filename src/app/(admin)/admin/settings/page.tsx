import { ComingSoonPanel } from "@/components/admin/coming-soon-panel";

export default function AdminSettingsPage() {
  return (
    <>
      <h1 className="m-0 text-3xl font-bold text-fg tracking-tight mb-6">Cài đặt</h1>
      <ComingSoonPanel
        title="Cài đặt tài khoản"
        description="Đổi master password, quản lý email allowlist, xem log đăng nhập, rotate API key. Có ở Phase 2 & 4."
        tables={["user_vault", "admin_users"]}
      />
    </>
  );
}
