"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Mesh, MeshStandardMaterial, type Object3D } from "three";

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
// Kerb decorative concrete blocks — Kenney bridge-pillar GLB rải dọc kerb
// path để tạo texture concrete cho post-apoc. Procedural kerb vẫn handle
// collision; đây chỉ là accent decoration trên đỉnh kerb.
// ---------------------------------------------------------------------

const KR = "/models/kenney-roads";
const PILLAR_FILE = "bridge-pillar.glb";
useGLTF.preload(`${KR}/${PILLAR_FILE}`);

function enhanceProp(root: Object3D) {
  root.traverse((node) => {
    if ((node as Mesh).isMesh) {
      const m = node as Mesh;
      m.castShadow = true;
      m.receiveShadow = true;
      if (m.material instanceof MeshStandardMaterial) {
        m.material.flatShading = true;
        m.material.needsUpdate = true;
      }
    }
  });
}

type Spot = { x: number; z: number; rotY: number };

function buildKerbBlocks(): Spot[] {
  const out: Spot[] = [];
  const halfRoad = ROAD_WIDTH / 2;
  const kerbCenter = halfRoad + KERB_WIDTH / 2;

  // Spacing dọc arm: mỗi 8m 1 block
  const SPACING = 8;
  for (const angleDeg of ALL_ARM_ANGLES) {
    const [dx, dz] = armDirection(angleDeg);
    const perpX = -dz;
    const perpZ = dx;
    const armRad = (angleDeg * Math.PI) / 180;
    // Dọc arm từ ROUNDABOUT_RADIUS_OUTER tới RING_INNER_RADIUS
    const rStart = ROUNDABOUT_RADIUS_OUTER + 3;
    const rEnd = RING_INNER_RADIUS - 3;
    for (let r = rStart; r < rEnd; r += SPACING) {
      for (const side of [1, -1] as const) {
        out.push({
          x: dx * r + perpX * kerbCenter * side,
          z: dz * r + perpZ * kerbCenter * side,
          rotY: armRad
        });
      }
    }
  }

  // Vành ring outer (only outer kerb, every 12° = ~17m arc length)
  const ringR = RING_OUTER_RADIUS + KERB_WIDTH / 2;
  const armAngleSet = new Set(ALL_ARM_ANGLES);
  for (let aDeg = 0; aDeg < 360; aDeg += 8) {
    if (armAngleSet.has(aDeg)) continue; // skip arm gaps
    const rad = (aDeg * Math.PI) / 180;
    out.push({
      x: Math.cos(rad) * ringR,
      z: -Math.sin(rad) * ringR,
      rotY: rad + Math.PI / 2
    });
  }

  return out;
}

const SPOTS = buildKerbBlocks();

function PillarBlock({ spot }: { spot: Spot }) {
  const gltf = useGLTF(`${KR}/${PILLAR_FILE}`);
  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    enhanceProp(c);
    return c;
  }, [gltf.scene]);
  return (
    <primitive
      object={scene}
      position={[spot.x, 0, spot.z]}
      rotation-y={spot.rotY}
      scale={0.4}
    />
  );
}

export function KerbBlocks() {
  return (
    <group>
      {SPOTS.map((s, i) => (
        <PillarBlock key={i} spot={s} />
      ))}
    </group>
  );
}
