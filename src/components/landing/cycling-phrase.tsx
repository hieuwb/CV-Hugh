"use client";

import { useEffect, useState } from "react";

type Props = {
  phrases: string[];
  interval?: number;   // ms giữa các lần đổi
};

// Hiển thị 1 cụm từ tại 1 thời điểm, xoay vòng. Mỗi lần đổi, key thay đổi →
// component re-mount với animation landing-cycle-in.
// Rất gọn nhẹ: không dùng library, không layout shift vì width theo chữ.
export function CyclingPhrase({ phrases, interval = 2400 }: Props) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (phrases.length <= 1) return;
    const t = setInterval(() => {
      setI((prev) => (prev + 1) % phrases.length);
    }, interval);
    return () => clearInterval(t);
  }, [phrases.length, interval]);

  const current = phrases[i] ?? "";

  return (
    <span className="landing-cycle" aria-live="polite">
      <span key={i} className="landing-cycle-word">
        {current}
      </span>
    </span>
  );
}
