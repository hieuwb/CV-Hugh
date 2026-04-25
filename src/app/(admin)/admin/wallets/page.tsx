import { ComingSoonPanel } from "@/components/admin/coming-soon-panel";

export default function AdminWalletsPage() {
  return (
    <>
      <h1 className="m-0 text-3xl font-bold text-fg tracking-tight mb-6">Quản lý ví</h1>
      <ComingSoonPanel
        title="Module quản lý ví"
        description="Kết nối Rabby/MetaMask, burner mã hoá an toàn, theo dõi token, gom token & rải gas — lên ở Phase 4. Xem dashboard-wallet-plan.md."
        tables={["wallets", "user_vault", "wallet_balances", "wallet_operations"]}
      />
    </>
  );
}
