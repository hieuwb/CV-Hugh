"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, PointsMaterial } from "three";

// Bụi vàng lơ lửng trong ánh hoàng hôn — 200 điểm, additive blend,
// di chuyển rất chậm để tạo cảm giác không khí. Mỗi frame cập nhật y dựa
// trên sin wave → fake float.
export function Dust() {
  const points = useRef<Points | null>(null);
  const COUNT = 220;
  const { geometry, basePositions, phases } = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const base = new Float32Array(COUNT);
    const ph = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.random() * 42;
      const y = 0.5 + Math.random() * 12;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * r;
      base[i] = y;
      ph[i] = Math.random() * Math.PI * 2;
    }
    g.setAttribute("position", new BufferAttribute(pos, 3));
    return { geometry: g, basePositions: base, phases: ph };
  }, []);

  const material = useMemo(
    () =>
      new PointsMaterial({
        color: "#ffd38a",
        size: 0.12,
        transparent: true,
        opacity: 0.8,
        blending: AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
        toneMapped: false
      }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pts = points.current;
    if (!pts) return;
    const posAttr = pts.geometry.getAttribute("position") as BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < basePositions.length; i++) {
      arr[i * 3 + 1] = basePositions[i] + Math.sin(t * 0.35 + phases[i]) * 0.45;
    }
    posAttr.needsUpdate = true;
  });

  return <points ref={points} geometry={geometry} material={material} />;
}

// Đom đóm nhỏ xoay quanh từng landmark — cheap: chỉ 1 mesh per firefly,
// position tính trong shader hoặc frame callback.
export function Fireflies({
  center,
  accent
}: {
  center: [number, number];
  accent: string;
}) {
  const group = useRef<Points | null>(null);
  const N = 14;
  const { geo, phases } = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new Float32Array(N * 3);
    const ph = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      ph[i] = Math.random() * Math.PI * 2;
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
    }
    g.setAttribute("position", new BufferAttribute(pos, 3));
    return { geo: g, phases: ph };
  }, []);

  const mat = useMemo(
    () =>
      new PointsMaterial({
        color: accent,
        size: 0.22,
        transparent: true,
        opacity: 1,
        blending: AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
        toneMapped: false
      }),
    [accent]
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    const posAttr = g.geometry.getAttribute("position") as BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < N; i++) {
      const p = phases[i];
      const orbitR = 2 + Math.sin(t * 0.8 + p) * 0.6;
      arr[i * 3] = Math.cos(t * 0.6 + p) * orbitR;
      arr[i * 3 + 1] = 2 + Math.sin(t * 1.2 + p * 2) * 1.2;
      arr[i * 3 + 2] = Math.sin(t * 0.6 + p) * orbitR;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points
      ref={group}
      position={[center[0], 0, center[1]]}
      geometry={geo}
      material={mat}
    />
  );
}
