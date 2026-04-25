"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

// SceneLoadingOverlay — hiển thị tiến trình tải GLB/texture của scene.
// Khi useProgress.active=false và progress>=100, fade-out rồi unmount.
export function SceneLoadingOverlay() {
  const { progress, active, loaded, total } = useProgress();
  const [hidden, setHidden] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!active && progress >= 100 && !fading) {
      const fadeT = setTimeout(() => setFading(true), 200);
      const hideT = setTimeout(() => setHidden(true), 900);
      return () => {
        clearTimeout(fadeT);
        clearTimeout(hideT);
      };
    }
  }, [active, progress, fading]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] grid place-items-center bg-[#0a0518] transition-opacity duration-700 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ backdropFilter: "blur(0px)" }}
    >
      <div className="flex flex-col items-center gap-7 px-6">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[#ffb040] animate-pulse" />
          <span className="font-mono text-[11px] tracking-[0.4em] text-white/60 uppercase">
            Hugh&apos;s World
          </span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-light text-white tracking-[0.15em] uppercase">
            Đang tải thế giới
          </h1>
          <p className="mt-3 text-xs md:text-sm text-white/45 tracking-wider">
            Lái xe khám phá CV tương tác của Hugh
          </p>
        </div>

        <div className="w-72 md:w-96">
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ff7030] via-[#ff9040] to-[#ffd479] transition-[width] duration-300"
              style={{ width: `${Math.max(2, progress)}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between font-mono text-[10px] md:text-[11px] text-white/45 tracking-wider">
            <span>{Math.floor(progress)}%</span>
            <span>
              {loaded}/{total} assets
            </span>
          </div>
        </div>

        <div className="text-[10px] text-white/30 tracking-widest uppercase">
          ✦ low-poly · night drive ✦
        </div>
      </div>
    </div>
  );
}
