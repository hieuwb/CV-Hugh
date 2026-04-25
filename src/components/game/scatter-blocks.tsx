"use client";

import { useMemo } from "react";
import {
  BoxGeometry,
  Euler,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3
} from "three";

// ---------------------------------------------------------------------
// Low-poly white/cream blocks rải khắp map — vibe folio-2019 của Bruno.
// Dùng InstancedMesh 1 draw call cho tất cả, không lighting nặng, không
// shader. Scatter bằng PRNG seed cố định để stable.
// ---------------------------------------------------------------------

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function ScatterBlocks({
  excludes = []
}: {
  excludes?: [number, number][];
}) {
  const { matrices, geometry, material } = useMemo(() => {
    const rand = mulberry32(20260424);
    const mats: Matrix4[] = [];

    // Rải 2 vành: vành gần (r 20-55) và vành xa (r 60-130).
    // Mỗi vị trí có thể là cluster 2-5 block cao thấp khác nhau.
    function placeCluster(cx: number, cz: number) {
      const blocks = 2 + Math.floor(rand() * 4);
      for (let i = 0; i < blocks; i++) {
        const ox = cx + (rand() - 0.5) * 2.4;
        const oz = cz + (rand() - 0.5) * 2.4;
        const w = 0.8 + rand() * 1.4;
        const d = 0.8 + rand() * 1.4;
        const h = 0.4 + rand() * 2.4;
        const rotY = Math.floor(rand() * 4) * (Math.PI / 2);
        mats.push(
          new Matrix4().compose(
            new Vector3(ox, h / 2, oz),
            new Quaternion().setFromEuler(new Euler(0, rotY, 0)),
            new Vector3(w, h, d)
          )
        );
      }
    }

    // Vành gần
    for (let i = 0; i < 80; i++) {
      const a = rand() * Math.PI * 2;
      const r = 20 + rand() * 35;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (!isFarFrom([x, z], excludes, 5)) continue;
      placeCluster(x, z);
    }
    // Vành xa
    for (let i = 0; i < 120; i++) {
      const a = rand() * Math.PI * 2;
      const r = 60 + rand() * 70;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (!isFarFrom([x, z], excludes, 4)) continue;
      placeCluster(x, z);
    }
    // Rải 2 bên đường liên hệ (|x| ∈ [10, 30], z ∈ [-60, -140])
    for (let i = 0; i < 60; i++) {
      const side = rand() > 0.5 ? 1 : -1;
      const x = side * (10 + rand() * 20);
      const z = -60 - rand() * 80;
      if (!isFarFrom([x, z], excludes, 4)) continue;
      placeCluster(x, z);
    }

    return {
      matrices: mats,
      geometry: new BoxGeometry(1, 1, 1),
      material: new MeshStandardMaterial({
        color: "#fbf2e4",
        roughness: 0.95,
        flatShading: true
      })
    };
  }, [excludes]);

  return (
    <instancedMesh
      args={[geometry, material, matrices.length]}
      castShadow
      receiveShadow
      onUpdate={(m) => {
        matrices.forEach((mat, i) => m.setMatrixAt(i, mat));
        m.instanceMatrix.needsUpdate = true;
      }}
    />
  );
}

function isFarFrom(
  p: [number, number],
  excludes: [number, number][],
  minDist: number
) {
  for (const [ex, ez] of excludes) {
    if (Math.hypot(p[0] - ex, p[1] - ez) < minDist) return false;
  }
  return true;
}
