import { SidebarLogo } from "./sidebar-logo";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";
import { SidebarUpgrade } from "./sidebar-upgrade";
import { ThemeToggle } from "./theme-toggle";

// Sidebar dọc 260px theo mock-up MyHub.
// Sticky full-height, tự scroll phần nav nếu tràn.
export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-[260px] shrink-0 border-r border-line bg-bg-sidebar sticky top-0 h-screen">
      <SidebarLogo />
      <div className="flex-1 overflow-y-auto py-2">
        <SidebarNav />
      </div>
      <div className="pb-3">
        <SidebarUser
          name="Hugh"
          email="hoangtung0910hn@gmail.com"
          initials="H"
        />
        <SidebarUpgrade />
        <ThemeToggle />
      </div>
    </aside>
  );
}
