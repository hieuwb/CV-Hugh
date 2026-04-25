"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Mesh, MeshStandardMaterial, type Object3D } from "three";

import {
  ALL_ARM_ANGLES,
  ARM_ANGLES,
  ROAD_WIDTH,
  armDirection
} from "@/lib/game-content";

import { KnockableGLTF, isKnockableFile } from "./knockable-gltf";

// ---------------------------------------------------------------------
// 5 zones tương ứng 5 arm (workshop arm 300° trong zone-workshop.tsx riêng):
//   • Skills (0°)        — Lab/Tech: server racks, traffic lights
//   • Journey (60°)      — Crash site: car wreckage + cinder blocks (đã có debris)
//   • Story (120°)       — Memorial: chest + flowers + dead trees (mood lưu niệm)
//   • CV (180°)          — Bunker: containers + barriers + town sign
//   • Contact (240°)     — Hangout: couches + pallets + barrier
// + Road debris/decay scatter chung dọc tất cả arm
// ---------------------------------------------------------------------

const ZB = "/models/zombie/Environment";

const FILES = [
  "Couch.gltf",
  "Chest.gltf",
  "Chest_Special.gltf",
  "Container_Green.gltf",
  "Container_Red.gltf",
  "TownSign.gltf",
  "TrafficLight_2.gltf",
  "Pallet.gltf",
  "Pallet_Broken.gltf",
  "CinderBlock.gltf",
  "PlasticBarrier.gltf",
  "TrafficBarrier_1.gltf",
  "TrafficBarrier_2.gltf",
  "Pipes.gltf",
  "TrashBag_1.gltf",
  "Wheel.gltf"
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

type ZoneItem = {
  file: string;
  along: number;
  perp: number;
  rotY: number;
  scale: number;
  rotZ?: number;
  posY?: number;
};

type ZoneSpec = {
  armDeg: number;
  name: string;
  accentColor: string;
  lightPos: [number, number, number]; // local to zone — armRel
  items: ZoneItem[];
};

const ZONES: ZoneSpec[] = [
  // Skills (0°) — Lab/Tech: traffic lights + container_green stacked
  {
    armDeg: ARM_ANGLES.skills,
    name: "Lab",
    accentColor: "#72d9ff",
    lightPos: [42, 4, 7],
    items: [
      { file: "TrafficLight_2.gltf", along: 38, perp: 6.5, rotY: 0.3, scale: 1.5 },
      { file: "TrafficLight_2.gltf", along: 42, perp: -6.5, rotY: -0.4, scale: 1.5 },
      { file: "Container_Green.gltf", along: 47, perp: 7.5, rotY: 0.2, scale: 1.4 },
      { file: "Pipes.gltf", along: 50, perp: 7.0, rotY: 0.6, scale: 1.4 },
      { file: "CinderBlock.gltf", along: 45, perp: 6.0, rotY: 0.5, scale: 1.3 }
    ]
  },
  // Journey (60°) — Crash site: chest_special + barriers (vehicles trong debris)
  {
    armDeg: ARM_ANGLES.journey,
    name: "Crash Site",
    accentColor: "#c28bff",
    lightPos: [40, 3, -7],
    items: [
      { file: "Chest_Special.gltf", along: 45, perp: -6.5, rotY: 0.4, scale: 1.5 },
      { file: "TrafficBarrier_1.gltf", along: 48, perp: -7.0, rotY: 0.3, scale: 1.4 },
      { file: "TrafficBarrier_2.gltf", along: 52, perp: -7.5, rotY: 0.9, scale: 1.4 },
      { file: "Wheel.gltf", along: 50, perp: -6.0, rotY: 1.2, scale: 1.5 }
    ]
  },
  // Story (120°) — Memorial: chest + townsign + couch
  {
    armDeg: ARM_ANGLES.story,
    name: "Memorial",
    accentColor: "#ff7b4a",
    lightPos: [38, 3, 8],
    items: [
      { file: "TownSign.gltf", along: 35, perp: 7.0, rotY: -0.3, scale: 1.4 },
      { file: "Chest.gltf", along: 40, perp: 7.5, rotY: 0.3, scale: 1.5 },
      { file: "Pallet.gltf", along: 44, perp: 6.5, rotY: 0.7, scale: 1.3 },
      { file: "TrashBag_1.gltf", along: 46, perp: 7.2, rotY: 1.1, scale: 1.3 }
    ]
  },
  // CV (180°) — Bunker: 2 containers + barriers
  {
    armDeg: ARM_ANGLES.cv,
    name: "Bunker",
    accentColor: "#9cff9c",
    lightPos: [42, 3, -7],
    items: [
      { file: "Container_Red.gltf", along: 38, perp: -6.5, rotY: -0.2, scale: 1.4 },
      { file: "Container_Green.gltf", along: 42, perp: -8.5, rotY: 0.3, scale: 1.4 },
      { file: "PlasticBarrier.gltf", along: 36, perp: -5.5, rotY: 0, scale: 1.4 },
      { file: "PlasticBarrier.gltf", along: 46, perp: -6.0, rotY: 0.5, scale: 1.4 }
    ]
  },
  // Contact (240°) — Hangout: couches + pallets
  {
    armDeg: ARM_ANGLES.contact,
    name: "Hangout",
    accentColor: "#ff7a7a",
    lightPos: [25, 3, 7],
    items: [
      { file: "Couch.gltf", along: 25, perp: 7.0, rotY: 0.2, scale: 1.4 },
      { file: "Couch.gltf", along: 28, perp: 7.5, rotY: -0.3, scale: 1.4 },
      { file: "Pallet.gltf", along: 30, perp: 6.5, rotY: 0.6, scale: 1.3 },
      { file: "Pallet_Broken.gltf", along: 32, perp: 7.0, rotY: 1.0, scale: 1.3 },
      { file: "TrashBag_1.gltf", along: 34, perp: 6.5, rotY: 1.4, scale: 1.3 }
    ]
  }
];

function ZoneItemRender({ item, armDeg }: { item: ZoneItem; armDeg: number }) {
  const gltf = useGLTF(`${ZB}/${item.file}`);
  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    enhanceProp(c);
    return c;
  }, [gltf.scene]);
  const [dx, dz] = armDirection(armDeg);
  const perpX = -dz;
  const perpZ = dx;
  const x = dx * item.along + perpX * item.perp;
  const z = dz * item.along + perpZ * item.perp;
  return (
    <group
      position={[x, item.posY ?? 0, z]}
      rotation={[0, (armDeg * Math.PI) / 180 + item.rotY, item.rotZ ?? 0]}
    >
      <primitive object={scene} scale={item.scale} />
    </group>
  );
}

type ArmZonesProps = {
  carPositionRef: React.MutableRefObject<[number, number]>;
  carVelocityRef: React.MutableRefObject<number>;
};

export function ArmZones({ carPositionRef, carVelocityRef }: ArmZonesProps) {
  return (
    <group>
      {ZONES.flatMap((zone) => [
        ...zone.items.map((item, i) => {
          if (isKnockableFile(item.file)) {
            const [dx, dz] = armDirection(zone.armDeg);
            const perpX = -dz;
            const perpZ = dx;
            const x = dx * item.along + perpX * item.perp;
            const z = dz * item.along + perpZ * item.perp;
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
            <ZoneItemRender
              key={`${zone.armDeg}-${i}`}
              item={item}
              armDeg={zone.armDeg}
            />
          );
        }),
        // Accent point light at zone center (color matches landmark accent)
        ((): JSX.Element => {
          const [dx, dz] = armDirection(zone.armDeg);
          const perpX = -dz;
          const perpZ = dx;
          const lx = dx * zone.lightPos[0] + perpX * zone.lightPos[2];
          const lz = dz * zone.lightPos[0] + perpZ * zone.lightPos[2];
          return (
            <pointLight
              key={`${zone.armDeg}-light`}
              position={[lx, zone.lightPos[1], lz]}
              color={zone.accentColor}
              intensity={1.6}
              distance={14}
              decay={1.8}
            />
          );
        })()
      ])}
    </group>
  );
}

// Export colliders chỉ cho STATIC items (knockable items physics handle interaction)
export const ZONE_COLLIDERS: { x: number; z: number; radius: number }[] = ZONES.flatMap(
  (zone) =>
    zone.items
      .filter((item) => !isKnockableFile(item.file))
      .map((item) => {
        const [dx, dz] = armDirection(zone.armDeg);
        const perpX = -dz;
        const perpZ = dx;
        const x = dx * item.along + perpX * item.perp;
        const z = dz * item.along + perpZ * item.perp;
        const isContainer = item.file.startsWith("Container_");
        const isCouch = item.file.startsWith("Couch");
        const radius = isContainer
          ? 2.6 * item.scale
          : isCouch
            ? 1.4 * item.scale
            : 0.55 * item.scale;
        return { x, z, radius };
      })
);

// =====================================================================
// Road decay — small debris boxes scattered ON road surface (0.05m above)
// =====================================================================
type DebrisChunk = {
  x: number;
  z: number;
  rotY: number;
  size: [number, number, number];
  color: string;
};

function buildRoadDecay(): DebrisChunk[] {
  const out: DebrisChunk[] = [];
  // Mỗi arm có ~10 mảnh vụn rải ngẫu nhiên (deterministic seed)
  for (const angleDeg of ALL_ARM_ANGLES) {
    const [dx, dz] = armDirection(angleDeg);
    const perpX = -dz;
    const perpZ = dx;
    let s = angleDeg * 13 + 7;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < 10; i++) {
      const along = 18 + rand() * 60;
      const perp = (rand() - 0.5) * (ROAD_WIDTH - 1);
      const x = dx * along + perpX * perp;
      const z = dz * along + perpZ * perp;
      const sz = 0.18 + rand() * 0.15;
      const color = rand() > 0.5 ? "#3a3531" : "#2a2520";
      out.push({
        x,
        z,
        rotY: rand() * Math.PI,
        size: [sz, 0.06, sz * 0.7],
        color
      });
    }
  }
  // Ring road debris
  for (let i = 0; i < 60; i++) {
    let s = i * 17 + 23;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const angle = rand() * Math.PI * 2;
    const r = 81 + rand() * 8; // ring road inner-outer
    const x = Math.cos(angle) * r;
    const z = -Math.sin(angle) * r;
    const sz = 0.18 + rand() * 0.15;
    const color = rand() > 0.5 ? "#3a3531" : "#2a2520";
    out.push({
      x,
      z,
      rotY: rand() * Math.PI,
      size: [sz, 0.06, sz * 0.7],
      color
    });
  }
  return out;
}

const ROAD_DECAY = buildRoadDecay();

// Crack streaks on road — thin dark lines using planeGeometry decals
type CrackStreak = {
  x: number;
  z: number;
  rotY: number;
  length: number;
};

function buildCrackStreaks(): CrackStreak[] {
  const out: CrackStreak[] = [];
  for (const angleDeg of ALL_ARM_ANGLES) {
    const [dx, dz] = armDirection(angleDeg);
    const perpX = -dz;
    const perpZ = dx;
    let s = angleDeg * 31 + 11;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < 6; i++) {
      const along = 20 + rand() * 55;
      const perp = (rand() - 0.5) * (ROAD_WIDTH - 1);
      const x = dx * along + perpX * perp;
      const z = dz * along + perpZ * perp;
      out.push({
        x,
        z,
        rotY: (angleDeg * Math.PI) / 180 + (rand() - 0.5) * 1.0,
        length: 0.6 + rand() * 1.4
      });
    }
  }
  return out;
}

const CRACK_STREAKS = buildCrackStreaks();

export function RoadDecay() {
  // Bỏ Street_Straight_Crack tiles — render flat tile trông giống tấm ván gỗ
  // chặn đường. Chỉ giữ debris box nhỏ + crack streak mỏng.
  return (
    <group>
      {ROAD_DECAY.map((d, i) => (
        <mesh
          key={`debris-${i}`}
          position={[d.x, d.size[1] / 2 + 0.025, d.z]}
          rotation={[0, d.rotY, 0]}
          castShadow
        >
          <boxGeometry args={d.size} />
          <meshStandardMaterial color={d.color} roughness={1} flatShading />
        </mesh>
      ))}
      {CRACK_STREAKS.map((c, i) => (
        <mesh
          key={`crack-${i}`}
          position={[c.x, 0.025, c.z]}
          rotation={[-Math.PI / 2, 0, c.rotY]}
        >
          <planeGeometry args={[c.length, 0.06]} />
          <meshStandardMaterial color="#0a0808" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

