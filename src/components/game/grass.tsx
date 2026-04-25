"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Euler,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3
} from "three";

import {
  ALL_ARM_ANGLES,
  KERB_WIDTH,
  RING_INNER_RADIUS,
  RING_OUTER_RADIUS,
  ROAD_WIDTH,
  ROUNDABOUT_RADIUS_INNER,
  ROUNDABOUT_RADIUS_OUTER,
  TERRAIN_RADIUS_V2
} from "@/lib/game-content";

// ---------------------------------------------------------------------
// Grass dày đặc kiểu image 3 — chỉ mọc trên ĐẤT (không road, không nước),
// với vertex-shader wind sway. Dùng InstancedMesh + 1 draw call.
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

// Triangle blade, 0.4 cao, double-sided
function makeBladeGeometry() {
  const g = new BufferGeometry();
  const positions = new Float32Array([
    -0.06, 0, 0,
    0.06, 0, 0,
    0, 0.55, 0
  ]);
  const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
  const uvs = new Float32Array([0, 0, 1, 0, 0.5, 1]);
  g.setAttribute("position", new BufferAttribute(positions, 3));
  g.setAttribute("normal", new BufferAttribute(normals, 3));
  g.setAttribute("uv", new BufferAttribute(uvs, 2));
  return g;
}

const EDGE_PAD = KERB_WIDTH + 0.2;
const ARM_HALF_WIDTH = ROAD_WIDTH / 2 + EDGE_PAD;
const RING_INNER_PAD = RING_INNER_RADIUS - EDGE_PAD;
const RING_OUTER_PAD = RING_OUTER_RADIUS + EDGE_PAD;
const ROUND_INNER_PAD = ROUNDABOUT_RADIUS_INNER - EDGE_PAD;
const ROUND_OUTER_PAD = ROUNDABOUT_RADIUS_OUTER + EDGE_PAD;

function isOnLand(x: number, z: number): boolean {
  const r = Math.hypot(x, z);
  // Ngoài đảo → nước
  if (r > TERRAIN_RADIUS_V2 - 1) return false;
  // Roundabout (cả tâm và kerb)
  if (r >= ROUND_INNER_PAD && r <= ROUND_OUTER_PAD) return false;
  // Ring road
  if (r >= RING_INNER_PAD && r <= RING_OUTER_PAD) return false;
  // Arm roads: nếu trong dải radial [round_outer, ring_inner], check perpendicular
  if (r >= ROUND_OUTER_PAD && r <= RING_INNER_PAD) {
    const carAngle = Math.atan2(-z, x);
    for (const deg of ALL_ARM_ANGLES) {
      const armRad = (deg * Math.PI) / 180;
      let diff = Math.abs(carAngle - armRad);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      const perpDist = r * Math.sin(Math.min(diff, Math.PI / 2));
      if (perpDist < ARM_HALF_WIDTH) return false;
    }
  }
  return true;
}

type Cluster = { center: [number, number]; count: number; spread: number };

function buildClusters(): Cluster[] {
  const rand = mulberry32(1234);
  const clusters: Cluster[] = [];

  // Vùng 1: từ roundabout out tới ring in (r 16-80), giảm cho perf
  for (let i = 0; i < 240; i++) {
    const a = rand() * Math.PI * 2;
    const r = 16 + rand() * 64;
    const c: [number, number] = [Math.cos(a) * r, Math.sin(a) * r];
    if (!isOnLand(c[0], c[1])) continue;
    clusters.push({ center: c, count: 18 + Math.floor(rand() * 14), spread: 1.6 });
  }

  // Vùng 2: rìa đảo ngoài ring (r 90-96), giảm cho perf
  for (let i = 0; i < 130; i++) {
    const a = rand() * Math.PI * 2;
    const r = 90 + rand() * 6;
    const c: [number, number] = [Math.cos(a) * r, Math.sin(a) * r];
    if (!isOnLand(c[0], c[1])) continue;
    clusters.push({ center: c, count: 14 + Math.floor(rand() * 10), spread: 1.4 });
  }

  // Vùng 3: tâm roundabout (r < 7)
  for (let i = 0; i < 40; i++) {
    const a = rand() * Math.PI * 2;
    const r = rand() * 6;
    const c: [number, number] = [Math.cos(a) * r, Math.sin(a) * r];
    if (!isOnLand(c[0], c[1])) continue;
    clusters.push({ center: c, count: 10 + Math.floor(rand() * 8), spread: 1 });
  }

  return clusters;
}

export function Grass(_: { excludes?: [number, number][] }) {
  const { matrices, geometry, material, shaderRef } = useMemo(() => {
    const rand = mulberry32(5678);
    const clusters = buildClusters();
    const mats: Matrix4[] = [];

    for (const c of clusters) {
      for (let i = 0; i < c.count; i++) {
        const ox = c.center[0] + (rand() - 0.5) * c.spread * 2;
        const oz = c.center[1] + (rand() - 0.5) * c.spread * 2;
        if (!isOnLand(ox, oz)) continue;
        const scale = 0.6 + rand() * 0.7;
        const rotY = rand() * Math.PI * 2;
        const tilt = (rand() - 0.5) * 0.15;
        const m = new Matrix4().compose(
          new Vector3(ox, 0, oz),
          new Quaternion().setFromEuler(new Euler(tilt, rotY, 0)),
          new Vector3(scale * 1.1, scale, scale * 1.1)
        );
        mats.push(m);
      }
    }

    const shaderRef: { current: { uniforms: { uTime: { value: number } } } | null } = {
      current: null
    };
    const mat = new MeshStandardMaterial({
      color: new Color("#9aa040"),
      emissive: new Color("#3a3010"),
      emissiveIntensity: 0.06,
      roughness: 1,
      flatShading: true,
      side: DoubleSide
    });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.vertexShader = "uniform float uTime;\n" + shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
        #include <begin_vertex>
        float ipx = instanceMatrix[3][0];
        float ipz = instanceMatrix[3][2];
        float phase = ipx * 0.25 + ipz * 0.2;
        float sway = sin(uTime * 1.6 + phase) * 0.28 + sin(uTime * 2.7 + phase * 1.3) * 0.12;
        float bend = max(position.y, 0.0);
        transformed.x += sway * bend;
        transformed.z += sway * 0.45 * bend;
        `
      );
      shaderRef.current = shader as unknown as { uniforms: { uTime: { value: number } } };
    };

    return {
      matrices: mats,
      geometry: makeBladeGeometry(),
      material: mat,
      shaderRef
    };
  }, []);

  useFrame(({ clock }) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <instancedMesh
      args={[geometry, material, matrices.length]}
      receiveShadow
      onUpdate={(m) => {
        matrices.forEach((mat, i) => m.setMatrixAt(i, mat));
        m.instanceMatrix.needsUpdate = true;
      }}
    />
  );
}

