"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, Mesh, MeshStandardMaterial, type Object3D } from "three";

import { audioBus } from "./audio-bus";

// ---------------------------------------------------------------------
// KnockableGLTF — wrapper biến 1 GLB/GLTF prop thành knockable physics body.
// Xe đâm trúng → văng + xoay + rơi gravity. Reset về home khi văng quá xa.
// Dùng cho mọi prop nhỏ (pallet, cinderblock, pipes, trashbag, chest...) ở
// các zone files thay vì render static.
// ---------------------------------------------------------------------

const GRAVITY = 14;
const CAR_RADIUS = 1.1;

// File names that should be knockable (small, not pole-mounted)
export const KNOCKABLE_FILE_SET = new Set<string>([
  "Pallet.gltf",
  "Pallet_Broken.gltf",
  "CinderBlock.gltf",
  "Pipes.gltf",
  "TrashBag_1.gltf",
  "TrashBag_2.gltf",
  "Chest.gltf",
  "Chest_Special.gltf",
  "Wheel.gltf",
  "PlasticBarrier.gltf",
  "TrafficBarrier_1.gltf",
  "TrafficBarrier_2.gltf",
  "construction-barrier.glb",
  "construction-cone.glb"
]);

export function isKnockableFile(file: string): boolean {
  // Strip path prefix
  const base = file.split("/").pop() ?? file;
  return KNOCKABLE_FILE_SET.has(base);
}

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

// Bounding hit radius theo loại prop
function hitRadiusFor(file: string): number {
  const base = file.split("/").pop() ?? file;
  if (base.includes("Pipes")) return 0.7;
  if (base.includes("Chest_Special")) return 0.7;
  if (base.includes("Chest")) return 0.55;
  if (base.includes("Pallet_Broken")) return 0.55;
  if (base.includes("Pallet")) return 0.65;
  if (base.includes("TrashBag")) return 0.45;
  if (base.includes("CinderBlock")) return 0.35;
  if (base.includes("PlasticBarrier")) return 0.5;
  if (base.includes("TrafficBarrier")) return 0.6;
  if (base.includes("Wheel")) return 0.45;
  if (base.includes("construction-barrier")) return 0.55;
  if (base.includes("construction-cone")) return 0.35;
  return 0.5;
}

type Props = {
  file: string;
  position: [number, number, number];
  rotationY: number;
  scale: number;
  carPositionRef: React.MutableRefObject<[number, number]>;
  carVelocityRef: React.MutableRefObject<number>;
};

export function KnockableGLTF({
  file,
  position,
  rotationY,
  scale,
  carPositionRef,
  carVelocityRef
}: Props) {
  const gltf = useGLTF(file);
  const sceneClone = useMemo(() => {
    const c = gltf.scene.clone(true);
    enhanceProp(c);
    return c;
  }, [gltf.scene]);

  const groupRef = useRef<Group | null>(null);
  const HIT_R = useMemo(() => hitRadiusFor(file), [file]);

  // Per-instance physics state (mutable ref, not React state)
  const state = useRef({
    px: position[0],
    py: position[1],
    pz: position[2],
    vx: 0,
    vy: 0,
    vz: 0,
    rx: 0,
    ry: 0,
    rz: 0,
    sx: 0,
    sy: 0,
    sz: 0,
    hx: position[0],
    hy: position[1],
    hz: position[2]
  });

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const s = state.current;
    const [cx, cz] = carPositionRef.current;
    const cv = carVelocityRef.current;
    const baseY = position[1];

    // Collision (rising edge: chỉ trigger khi prop đang ở đất)
    if (s.py < baseY + 1.2) {
      const dx = s.px - cx;
      const dz = s.pz - cz;
      const d = Math.hypot(dx, dz);
      if (d < HIT_R + CAR_RADIUS && d > 0.001) {
        const dirX = dx / d;
        const dirZ = dz / d;
        const impulse = 5 + Math.min(18, Math.abs(cv) * 1.3);
        s.vx += dirX * impulse;
        s.vz += dirZ * impulse;
        s.vy += 5 + Math.abs(cv) * 0.3;
        s.sx += (Math.random() - 0.5) * 16;
        s.sz += (Math.random() - 0.5) * 16;
        s.sy += (Math.random() - 0.5) * 12;
        s.px = cx + dirX * (HIT_R + CAR_RADIUS) * 1.01;
        s.pz = cz + dirZ * (HIT_R + CAR_RADIUS) * 1.01;
        audioBus.knock(Math.min(1, Math.abs(cv) / 10));
      }
    }

    // Gravity + integrate
    s.vy -= GRAVITY * dt;
    s.px += s.vx * dt;
    s.py += s.vy * dt;
    s.pz += s.vz * dt;

    // Ground collision
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

    // Spin
    s.rx += s.sx * dt;
    s.ry += s.sy * dt;
    s.rz += s.sz * dt;

    // Reset if flung too far
    if (Math.hypot(s.px, s.pz) > 180) {
      s.px = s.hx;
      s.py = s.hy;
      s.pz = s.hz;
      s.vx = s.vy = s.vz = 0;
      s.sx = s.sy = s.sz = 0;
      s.rx = s.ry = s.rz = 0;
    }

    const g = groupRef.current;
    if (g) {
      g.position.set(s.px, s.py, s.pz);
      g.rotation.set(s.rx, rotationY + s.ry, s.rz);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
    >
      <primitive object={sceneClone} scale={scale} />
    </group>
  );
}
