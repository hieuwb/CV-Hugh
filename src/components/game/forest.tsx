"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, Mesh, MeshStandardMaterial, type Object3D } from "three";

import {
  ALL_ARM_ANGLES,
  KERB_WIDTH,
  RING_INNER_RADIUS,
  RING_OUTER_RADIUS,
  ROAD_WIDTH,
  ROUNDABOUT_RADIUS_OUTER,
  armDirection
} from "@/lib/game-content";

// ---------------------------------------------------------------------
// Forest v7 — Real GLTFs from Ultimate Stylized Nature pack.
// Post-apoc bias: 60% DeadTree (skeletal), 25% BirchTree (autumn pale),
// 15% MapleTree (life remaining). Bushes + Flower_Clumps real models.
// Wind sway via group rotation.z/x.
// ---------------------------------------------------------------------

const N = "/models/nature";

const TREE_FILES = [
  // Dead trees (skeletal — post-apoc primary)
  "DeadTree_1.gltf",
  "DeadTree_2.gltf",
  "DeadTree_3.gltf",
  "DeadTree_4.gltf",
  "DeadTree_5.gltf",
  "DeadTree_6.gltf",
  "DeadTree_7.gltf",
  "DeadTree_8.gltf",
  "DeadTree_9.gltf",
  "DeadTree_10.gltf",
  // Birch (pale, decay-friendly)
  "BirchTree_1.gltf",
  "BirchTree_2.gltf",
  "BirchTree_3.gltf",
  "BirchTree_4.gltf",
  "BirchTree_5.gltf",
  // Maple (life — sparingly)
  "MapleTree_1.gltf",
  "MapleTree_2.gltf",
  "MapleTree_3.gltf"
];

const BUSH_FILES = [
  "Bush.gltf",
  "Bush_Small.gltf",
  "Bush_Flowers.gltf",
  "Bush_Small_Flowers.gltf",
  "Bush_Large.gltf",
  "Bush_Large_Flowers.gltf"
];

const FLOWER_FILES = [
  "Flower_1_Clump.gltf",
  "Flower_2_Clump.gltf",
  "Flower_3_Clump.gltf",
  "Flower_4_Clump.gltf",
  "Flower_5_Clump.gltf"
];

[...TREE_FILES, ...BUSH_FILES, ...FLOWER_FILES].forEach((f) =>
  useGLTF.preload(`${N}/${f}`)
);

function enhanceProp(root: Object3D) {
  root.traverse((node) => {
    if ((node as Mesh).isMesh) {
      const m = node as Mesh;
      m.castShadow = true;
      m.receiveShadow = true;
      if (m.material instanceof MeshStandardMaterial) {
        m.material.flatShading = true;
        m.material.transparent = true; // alpha cutout for leaves
        m.material.alphaTest = 0.5;
        m.material.needsUpdate = true;
      }
    }
  });
}

type Spot = {
  x: number;
  z: number;
  scale: number;
  rotY: number;
  variantIdx: number;
};

export const TREE_COLLISION_RADIUS = 0.6;

const TREE_OFFSET = ROAD_WIDTH / 2 + KERB_WIDTH + 4;
// +50% trees: 3 radii thay vì 2
const TREE_PAIR_RADII = [26, 46, 66];

function computeTreeSpots(): Spot[] {
  const out: Spot[] = [];

  for (const angleDeg of ALL_ARM_ANGLES) {
    const [dx, dz] = armDirection(angleDeg);
    const perpX = -dz;
    const perpZ = dx;
    const armRad = (angleDeg * Math.PI) / 180;
    TREE_PAIR_RADII.forEach((r, idx) => {
      const sBase = 1.2 + ((idx * 7 + angleDeg) % 11) * 0.06;
      for (const side of [1, -1] as const) {
        const x = dx * r + perpX * TREE_OFFSET * side;
        const z = dz * r + perpZ * TREE_OFFSET * side;
        out.push({
          x,
          z,
          scale: sBase,
          rotY: armRad + (side > 0 ? Math.PI / 2 : -Math.PI / 2) + idx * 0.25,
          // Bias toward DeadTrees (first 10) per post-apoc theme
          variantIdx: pickTreeVariant(idx + Math.floor(angleDeg / 60))
        });
      }
    });
  }

  // Outer ring trees — +1 ring (2 layers)
  const outerAngles = [
    10, 25, 40, 55, 70, 85, 100, 115, 130, 145, 160, 175,
    190, 205, 220, 235, 250, 265, 280, 295, 310, 325, 340, 355
  ];
  outerAngles.forEach((aDeg, i) => {
    const rad = (aDeg * Math.PI) / 180;
    const r = 94 + (i % 3);
    out.push({
      x: Math.cos(rad) * r,
      z: -Math.sin(rad) * r,
      scale: 1.0 + (i % 4) * 0.08,
      rotY: rad + (i % 2 === 0 ? 0.5 : -0.6),
      variantIdx: pickTreeVariant(i)
    });
  });

  // Inner ring trees — denser
  const innerAngles = [20, 40, 80, 100, 140, 160, 200, 220, 260, 280, 320, 340];
  innerAngles.forEach((aDeg, i) => {
    const rad = (aDeg * Math.PI) / 180;
    const r = 68 + (i % 4) * 2.5;
    if (r >= RING_INNER_RADIUS - 3) return;
    out.push({
      x: Math.cos(rad) * r,
      z: -Math.sin(rad) * r,
      scale: 1.0 + (i % 3) * 0.1,
      rotY: rad + i * 0.9,
      variantIdx: pickTreeVariant(i + 7)
    });
  });

  return out;
}

// Bias: 60% Dead (idx 0-9), 25% Birch (idx 10-14), 15% Maple (idx 15-17)
function pickTreeVariant(seed: number): number {
  const v = (seed * 13 + 7) % 100;
  if (v < 60) return seed % 10; // dead
  if (v < 85) return 10 + (seed % 5); // birch
  return 15 + (seed % 3); // maple
}

// =====================================================================
// FOREST FILL — procedural scatter trees densely on land. Tránh roads.
// =====================================================================
const ARM_HALF_W = ROAD_WIDTH / 2 + KERB_WIDTH + 0.5;

function isOnLand(x: number, z: number): boolean {
  const r = Math.hypot(x, z);
  // Trong roundabout
  if (r < ROUNDABOUT_RADIUS_OUTER + 1.5) return false;
  // Ring road zone
  if (r >= RING_INNER_RADIUS - 1 && r <= RING_OUTER_RADIUS + 1) return false;
  // Ngoài đảo
  if (r > 96) return false;
  // Arm roads — chỉ trong dải [round_outer, ring_inner]
  if (r >= ROUNDABOUT_RADIUS_OUTER + 1.5 && r <= RING_INNER_RADIUS - 1) {
    const carAngle = Math.atan2(-z, x);
    for (const deg of ALL_ARM_ANGLES) {
      const armRad = (deg * Math.PI) / 180;
      let diff = Math.abs(carAngle - armRad);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      const perpDist = r * Math.sin(Math.min(diff, Math.PI / 2));
      if (perpDist < ARM_HALF_W) return false;
    }
  }
  return true;
}

function computeForestFill(): Spot[] {
  // Deterministic random
  let s = 31337;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const out: Spot[] = [];
  let attempts = 0;
  // Reduced for perf: 240 → 110
  const TARGET = 110;
  // Inside ring: r 18-78
  while (out.length < 80 && attempts < 3000) {
    attempts++;
    const a = rand() * Math.PI * 2;
    const r = 18 + rand() * 60;
    const x = Math.cos(a) * r;
    const z = -Math.sin(a) * r;
    if (!isOnLand(x, z)) continue;
    out.push({
      x,
      z,
      scale: 0.85 + rand() * 0.6,
      rotY: rand() * Math.PI * 2,
      variantIdx: pickTreeVariant(out.length + 100)
    });
  }
  while (out.length < TARGET && attempts < 5000) {
    attempts++;
    const a = rand() * Math.PI * 2;
    const r = 91 + rand() * 4;
    const x = Math.cos(a) * r;
    const z = -Math.sin(a) * r;
    if (!isOnLand(x, z)) continue;
    out.push({
      x,
      z,
      scale: 0.8 + rand() * 0.5,
      rotY: rand() * Math.PI * 2,
      variantIdx: pickTreeVariant(out.length + 200)
    });
  }
  return out;
}

const TREE_SPOTS = computeTreeSpots();
const FOREST_FILL_SPOTS = computeForestFill();

export const TREE_POSITIONS: [number, number][] = TREE_SPOTS.map((s) => [
  s.x,
  s.z
]);

function Tree({
  spot,
  refCb
}: {
  spot: Spot;
  refCb: (el: Group | null) => void;
}) {
  const file = TREE_FILES[spot.variantIdx % TREE_FILES.length];
  const gltf = useGLTF(`${N}/${file}`);
  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    enhanceProp(c);
    return c;
  }, [gltf.scene]);
  return (
    <group
      ref={refCb}
      position={[spot.x, 0, spot.z]}
      rotation-y={spot.rotY}
      scale={spot.scale}
    >
      <primitive object={scene} />
    </group>
  );
}

// Static tree — KHÔNG castShadow để giảm shadow draw calls cho ~110 instances
function enhancePropNoShadow(root: Object3D) {
  root.traverse((node) => {
    if ((node as Mesh).isMesh) {
      const m = node as Mesh;
      m.castShadow = false;
      m.receiveShadow = false;
      if (m.material instanceof MeshStandardMaterial) {
        m.material.flatShading = true;
        m.material.transparent = true;
        m.material.alphaTest = 0.5;
        m.material.needsUpdate = true;
      }
    }
  });
}

function StaticTree({ spot }: { spot: Spot }) {
  const file = TREE_FILES[spot.variantIdx % TREE_FILES.length];
  const gltf = useGLTF(`${N}/${file}`);
  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    enhancePropNoShadow(c);
    return c;
  }, [gltf.scene]);
  return (
    <group
      position={[spot.x, 0, spot.z]}
      rotation-y={spot.rotY}
      scale={spot.scale}
    >
      <primitive object={scene} />
    </group>
  );
}

export function Forest() {
  const refs = useRef<(Group | null)[]>([]);
  const baseRotY = useRef<number[]>(TREE_SPOTS.map((s) => s.rotY));

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < refs.current.length; i++) {
      const g = refs.current[i];
      if (!g) continue;
      const phase = i * 0.73;
      g.rotation.z = Math.sin(t * 0.9 + phase) * 0.025;
      g.rotation.x = Math.cos(t * 1.2 + phase * 1.3) * 0.018;
      g.rotation.y = baseRotY.current[i] + Math.sin(t * 0.5 + phase) * 0.01;
    }
  });

  return (
    <group>
      {/* Sway-animated trees gần road (dùng useFrame) */}
      {TREE_SPOTS.map((s, i) => (
        <Tree
          key={`tree-${i}`}
          spot={s}
          refCb={(el) => {
            refs.current[i] = el;
          }}
        />
      ))}
      {/* Forest fill xa hơn — static (no sway) cho perf với 200+ instances */}
      {FOREST_FILL_SPOTS.map((s, i) => (
        <StaticTree key={`fill-${i}`} spot={s} />
      ))}
    </group>
  );
}

// ===================== BUSHES =====================
function computeBushSpots(): Spot[] {
  const out: Spot[] = [];

  // Inside ring sectors — +50% bushes
  const insideAngles = [15, 30, 45, 75, 90, 105, 135, 150, 165, 195, 210, 225, 255, 270, 285, 315, 330, 345];
  insideAngles.forEach((aDeg, i) => {
    const rad = (aDeg * Math.PI) / 180;
    const r = 68 + (i % 4) * 2.5;
    if (r >= RING_INNER_RADIUS - 2) return;
    out.push({
      x: Math.cos(rad) * r,
      z: -Math.sin(rad) * r,
      scale: 1.4 + (i % 3) * 0.2,
      rotY: rad + i * 0.7,
      variantIdx: i % BUSH_FILES.length
    });
  });

  // Outside ring sectors — denser
  const outsideAngles = [10, 25, 40, 55, 75, 95, 115, 135, 155, 175, 195, 215, 235, 255, 275, 295, 315, 335];
  outsideAngles.forEach((aDeg, i) => {
    const rad = (aDeg * Math.PI) / 180;
    const r = 92 + (i % 3) * 1.5;
    if (r <= RING_OUTER_RADIUS + 1) return;
    out.push({
      x: Math.cos(rad) * r,
      z: -Math.sin(rad) * r,
      scale: 1.2 + (i % 4) * 0.18,
      rotY: rad + i * 1.1,
      variantIdx: i % BUSH_FILES.length
    });
  });

  return out;
}

// Junction bushes (mask kerb corners)
function computeJunctionBushSpots(): Spot[] {
  const out: Spot[] = [];
  const halfRoad = ROAD_WIDTH / 2;
  const cornerPerp = halfRoad + KERB_WIDTH + 1.2;

  for (const angleDeg of ALL_ARM_ANGLES) {
    const [dx, dz] = armDirection(angleDeg);
    const perpX = -dz;
    const perpZ = dx;

    const rRound = ROUNDABOUT_RADIUS_OUTER + 0.5;
    for (const side of [1, -1] as const) {
      out.push({
        x: dx * rRound + perpX * cornerPerp * side,
        z: dz * rRound + perpZ * cornerPerp * side,
        scale: 1.0,
        rotY: ((angleDeg * Math.PI) / 180) + (side > 0 ? 0.6 : -0.6),
        variantIdx: 1 // Bush_Small
      });
    }

    const rRing = RING_INNER_RADIUS - 0.5;
    for (const side of [1, -1] as const) {
      out.push({
        x: dx * rRing + perpX * cornerPerp * side,
        z: dz * rRing + perpZ * cornerPerp * side,
        scale: 1.0,
        rotY: ((angleDeg * Math.PI) / 180) + (side > 0 ? -0.4 : 0.4),
        variantIdx: 3 // Bush_Small_Flowers
      });
    }
  }
  return out;
}

// Bush understory — procedural fill ~120 bushes ở đất giữa cây
function computeBushFill(): Spot[] {
  let s = 99887;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const out: Spot[] = [];
  let attempts = 0;
  // Reduced: 130 → 60
  while (out.length < 45 && attempts < 2500) {
    attempts++;
    const a = rand() * Math.PI * 2;
    const r = 18 + rand() * 60;
    const x = Math.cos(a) * r;
    const z = -Math.sin(a) * r;
    if (!isOnLand(x, z)) continue;
    out.push({
      x,
      z,
      scale: 0.7 + rand() * 0.6,
      rotY: rand() * Math.PI * 2,
      variantIdx: Math.floor(rand() * BUSH_FILES.length)
    });
  }
  while (out.length < 60 && attempts < 4000) {
    attempts++;
    const a = rand() * Math.PI * 2;
    const r = 91 + rand() * 4;
    const x = Math.cos(a) * r;
    const z = -Math.sin(a) * r;
    if (!isOnLand(x, z)) continue;
    out.push({
      x,
      z,
      scale: 0.6 + rand() * 0.5,
      rotY: rand() * Math.PI * 2,
      variantIdx: Math.floor(rand() * BUSH_FILES.length)
    });
  }
  return out;
}

const BUSH_FILL_SPOTS = computeBushFill();
const BUSH_SPOTS = [...computeBushSpots(), ...computeJunctionBushSpots()];

function Bush({
  spot,
  refCb
}: {
  spot: Spot;
  refCb: (el: Group | null) => void;
}) {
  const file = BUSH_FILES[spot.variantIdx % BUSH_FILES.length];
  const gltf = useGLTF(`${N}/${file}`);
  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    enhanceProp(c);
    return c;
  }, [gltf.scene]);
  return (
    <group
      ref={refCb}
      position={[spot.x, 0, spot.z]}
      rotation-y={spot.rotY}
      scale={spot.scale}
    >
      <primitive object={scene} />
    </group>
  );
}

function StaticBush({ spot }: { spot: Spot }) {
  const file = BUSH_FILES[spot.variantIdx % BUSH_FILES.length];
  const gltf = useGLTF(`${N}/${file}`);
  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    enhancePropNoShadow(c);
    return c;
  }, [gltf.scene]);
  return (
    <group
      position={[spot.x, 0, spot.z]}
      rotation-y={spot.rotY}
      scale={spot.scale}
    >
      <primitive object={scene} />
    </group>
  );
}

export function BushesFolio() {
  const refs = useRef<(Group | null)[]>([]);
  const baseRotY = useRef<number[]>(BUSH_SPOTS.map((s) => s.rotY));

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < refs.current.length; i++) {
      const g = refs.current[i];
      if (!g) continue;
      const phase = i * 1.1 + 10;
      g.rotation.z = Math.sin(t * 1.3 + phase) * 0.04;
      g.rotation.y = baseRotY.current[i] + Math.sin(t * 0.7 + phase) * 0.018;
    }
  });

  return (
    <group>
      {/* Sway-animated bushes (junction + sector) */}
      {BUSH_SPOTS.map((s, i) => (
        <Bush
          key={`bush-${i}`}
          spot={s}
          refCb={(el) => {
            refs.current[i] = el;
          }}
        />
      ))}
      {/* Bush understory fill — static cho perf */}
      {BUSH_FILL_SPOTS.map((s, i) => (
        <StaticBush key={`bush-fill-${i}`} spot={s} />
      ))}
    </group>
  );
}

// ===================== FLOWER CLUMPS =====================
function computeFlowerClumpSpots(): Spot[] {
  const out: Spot[] = [];
  let seed = 1234;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const sectorAngles = [
    10, 25, 40, 55, 70, 85, 100, 115, 130, 145, 160, 175,
    190, 205, 220, 235, 250, 265, 280, 295, 310, 325, 340, 355
  ];
  for (const aDeg of sectorAngles) {
    for (let n = 0; n < 2; n++) {
      const rad = (aDeg * Math.PI) / 180;
      const r = 28 + rand() * 50;
      out.push({
        x: Math.cos(rad) * r,
        z: -Math.sin(rad) * r,
        scale: 0.7 + rand() * 0.4,
        rotY: rand() * Math.PI * 2,
        variantIdx: Math.floor(rand() * FLOWER_FILES.length)
      });
    }
  }
  return out;
}

const FLOWER_SPOTS = computeFlowerClumpSpots();

function FlowerClump({ spot }: { spot: Spot }) {
  const file = FLOWER_FILES[spot.variantIdx % FLOWER_FILES.length];
  const gltf = useGLTF(`${N}/${file}`);
  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    enhanceProp(c);
    return c;
  }, [gltf.scene]);
  return (
    <group
      position={[spot.x, 0, spot.z]}
      rotation-y={spot.rotY}
      scale={spot.scale}
    >
      <primitive object={scene} />
    </group>
  );
}

export function FlowerClumps() {
  return (
    <group>
      {FLOWER_SPOTS.map((s, i) => (
        <FlowerClump key={`fl-${i}`} spot={s} />
      ))}
    </group>
  );
}
