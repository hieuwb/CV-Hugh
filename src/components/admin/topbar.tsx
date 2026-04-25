import { Bell, Calendar } from "lucide-react";

type Props = {
  title: string;
  welcomeName: string;
  subtitle?: string;
  dateRangeLabel?: string;
  notificationCount?: number;
};

// Top bar cho mỗi page admin:
// - Tiêu đề + lời chào + phụ đề ở trái
// - Date range picker + chuông thông báo + avatar ở phải
export function Topbar({
  title,
  welcomeName,
  subtitle,
  dateRangeLabel,
  notificationCount = 0
}: Props) {
  return (
    <header className="flex flex-wrap items-start gap-6 justify-between mb-8">
      <div className="min-w-0">
        <h1 className="m-0 text-3xl font-bold text-fg tracking-tight">{title}</h1>
        <p className="mt-2 mb-0 text-base text-fg">
          Chào mừng trở lại, <span className="font-semibold">{welcomeName}!</span>{" "}
          <span aria-hidden>👋</span>
        </p>
        {subtitle ? (
          <p className="mt-1 mb-0 text-sm text-fg-muted">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        {dateRangeLabel ? (
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-lg border border-line bg-bg-surface px-3.5 py-2.5 text-sm text-fg hover:border-fg-soft transition-colors"
          >
            <Calendar size={16} className="text-fg-muted" />
            <span>{dateRangeLabel}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
        ) : null}

        <button
          type="button"
          className="relative grid place-items-center w-10 h-10 rounded-lg border border-line bg-bg-surface text-fg-muted hover:text-fg transition-colors"
          aria-label="Thông báo"
        >
          <Bell size={18} />
          {notificationCount > 0 ? (
            <span className="absolute -top-1 -right-1 grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent-rose text-white text-[10px] font-semibold">
              {notificationCount}
            </span>
          ) : null}
        </button>

        <div
          className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-indigo to-accent-violet grid place-items-center text-white font-semibold"
          aria-label="Avatar người dùng"
        >
          H
        </div>
      </div>
    </header>
  );
}
