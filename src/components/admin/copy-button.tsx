"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

// Nút copy địa chỉ ví. Auto-reset icon về Copy sau 1.5s.
export function CopyButton({ value, label = "Sao chép" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Không có clipboard API (SSR hoặc trình duyệt cũ) → bỏ qua.
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid place-items-center w-6 h-6 rounded text-fg-soft hover:text-brand transition-colors"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}
