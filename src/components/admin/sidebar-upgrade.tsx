import { Crown } from "lucide-react";

// Thẻ call-to-action "Nâng cấp Pro" trong sidebar.
// Phase 1 là placeholder, Phase sau có thể thay bằng banner billing thật.
export function SidebarUpgrade() {
  return (
    <div className="mx-3 mt-3 rounded-lg border border-brand/20 bg-brand-soft p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="grid place-items-center w-7 h-7 rounded-md bg-brand text-white">
          <Crown size={14} />
        </div>
        <p className="m-0 text-sm font-semibold text-fg">Nâng cấp Pro</p>
      </div>
      <p className="m-0 text-xs text-fg-muted leading-relaxed mb-3">
        Mở khoá tính năng nâng cao và sao lưu dữ liệu.
      </p>
      <button
        type="button"
        className="w-full rounded-md bg-brand text-white text-sm font-medium py-2 hover:bg-brand-hover transition-colors"
      >
        Nâng cấp ngay
      </button>
    </div>
  );
}
