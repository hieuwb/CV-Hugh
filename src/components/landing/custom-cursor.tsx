"use client";

import { useEffect, useRef } from "react";

// Dot vàng nhỏ theo cursor — phóng to khi hover link/button/[data-cursor-link].
// Tự tắt trên màn cảm ứng (nhờ @media hover trong globals.css).
// Không dùng state React để tránh re-render mỗi lần chuột di chuyển — thao tác
// trực tiếp trên DOM ref cho mượt 60fps.
export function CustomCursor() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;

    function onMove(e: MouseEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
    }

    function tick() {
      // Lerp nhẹ để cursor hơi "trễ" một chút, cảm giác mềm.
      x += (targetX - x) * 0.25;
      y += (targetY - y) * 0.25;
      if (el) {
        el.style.transform = `translate3d(${x - 7}px, ${y - 7}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    }

    function isInteractive(node: EventTarget | null) {
      if (!(node instanceof Element)) return false;
      return !!node.closest("a, button, [data-cursor-link]");
    }

    function onOver(e: MouseEvent) {
      if (isInteractive(e.target)) el?.classList.add("is-link");
    }
    function onOut(e: MouseEvent) {
      if (isInteractive(e.target)) el?.classList.remove("is-link");
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return <div ref={ref} className="landing-cursor" aria-hidden />;
}
