import { CheckCircle2, FolderKanban, PieChart, Wallet } from "lucide-react";

import { KpiCard } from "@/components/admin/kpi-card";
import { InProgressList, CompletedList } from "@/components/admin/project-list";
import { Topbar } from "@/components/admin/topbar";
import { WalletTable } from "@/components/admin/wallet-table";
import {
  mockKpis,
  mockInProgress,
  mockCompleted,
  mockWallets,
  mockPaginationTotal
} from "@/lib/mock/dashboard";

export const metadata = { title: "Tổng quan · MyHub" };

export default function AdminOverviewPage() {
  return (
    <>
      <Topbar
        title="Dashboard"
        welcomeName="Hugh"
        subtitle="Tổng quan nhanh về công việc và tài sản của bạn."
        dateRangeLabel="12/05/2024 - 18/05/2024"
        notificationCount={3}
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <KpiCard
          label="Dự án đang làm"
          value={String(mockKpis.inProgress.value)}
          hint={mockKpis.inProgress.hint}
          icon={FolderKanban}
          accent="indigo"
          sparkline={mockKpis.inProgress.sparkline}
        />
        <KpiCard
          label="Dự án hoàn thành"
          value={String(mockKpis.completed.value)}
          hint={mockKpis.completed.hint}
          icon={CheckCircle2}
          accent="green"
          sparkline={mockKpis.completed.sparkline}
        />
        <KpiCard
          label="Tổng số ví"
          value={String(mockKpis.wallets.value)}
          hint={mockKpis.wallets.hint}
          icon={Wallet}
          accent="amber"
          sparkline={mockKpis.wallets.sparkline}
          trendIcon={false}
        />
        <KpiCard
          label="Tổng giá trị (USD)"
          value={mockKpis.totalUsd.value}
          hint={mockKpis.totalUsd.hint}
          icon={PieChart}
          accent="violet"
          sparkline={mockKpis.totalUsd.sparkline}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2 mb-6">
        <InProgressList items={mockInProgress} />
        <CompletedList items={mockCompleted} />
      </section>

      <WalletTable
        items={mockWallets}
        total={mockPaginationTotal}
        page={1}
        pageCount={4}
        perPage={10}
      />
    </>
  );
}
