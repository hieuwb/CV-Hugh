"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, Mesh, MeshStandardMaterial, type Object3D } from "three";

import {
  KERB_WIDTH,
  ROAD_WIDTH,
  ROUNDABOUT_RADIUS_OUTER,
  armDirection
} from "@/lib/game-content";

import { audioBus } from "./audio-bus";

const ZB = "/models/zombie/Environment";
useGLTF.preload(`${ZB}/TrafficCone_2.gltf`);
useGLTF.preload(`${ZB}/Barrel.gltf`);
useGLTF.preload(`${ZB}/Wheels_Stack.gltf`);

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

// ---------------------------------------------------------------------
// Knockable props — cone giao thông, barrel, tire — xe đâm được làm bay.
// Cùng pattern physics với letter bricks: rigid group với vận tốc + xoay.
// ---------------------------------------------------------------------

type PropKind = "cone" | "barrel" | "tire";

type PropSpec = {
  kind: PropKind;
  hx: number;
  hz: number;
  ry0: number;
};

type PropState = {
  px: number; py: number; pz: number;
  vx: number; vy: number; vz: number;
  rx: number; ry: number; rz: number;
  sx: number; sy: number; sz: number;
};

const GRAVITY = 14;
const CAR_RADIUS = 1.1;

const OFF_ROAD = ROAD_WIDTH / 2 + KERB_WIDTH + 1.5;

function buildProps(): PropSpec[] {
  const out: PropSpec[] = [];

  // Cones: 2 hàng dọc 3 arm (journey, story, cv) — 2 bên kerb
  const CONE_ARMS = [60, 120, 180];
  for (const angleDeg of CONE_ARMS) {
    const [dx, dz] = armDirection(angleDeg);
    const perpX = -dz;
    const perpZ = dx;
    // 4 cone mỗi bên, dọc arm từ r=22 đến r=58
    for (let i = 0; i < 4; i++) {
      const r = 24 + i * 10;
      for (const side of [1, -1] as const) {
        out.push({
          kind: "cone",
          hx: dx * r + perpX * OFF_ROAD * side,
          hz: dz * r + perpZ * OFF_ROAD * side,
          ry0: 0
        });
      }
    }
  }

  // Barrels: cụm 3 barrel ở gần junction của 2 arm (projects + skills)
  const BARREL_ARMS = [0, 300];
  for (const angleDeg of BARREL_ARMS) {
    const [dx, dz] = armDirection(angleDeg);
    const perpX = -dz;
    const perpZ = dx;
    const r = ROUNDABOUT_RADIUS_OUTER + 5;
    for (let i = 0; i < 3; i++) {
      const side = i === 0 ? 1 : i === 1 ? -1 : 1;
      const offsetAlong = (i - 1) * 1.8;
      const perpOff = OFF_ROAD + (i === 2 ? 1.5 : 0);
      out.push({
        kind: "barrel",
        hx: dx * (r + offsetAlong) + perpX * perpOff * side,
        hz: dz * (r + offsetAlong) + perpZ * perpOff * side,
        // Deterministic phase from index — Math.random would break SSR hydration
        ry0: (i * 0.7 + angleDeg * 0.013) % Math.PI
      });
    }
  }

  // ===== ON-ROAD obstacles — mid-lane để xe tông bay =====
  // Cones rải giữa đường (chặn ½ làn) trên 4 arms — driver phải né hoặc tông
  const ROAD_CONE_ARMS = [0, 60, 120, 240];
  for (const angleDeg of ROAD_CONE_ARMS) {
    const [dx, dz] = armDirection(angleDeg);
    const perpX = -dz;
    const perpZ = dx;
    // Pattern zig-zag mid-lane: ±1.5m perpendicular at varying r
    const placements = [
      { r: 25, perp: 1.6 },
      { r: 32, perp: -1.4 },
      { r: 40, perp: 1.2 },
      { r: 48, perp: -1.6 },
      { r: 56, perp: 1.5 },
      { r: 64, perp: -1.3 }
    ];
    for (const p of placements) {
      out.push({
        kind: "cone",
        hx: dx * p.r + perpX * p.perp,
        hz: dz * p.r + perpZ * p.perp,
        ry0: 0
      });
    }
  }

  // Barrels giữa đường — cụm 2-3 barrel chặn lối ở ring road points
  const RING_BARREL_POSITIONS = [
    { r: 85, angle: 30 },
    { r: 85, angle: 90 },
    { r: 85, angle: 165 },
    { r: 85, angle: 215 },
    { r: 85, angle: 285 },
    { r: 85, angle: 335 }
  ];
  for (const pos of RING_BARREL_POSITIONS) {
    const rad = (pos.angle * Math.PI) / 180;
    const baseX = Math.cos(rad) * pos.r;
    const baseZ = -Math.sin(rad) * pos.r;
    // 2 barrels cluster
    for (let k = 0; k < 2; k++) {
      const offset = k === 0 ? -0.9 : 0.9;
      const tangent = (rad + Math.PI / 2);
      out.push({
        kind: "barrel",
        hx: baseX + Math.cos(tangent) * offset,
        hz: baseZ - Math.sin(tangent) * offset,
        ry0: (k * 0.6 + pos.angle * 0.011) % Math.PI
      });
    }
  }

  // Tire stacks: 4 stack ở các junction corners khác nhau
  for (const angleDeg of [60, 120, 240, 300]) {
    const [dx, dz] = armDirection(angleDeg);
    const perpX = -dz;
    const perpZ = dx;
    const r = ROUNDABOUT_RADIUS_OUTER + 3;
    out.push({
      kind: "tire",
      hx: dx * r + perpX * (OFF_ROAD + 0.8),
      hz: dz * r + perpZ * (OFF_ROAD + 0.8),
      ry0: 0
    });
  }

  return out;
}

function kindHeight(kind: PropKind): number {
  if (kind === "cone") return 0.45;
  if (kind === "barrel") return 0.55;
  return 0.25; // tire stack center
}

function kindHitRadius(kind: PropKind): number {
  if (kind === "cone") return 0.35;
  if (kind === "barrel") return 0.45;
  return 0.55;
}

type Props = {
  carPositionRef: React.MutableRefObject<[number, number]>;
  carVelocityRef: React.MutableRefObject<number>;
};

export function KnockableProps({ carPositionRef, carVelocityRef }: Props) {
  const specs = useMemo(() => buildProps(), []);

  const state = useRef<PropState[]>(
    specs.map((s) => ({
      px: s.hx, py: kindHeight(s.kind), pz: s.hz,
      vx: 0, vy: 0, vz: 0,
      rx: 0, ry: 0, rz: 0,
      sx: 0, sy: 0, sz: 0
    }))
  );

  const refs = useRef<(Group | null)[]>([]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const [cx, cz] = carPositionRef.current;
    const cv = carVelocityRef.current;

    for (let i = 0; i < specs.length; i++) {
      const s = state.current[i];
      const spec = specs[i];
      const g = refs.current[i];
      const HIT_R = kindHitRadius(spec.kind);
      const baseY = kindHeight(spec.kind);

      if (s.py < baseY + 1.5) {
        const dx = s.px - cx;
        const dz = s.pz - cz;
        const d = Math.hypot(dx, dz);
        if (d < HIT_R + CAR_RADIUS && d > 0.001) {
          const dirX = dx / d;
          const dirZ = dz / d;
          const impulse = 5 + Math.min(18, Math.abs(cv) * 1.3);
          s.vx += dirX * impulse;
          s.vz += dirZ * impulse;
          s.vy += 4.5 + Math.abs(cv) * 0.25;
          s.sx += (Math.random() - 0.5) * 18;
          s.sz += (Math.random() - 0.5) * 18;
          s.sy += (Math.random() - 0.5) * 12;
          s.px = cx + dirX * (HIT_R + CAR_RADIUS) * 1.01;
          s.pz = cz + dirZ * (HIT_R + CAR_RADIUS) * 1.01;
          audioBus.knock(Math.min(1, Math.abs(cv) / 10));
        }
      }

      s.vy -= GRAVITY * dt;
      s.px += s.vx * dt;
      s.py += s.vy * dt;
      s.pz += s.vz * dt;

      if (s.py < baseY) {
        s.py = baseY;
        if (s.vy < 0) s.vy = -s.vy * 0.3;
        s.vx *= 0.78;
        s.vz *= 0.78;
        s.sx *= 0.8;
        s.sy *= 0.8;
        s.sz *= 0.8;
        if (Math.abs(s.vy) < 0.3) s.vy = 0;
      }

      s.rx += s.sx * dt;
      s.ry += s.sy * dt;
      s.rz += s.sz * dt;

      if (Math.hypot(s.px, s.pz) > 180) {
        s.px = spec.hx; s.py = baseY; s.pz = spec.hz;
        s.vx = s.vy = s.vz = 0;
        s.sx = s.sy = s.sz = 0;
        s.rx = s.ry = s.rz = 0;
      }

      if (g) {
        g.position.set(s.px, s.py, s.pz);
        g.rotation.set(s.rx, spec.ry0 + s.ry, s.rz);
      }
    }
  });

  return (
    <group>
      {specs.map((spec, i) => (
        <group
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          position={[spec.hx, kindHeight(spec.kind), spec.hz]}
          rotation={[0, spec.ry0, 0]}
        >
          {spec.kind === "cone" && <Cone />}
          {spec.kind === "barrel" && <Barrel />}
          {spec.kind === "tire" && <TireStack />}
        </group>
      ))}
    </group>
  );
}

function Cone() {
  const gltf = useGLTF(`${ZB}/TrafficCone_2.gltf`);
  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    enhanceProp(c);
    return c;
  }, [gltf.scene]);
  return <primitive object={scene} scale={1.4} position={[0, -0.45, 0]} />;
}

function Barrel() {
  const gltf = useGLTF(`${ZB}/Barrel.gltf`);
  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    enhanceProp(c);
    return c;
  }, [gltf.scene]);
  return <primitive object={scene} scale={1.2} position={[0, -0.55, 0]} />;
}

function TireStack() {
  const gltf = useGLTF(`${ZB}/Wheels_Stack.gltf`);
  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    enhanceProp(c);
    return c;
  }, [gltf.scene]);
  return <primitive object={scene} scale={1.0} position={[0, -0.25, 0]} />;
}
