import { Hexagon } from "lucide-react";

// Logo MyHub: khung xếp chồng lục giác với accent brand.
// Dùng Lucide Hexagon để match tinh thần mock-up, không cần asset ngoài.
export function SidebarLogo() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <div className="grid place-items-center w-9 h-9 rounded-lg bg-brand text-white">
        <Hexagon size={20} strokeWidth={2} />
      </div>
      <span className="text-lg font-bold text-fg tracking-tight">MyHub</span>
    </div>
  );
}
