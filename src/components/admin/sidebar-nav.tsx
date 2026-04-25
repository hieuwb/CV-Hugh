"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FolderKanban,
  Wallet,
  CheckSquare,
  BarChart3,
  FileText,
  Settings,
  type LucideIcon
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const items: NavItem[] = [
  { href: "/admin", label: "Tổng quan", icon: LayoutGrid },
  { href: "/admin/projects", label: "Dự án", icon: FolderKanban },
  { href: "/admin/wallets", label: "Quản lý ví", icon: Wallet },
  { href: "/admin/airdrops", label: "Nhiệm vụ", icon: CheckSquare },
  { href: "/admin/stats", label: "Thống kê", icon: BarChart3 },
  { href: "/admin/notes", label: "Ghi chú", icon: FileText },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings }
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="px-3" aria-label="Điều hướng chính">
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-soft text-brand"
                    : "text-fg-muted hover:text-fg hover:bg-bg-muted"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
