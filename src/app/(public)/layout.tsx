import { ReactNode } from "react";

import { OceanShell } from "@/components/ocean-shell";

// Wrap các trang public (/projects, /cv) trong ocean theme + top header.
// Landing `/` ở src/app/page.tsx tự wrap OceanShell riêng vì nằm ngoài route-group.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return <OceanShell>{children}</OceanShell>;
}
