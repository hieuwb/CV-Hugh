"use client";

import { useEffect, useRef, useState } from "react";

import {
  ALL_ARM_ANGLES,
  ALL_LANDMARKS,
  ARM_LENGTH,
  LANDMARKS,
  RING_CENTER_RADIUS,
  ROAD_WIDTH,
  ROUNDABOUT_RADIUS_INNER,
  ROUNDABOUT_RADIUS_OUTER
} from "@/lib/game-content";
import { BENCH_POSITIONS } from "./scenery";

type Props = {
  positionRef: React.MutableRefObject<[number, number]>;
  /** World units tương ứng với 1 cạnh viewport minimap */
  mapRange?: number;
};

// ---------------------------------------------------------------------
// Mini map SVG ở góc trên phải. Cập nhật 30fps qua rAF — không re-render
// React hay lần (chỉ re-render khi position thay đổi đáng kể).
// Landmark chính + contact stops + project pillars + benches đều hiển thị.
// ---------------------------------------------------------------------

const VIEWPORT = 160; // px
const MARGIN = 6;

export function MiniMap({ positionRef, mapRange = 280 }: Props) {
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const lastUpdate = useRef(0);
  const rafId = useRef(0);

  useEffect(() => {
    function tick(t: number) {
      if (t - lastUpdate.current > 33) {
        lastUpdate.current = t;
        const [x, z] = positionRef.current;
        setPos((prev) =>
          Math.abs(prev[0] - x) > 0.2 || Math.abs(prev[1] - z) > 0.2
            ? [x, z]
            : prev
        );
      }
      rafId.current = requestAnimationFrame(tick);
    }
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [positionRef]);

  const half = mapRange / 2;
  // Convert world coords to [-VIEWPORT/2, VIEWPORT/2]
  const scale = (VIEWPORT - MARGIN * 2) / mapRange;

  const toPx = (x: number, z: number) => ({
    cx: x * scale,
    cy: z * scale
  });

  const inBounds = (x: number, z: number) =>
    Math.abs(x) <= half && Math.abs(z) <= half;

  return (
    <div
      className="fixed top-20 right-4 md:top-24 md:right-6 z-20 pointer-events-none"
      style={{
        width: VIEWPORT,
        height: VIEWPORT
      }}
    >
      <div
        className="relative w-full h-full rounded-2xl border border-white/20 backdrop-blur-sm overflow-hidden"
        style={{
          background: "rgba(26, 11, 46, 0.55)"
        }}
      >
        <svg
          viewBox={`-${VIEWPORT / 2} -${VIEWPORT / 2} ${VIEWPORT} ${VIEWPORT}`}
          className="absolute inset-0"
        >
          {/* Terrain disc (bờ map) */}
          <circle
            cx={0}
            cy={0}
            r={150 * scale}
            fill="rgba(58, 22, 40, 0.55)"
            stroke="rgba(255, 212, 121, 0.3)"
            strokeWidth={0.5}
          />

          {/* Ring road lớn bao quanh 6 endpoint */}
          <circle
            cx={0}
            cy={0}
            r={RING_CENTER_RADIUS * scale}
            fill="none"
            stroke="rgba(70, 64, 72, 0.9)"
            strokeWidth={ROAD_WIDTH * scale}
          />
          <circle
            cx={0}
            cy={0}
            r={RING_CENTER_RADIUS * scale}
            fill="none"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth={0.5}
            strokeDasharray="2 2"
          />

          {/* 6 radial roads */}
          {ALL_ARM_ANGLES.map((angleDeg) => {
            const rad = (angleDeg * Math.PI) / 180;
            const cosA = Math.cos(rad);
            const sinA = -Math.sin(rad);
            const rStart = ROUNDABOUT_RADIUS_OUTER;
            const rEnd = ROUNDABOUT_RADIUS_OUTER + ARM_LENGTH;
            const x1 = cosA * rStart * scale;
            const y1 = sinA * rStart * scale;
            const x2 = cosA * rEnd * scale;
            const y2 = sinA * rEnd * scale;
            return (
              <line
                key={`road-${angleDeg}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(70, 64, 72, 0.9)"
                strokeWidth={ROAD_WIDTH * scale}
                strokeLinecap="round"
              />
            );
          })}

          {/* Roundabout ring asphalt */}
          <circle
            cx={0}
            cy={0}
            r={ROUNDABOUT_RADIUS_OUTER * scale}
            fill="rgba(46, 42, 46, 0.75)"
            stroke="rgba(255, 212, 121, 0.7)"
            strokeWidth={0.6}
          />
          {/* Pedestal inner (statue center) */}
          <circle
            cx={0}
            cy={0}
            r={ROUNDABOUT_RADIUS_INNER * scale}
            fill="#48212e"
            stroke="rgba(255, 212, 121, 0.8)"
            strokeWidth={0.4}
          />
          {/* Statue marker — icon ngôi sao nhỏ ở tâm */}
          <text
            x={0}
            y={1.2}
            textAnchor="middle"
            fontSize={6}
            fill="#ffd479"
            fontWeight="700"
          >
            ★
          </text>

          {/* Benches: chấm nhỏ xám */}
          {BENCH_POSITIONS.filter(([x, z]) => inBounds(x, z)).map(([x, z], i) => {
            const p = toPx(x, z);
            return (
              <rect
                key={`b-${i}`}
                x={p.cx - 1}
                y={p.cy - 0.5}
                width={2}
                height={1}
                fill="#8b5a2b"
              />
            );
          })}

          {/* Tất cả landmarks: chấm màu theo accent */}
          {ALL_LANDMARKS.filter((l) => inBounds(l.position[0], l.position[1])).map(
            (l) => {
              const p = toPx(l.position[0], l.position[1]);
              const isMain = LANDMARKS.some((m) => m.id === l.id);
              return (
                <circle
                  key={l.id}
                  cx={p.cx}
                  cy={p.cy}
                  r={isMain ? 2.2 : 1.4}
                  fill={l.accent}
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth={0.3}
                />
              );
            }
          )}

          {/* Player car: chấm đỏ với outer ring */}
          {(() => {
            const clamped: [number, number] = [
              Math.max(-half + 4, Math.min(half - 4, pos[0])),
              Math.max(-half + 4, Math.min(half - 4, pos[1]))
            ];
            const p = toPx(clamped[0], clamped[1]);
            const outOfBounds =
              clamped[0] !== pos[0] || clamped[1] !== pos[1];
            return (
              <>
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={5}
                  fill="none"
                  stroke="#ff5c4a"
                  strokeWidth={1}
                  opacity={0.6}
                />
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={2.4}
                  fill={outOfBounds ? "#ffaa4a" : "#ff5c4a"}
                />
              </>
            );
          })()}
        </svg>

        <div className="absolute bottom-1 left-2 text-[9px] font-mono text-white/60 tracking-wider uppercase">
          MINI MAP
        </div>
      </div>
    </div>
  );
}
