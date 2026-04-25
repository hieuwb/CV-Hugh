import { ReactNode } from "react";

import { Sidebar } from "@/components/admin/sidebar";

// Layout admin MyHub: sidebar trái 260px + main content bên phải nền light.
// Không dùng .theme-ocean — admin đi theo light theme mới.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg-app text-fg">
      <Sidebar />
      <main className="flex-1 min-w-0 px-6 md:px-10 py-8">{children}</main>
    </div>
  );
}
