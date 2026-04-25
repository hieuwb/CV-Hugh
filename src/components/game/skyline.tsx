"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Mesh, MeshStandardMaterial, type Object3D } from "three";

// ---------------------------------------------------------------------
// Skyline — 30+ Kenney City Kit buildings rải vòng ngoài (r=105-135)
// tạo cảm giác xa thấy thành phố. Đặt trên water plane → horizon city.
// ---------------------------------------------------------------------

const KC = "/models/kenney-city";
const BUILDING_VARIANTS = [
  "low-detail-building-a.glb",
  "low-detail-building-b.glb",
  "low-detail-building-c.glb",
  "low-detail-building-d.glb",
  "low-detail-building-e.glb",
  "low-detail-building-f.glb",
  "low-detail-building-g.glb",
  "low-detail-building-h.glb",
  "low-detail-building-i.glb",
  "low-detail-building-j.glb",
  "low-detail-building-wide-a.glb",
  "building-skyscraper-a.glb",
  "building-skyscraper-b.glb",
  "building-skyscraper-c.glb"
];

BUILDING_VARIANTS.forEach((v) => useGLTF.preload(`${KC}/${v}`));

function enhance(root: Object3D) {
  root.traverse((node) => {
    if ((node as Mesh).isMesh) {
      const m = node as Mesh;
      m.castShadow = false; // far skyline, skip shadow cost
      m.receiveShadow = false;
      if (m.material instanceof MeshStandardMaterial) {
        m.material.flatShading = true;
        m.material.needsUpdate = true;
      }
    }
  });
}

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Spot = {
  variant: string;
  x: number;
  z: number;
  rotY: number;
  scale: number;
};

function buildSpots(): Spot[] {
  const rand = mulberry32(7777);
  const out: Spot[] = [];
  const count = 24;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.12;
    // Push xa horizon (r>200) → buildings như silhouette không đè biển
    // Ở khoảng cách này + fog, chúng sẽ chỉ là bóng đen mờ.
    const r = 220 + rand() * 60; // 220–280
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const variantIdx = Math.floor(rand() * BUILDING_VARIANTS.length);
    out.push({
      variant: BUILDING_VARIANTS[variantIdx],
      x,
      z,
      rotY: angle + Math.PI / 2 + (rand() - 0.5) * 0.4,
      scale: 3.5 + rand() * 2.5 // bigger scale to compensate distance
    });
  }
  return out;
}

const SPOTS = buildSpots();

function Building({ spot }: { spot: Spot }) {
  const gltf = useGLTF(`${KC}/${spot.variant}`);
  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    enhance(c);
    return c;
  }, [gltf.scene]);
  return (
    <primitive
      object={scene}
      position={[spot.x, 0, spot.z]}
      rotation-y={spot.rotY}
      scale={spot.scale}
    />
  );
}

export function Skyline() {
  return (
    <group>
      {SPOTS.map((s, i) => (
        <Building key={i} spot={s} />
      ))}
    </group>
  );
}

