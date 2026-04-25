"use client";

import { Sun, Moon } from "lucide-react";
import { useState } from "react";

// Phase 1: chỉ demo UI — click đổi icon/label.
// Phase sau sẽ nối với next-themes để thực sự toggle `.dark` class.
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setDark((v) => !v)}
      className="mx-3 mt-3 mb-4 flex items-center justify-between rounded-md border border-line bg-bg-surface px-3 py-2.5 text-sm text-fg-muted hover:text-fg transition-colors"
    >
      <span>{dark ? "Chế độ tối" : "Chế độ sáng"}</span>
      <span className="grid place-items-center w-6 h-6 rounded-md text-fg-soft">
        {dark ? <Moon size={14} /> : <Sun size={14} />}
      </span>
    </button>
  );
}
