"use client";

import { useEffect, useRef } from "react";

type Props = {
  onChange: (x: number, y: number) => void;
};

// Joystick ảo hình tròn, bật hiển thị khi thiết bị cảm ứng.
// Luôn được render nhưng CSS pointer-events:none nếu non-touch.
export function TouchJoystick({ onChange }: Props) {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const base = baseRef.current;
    const knob = knobRef.current;
    if (!base || !knob) return;

    let active = false;
    let rect: DOMRect | null = null;
    const radius = 44;

    function setKnob(dx: number, dy: number) {
      const d = Math.hypot(dx, dy);
      const clamp = Math.min(1, d / radius);
      const cx = (dx / Math.max(d, 1)) * clamp * radius;
      const cy = (dy / Math.max(d, 1)) * clamp * radius;
      if (!knob) return;
      knob.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      // Trả về (-1..1) — y lên trên = -1 (xe chạy tới)
      onChange(clamp * (dx / Math.max(d, 1)) || 0, clamp * (dy / Math.max(d, 1)) || 0);
    }

    function reset() {
      if (!knob) return;
      knob.style.transform = "translate3d(0,0,0)";
      onChange(0, 0);
    }

    function onStart(e: TouchEvent) {
      if (!base) return;
      active = true;
      rect = base.getBoundingClientRect();
      const t = e.touches[0];
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setKnob(t.clientX - cx, t.clientY - cy);
    }
    function onMove(e: TouchEvent) {
      if (!active || !rect) return;
      const t = e.touches[0];
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setKnob(t.clientX - cx, t.clientY - cy);
      e.preventDefault();
    }
    function onEnd() {
      active = false;
      reset();
    }

    base.addEventListener("touchstart", onStart, { passive: false });
    base.addEventListener("touchmove", onMove, { passive: false });
    base.addEventListener("touchend", onEnd);
    base.addEventListener("touchcancel", onEnd);

    return () => {
      base.removeEventListener("touchstart", onStart);
      base.removeEventListener("touchmove", onMove);
      base.removeEventListener("touchend", onEnd);
      base.removeEventListener("touchcancel", onEnd);
    };
  }, [onChange]);

  return (
    <div
      ref={baseRef}
      aria-hidden
      className="game-joystick fixed bottom-6 left-6 w-28 h-28 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm z-20 grid place-items-center touch-none select-none md:hidden"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div
        ref={knobRef}
        className="w-12 h-12 rounded-full bg-[#f4c26b]/80 shadow-lg"
      />
    </div>
  );
}
