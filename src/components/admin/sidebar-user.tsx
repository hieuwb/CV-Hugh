import { MoreVertical } from "lucide-react";

type Props = {
  name: string;
  email: string;
  initials?: string;
};

// Card user ở cuối sidebar — avatar chữ cái đầu, tên, email, nút 3-dot.
// Avatar dùng initials thay vì <Image> để khỏi phụ thuộc asset ngoài Phase 1.
export function SidebarUser({ name, email, initials }: Props) {
  const shortInitials = initials ?? name.slice(0, 1).toUpperCase();
  return (
    <div className="mx-3 rounded-lg border border-line bg-bg-surface p-3 flex items-center gap-3">
      <div className="grid place-items-center w-10 h-10 rounded-full bg-brand text-white font-semibold text-sm">
        {shortInitials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-semibold text-fg truncate">{name}</p>
        <p className="m-0 text-xs text-fg-muted truncate">{email}</p>
      </div>
      <button
        type="button"
        className="grid place-items-center w-8 h-8 rounded-md text-fg-soft hover:text-fg hover:bg-bg-muted transition-colors"
        aria-label="Mở menu người dùng"
      >
        <MoreVertical size={16} />
      </button>
    </div>
  );
}
