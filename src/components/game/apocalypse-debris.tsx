"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Mesh, MeshStandardMaterial, type Object3D } from "three";

import { armDirection } from "@/lib/game-content";

import { KnockableGLTF, isKnockableFile } from "./knockable-gltf";

// ---------------------------------------------------------------------
// Apocalypse Debris — abandoned vehicles + scattered pallets / cinderblocks
// để tạo cảm giác hậu tận thế. Dùng Zombie Apocalypse GLBs.
// Một số xe nghiêng (rotX), úp ngửa, hư hỏng.
// ---------------------------------------------------------------------

const ZB = "/models/zombie";

const FILES = [
  "Vehicles/Vehicle_Pickup.gltf",
  "Vehicles/Vehicle_Pickup_Armored.gltf",
  "Vehicles/Vehicle_Sports.gltf",
  "Vehicles/Vehicle_Sports_Armored.gltf",
  "Vehicles/Vehicle_Truck.gltf",
  "Vehicles/Vehicle_Truck_Armored.gltf",
  "Environment/Pallet.gltf",
  "Environment/Pallet_Broken.gltf",
  "Environment/CinderBlock.gltf",
  "Environment/PlasticBarrier.gltf",
  "Environment/TrafficBarrier_2.gltf"
];

FILES.forEach((f) => useGLTF.preload(`${ZB}/${f}`));

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

type Spec = {
  file: string;
  along: number;       // radial distance từ center
  perpOff: number;     // perp offset (positive = right of arm dir)
  rotY: number;        // rotation Y bonus (radians)
  rotX?: number;       // tilt forward/back (for crashed look)
  rotZ?: number;       // tilt sideways
  scale: number;
  posY?: number;       // lift off ground for tilted ones
};

// Mỗi spec gắn với 1 arm angle. Vehicles ở SHOULDER (off road) — không chặn đường.
type ZoneSpec = {
  armDeg: number;
  items: Spec[];
};

const ZONES: ZoneSpec[] = [
  // Arm 60° (journey) — 1 truck nghiêng + cinder blocks
  {
    armDeg: 60,
    items: [
      { file: "Vehicles/Vehicle_Truck.gltf", along: 38, perpOff: 7.5, rotY: 1.2, rotZ: 0.18, posY: 0.15, scale: 1.5 },
      { file: "Environment/CinderBlock.gltf", along: 36, perpOff: 6.2, rotY: 0.5, scale: 1.4 },
      { file: "Environment/CinderBlock.gltf", along: 39, perpOff: 6.0, rotY: 1.1, scale: 1.4 },
      { file: "Environment/Pallet_Broken.gltf", along: 41, perpOff: 7.2, rotY: 1.5, scale: 1.3 }
    ]
  },
  // Arm 120° (story) — armored pickup nằm bên đường
  {
    armDeg: 120,
    items: [
      { file: "Vehicles/Vehicle_Pickup_Armored.gltf", along: 50, perpOff: -7.0, rotY: -0.3, scale: 1.5 },
      { file: "Environment/PlasticBarrier.gltf", along: 47, perpOff: -6.5, rotY: 0.2, scale: 1.4 },
      { file: "Environment/PlasticBarrier.gltf", along: 53, perpOff: -6.5, rotY: -0.4, scale: 1.4 },
      { file: "Environment/TrafficBarrier_2.gltf", along: 56, perpOff: -7.2, rotY: 1.1, scale: 1.4 }
    ]
  },
  // Arm 180° (cv) — sports car đâm cột
  {
    armDeg: 180,
    items: [
      { file: "Vehicles/Vehicle_Sports.gltf", along: 32, perpOff: 7.5, rotY: 1.8, rotX: -0.12, posY: 0.2, scale: 1.4 },
      { file: "Environment/CinderBlock.gltf", along: 30, perpOff: 6.2, rotY: 0.7, scale: 1.4 },
      { file: "Environment/Pallet.gltf", along: 34, perpOff: 8.5, rotY: 0.9, scale: 1.3 }
    ]
  },
  // Arm 240° (contact) — armored sports car flipped (tilted nặng)
  {
    armDeg: 240,
    items: [
      { file: "Vehicles/Vehicle_Sports_Armored.gltf", along: 48, perpOff: 8.0, rotY: 2.1, rotZ: 0.7, posY: 0.5, scale: 1.4 },
      { file: "Environment/Pallet_Broken.gltf", along: 45, perpOff: 7.5, rotY: 1.2, scale: 1.3 },
      { file: "Environment/CinderBlock.gltf", along: 51, perpOff: 7.0, rotY: 0.4, scale: 1.4 }
    ]
  },
  // Arm 300° (projects) — workshop area thêm nhiều đồ
  {
    armDeg: 300,
    items: [
      { file: "Vehicles/Vehicle_Truck_Armored.gltf", along: 42, perpOff: -8.0, rotY: -0.4, scale: 1.5 },
      { file: "Environment/Pallet.gltf", along: 38, perpOff: -7.5, rotY: 0.3, scale: 1.3 },
      { file: "Environment/Pallet_Broken.gltf", along: 44, perpOff: -8.5, rotY: 1.0, scale: 1.3 },
      { file: "Environment/CinderBlock.gltf", along: 46, perpOff: -7.0, rotY: 0.7, scale: 1.4 },
      { file: "Environment/CinderBlock.gltf", along: 47.5, perpOff: -7.5, rotY: 1.4, scale: 1.4 }
    ]
  }
];

function DebrisItem({ spec, armDeg }: { spec: Spec; armDeg: number }) {
  const gltf = useGLTF(`${ZB}/${spec.file}`);
  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    enhanceProp(c);
    return c;
  }, [gltf.scene]);

  const [dx, dz] = armDirection(armDeg);
  const perpX = -dz;
  const perpZ = dx;
  const x = dx * spec.along + perpX * spec.perpOff;
  const z = dz * spec.along + perpZ * spec.perpOff;

  return (
    <group
      position={[x, spec.posY ?? 0, z]}
      rotation={[
        spec.rotX ?? 0,
        (armDeg * Math.PI) / 180 + spec.rotY,
        spec.rotZ ?? 0
      ]}
    >
      <primitive object={scene} scale={spec.scale} />
    </group>
  );
}

type ApocalypseProps = {
  carPositionRef: React.MutableRefObject<[number, number]>;
  carVelocityRef: React.MutableRefObject<number>;
};

export function ApocalypseDebris({ carPositionRef, carVelocityRef }: ApocalypseProps) {
  return (
    <group>
      {ZONES.flatMap((zone) =>
        zone.items.map((item, i) => {
          if (isKnockableFile(item.file)) {
            const [dx, dz] = armDirection(zone.armDeg);
            const perpX = -dz;
            const perpZ = dx;
            const x = dx * item.along + perpX * item.perpOff;
            const z = dz * item.along + perpZ * item.perpOff;
            return (
              <KnockableGLTF
                key={`${zone.armDeg}-${i}`}
                file={`${ZB}/${item.file}`}
                position={[x, item.posY ?? 0, z]}
                rotationY={(zone.armDeg * Math.PI) / 180 + item.rotY}
                scale={item.scale}
                carPositionRef={carPositionRef}
                carVelocityRef={carVelocityRef}
              />
            );
          }
          return (
            <DebrisItem
              key={`${zone.armDeg}-${i}`}
              spec={item}
              armDeg={zone.armDeg}
            />
          );
        })
      )}
    </group>
  );
}

// Export world (x, z) + collision radius for player-car collision check
export type DebrisCollider = {
  x: number;
  z: number;
  radius: number;
};

function isVehicle(file: string): boolean {
  return file.startsWith("Vehicles/");
}

// Static colliders only (vehicles). Knockable debris handled by physics.
export const DEBRIS_COLLIDERS: DebrisCollider[] = ZONES.flatMap((zone) =>
  zone.items
    .filter((item) => !isKnockableFile(item.file))
    .map((item) => {
      const [dx, dz] = armDirection(zone.armDeg);
      const perpX = -dz;
      const perpZ = dx;
      const x = dx * item.along + perpX * item.perpOff;
      const z = dz * item.along + perpZ * item.perpOff;
      const radius = isVehicle(item.file) ? 2.0 * item.scale : 0.55 * item.scale;
      return { x, z, radius };
    })
);
