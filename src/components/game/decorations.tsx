"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Mesh, MeshStandardMaterial, type Object3D } from "three";

import {
  KERB_WIDTH,
  ROAD_WIDTH,
  ROUNDABOUT_RADIUS_OUTER,
  armDirection
} from "@/lib/game-content";

import { KnockableGLTF } from "./knockable-gltf";

// ---------------------------------------------------------------------
// Decorations — props phụ trang trí scene cho dày + cozy hơn:
//   • Traffic lights ở 2 cửa arm (skills + cv)
//   • Plastic barriers + trash bags rải dọc workshop arm
//   • Water tower silhouette xa xa
//   • Procedural flower clumps ở các vị trí bushes
// Dùng các GLTF Zombie Apocalypse chưa wire trước đó.
// ---------------------------------------------------------------------

const ZB = "/models/zombie/Environment";

const DECO_FILES = [
  "TrafficLight_1.gltf",
  "TrafficLight_2.gltf",
  "PlasticBarrier.gltf",
  "TrafficBarrier_1.gltf",
  "TrafficBarrier_2.gltf",
  "TrashBag_1.gltf",
  "TrashBag_2.gltf",
  "WaterTower.gltf",
  "FireHydrant.gltf",
  "Pipes.gltf"
];

DECO_FILES.forEach((f) => useGLTF.preload(`${ZB}/${f}`));

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

function GLTFProp({
  file,
  position,
  rotationY,
  scale,
  shadowless
}: {
  file: string;
  position: [number, number, number];
  rotationY: number;
  scale: number;
  shadowless?: boolean;
}) {
  const gltf = useGLTF(`${ZB}/${file}`);
  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    if (shadowless) {
      c.traverse((node) => {
        if ((node as Mesh).isMesh) {
          const m = node as Mesh;
          m.castShadow = false;
          m.receiveShadow = false;
        }
      });
    } else {
      enhanceProp(c);
    }
    return c;
  }, [gltf.scene, shadowless]);
  return (
    <primitive
      object={scene}
      position={position}
      rotation-y={rotationY}
      scale={scale}
    />
  );
}

// ============== TRAFFIC LIGHTS at 2 arm junctions ==============
const TRAFFIC_LIGHT_ARMS: number[] = [0, 180]; // skills + cv arms

function TrafficLights() {
  return (
    <group>
      {TRAFFIC_LIGHT_ARMS.map((angleDeg, i) => {
        const [dx, dz] = armDirection(angleDeg);
        const perpX = -dz;
        const perpZ = dx;
        const r = ROUNDABOUT_RADIUS_OUTER + 2.0;
        const perp = ROAD_WIDTH / 2 + KERB_WIDTH + 1.5;
        const x = dx * r + perpX * perp;
        const z = dz * r + perpZ * perp;
        const file = i % 2 === 0 ? "TrafficLight_1.gltf" : "TrafficLight_2.gltf";
        return (
          <GLTFProp
            key={`tl-${angleDeg}`}
            file={file}
            position={[x, 0, z]}
            rotationY={(angleDeg * Math.PI) / 180 - Math.PI / 2}
            scale={1.5}
          />
        );
      })}
    </group>
  );
}

type CarRefs = {
  carPositionRef: React.MutableRefObject<[number, number]>;
  carVelocityRef: React.MutableRefObject<number>;
};

// ============== PLASTIC BARRIERS along ring inner edge (KNOCKABLE) ==============
function Barriers({ carPositionRef, carVelocityRef }: CarRefs) {
  const angles = [30, 90, 150, 210, 270, 330];
  return (
    <group>
      {angles.map((aDeg, i) => {
        const rad = (aDeg * Math.PI) / 180;
        const r = 78;
        const x = Math.cos(rad) * r;
        const z = -Math.sin(rad) * r;
        const file = i % 2 === 0 ? "PlasticBarrier.gltf" : "TrafficBarrier_1.gltf";
        return (
          <KnockableGLTF
            key={`pb-${aDeg}`}
            file={`${ZB}/${file}`}
            position={[x, 0, z]}
            rotationY={rad + Math.PI / 2}
            scale={1.4}
            carPositionRef={carPositionRef}
            carVelocityRef={carVelocityRef}
          />
        );
      })}
    </group>
  );
}

// ============== TRASH BAGS + PIPES in workshop zone (KNOCKABLE) ==============
function TrashBags({ carPositionRef, carVelocityRef }: CarRefs) {
  const armDeg = 300;
  const [dx, dz] = armDirection(armDeg);
  const perpX = -dz;
  const perpZ = dx;
  const baseR = 35;
  const items: { file: string; alongOff: number; perpOff: number; rotY: number }[] = [
    { file: "TrashBag_1.gltf", alongOff: 0, perpOff: 6.5, rotY: 0.3 },
    { file: "TrashBag_2.gltf", alongOff: 1.4, perpOff: 6.2, rotY: 0.8 },
    { file: "TrashBag_1.gltf", alongOff: -1.5, perpOff: 7.0, rotY: 1.4 },
    { file: "Pipes.gltf", alongOff: 3.0, perpOff: 8.5, rotY: 0.6 },
    { file: "TrashBag_2.gltf", alongOff: 4.5, perpOff: 7.3, rotY: 2.1 }
  ];
  return (
    <group>
      {items.map((it, i) => (
        <KnockableGLTF
          key={`tb-${i}`}
          file={`${ZB}/${it.file}`}
          position={[
            dx * (baseR + it.alongOff) + perpX * it.perpOff,
            0,
            dz * (baseR + it.alongOff) + perpZ * it.perpOff
          ]}
          rotationY={(armDeg * Math.PI) / 180 + it.rotY}
          scale={1.3}
          carPositionRef={carPositionRef}
          carVelocityRef={carVelocityRef}
        />
      ))}
    </group>
  );
}

// ============== WATER TOWER on horizon ==============
function WaterTowerOnHorizon() {
  return (
    <group>
      <GLTFProp
        file="WaterTower.gltf"
        position={[Math.cos(0.42) * 120, 0, -Math.sin(0.42) * 120]}
        rotationY={1.2}
        scale={3.5}
        shadowless
      />
      <GLTFProp
        file="WaterTower.gltf"
        position={[Math.cos(2.6) * 125, 0, -Math.sin(2.6) * 125]}
        rotationY={-0.8}
        scale={3.2}
        shadowless
      />
    </group>
  );
}

// ============== EXTRA FIRE HYDRANTS at corners ==============
function ExtraFireHydrants() {
  // 1 hydrant bên ngoài junction của arm 60° (journey)
  const angles = [60, 240];
  return (
    <group>
      {angles.map((aDeg) => {
        const [dx, dz] = armDirection(aDeg);
        const perpX = -dz;
        const perpZ = dx;
        const r = ROUNDABOUT_RADIUS_OUTER + 4;
        const perp = ROAD_WIDTH / 2 + KERB_WIDTH + 1.0;
        return (
          <GLTFProp
            key={`fh-${aDeg}`}
            file="FireHydrant.gltf"
            position={[dx * r + perpX * perp, 0, dz * r + perpZ * perp]}
            rotationY={(aDeg * Math.PI) / 180}
            scale={1.4}
          />
        );
      })}
    </group>
  );
}

// ============== KENNEY CONSTRUCTION PROPS — barriers + lights ==============
// Cụm "đường đang sửa" rải dọc một số arm để post-apoc cảm.
const KR = "/models/kenney-roads";
const KENNEY_FILES = [
  "construction-barrier.glb",
  "construction-cone.glb",
  "construction-light.glb"
];
KENNEY_FILES.forEach((f) => useGLTF.preload(`${KR}/${f}`));

function KenneyProp({
  file,
  position,
  rotationY,
  scale
}: {
  file: string;
  position: [number, number, number];
  rotationY: number;
  scale: number;
}) {
  const gltf = useGLTF(`${KR}/${file}`);
  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    enhanceProp(c);
    return c;
  }, [gltf.scene]);
  return (
    <primitive
      object={scene}
      position={position}
      rotation-y={rotationY}
      scale={scale}
    />
  );
}

function ConstructionProps({ carPositionRef, carVelocityRef }: CarRefs) {
  // Cụm "road work" ở đầu arm 60° và arm 120°. construction-light = pole (static),
  // construction-barrier + construction-cone = knockable.
  const placements: {
    armDeg: number;
    items: { file: string; along: number; perp: number; rotY: number }[];
  }[] = [
    {
      armDeg: 60,
      items: [
        { file: "construction-barrier.glb", along: 18, perp: 5.2, rotY: 0 },
        { file: "construction-barrier.glb", along: 18, perp: -5.2, rotY: Math.PI },
        { file: "construction-light.glb", along: 21, perp: 5.5, rotY: 0.3 },
        { file: "construction-cone.glb", along: 23, perp: 4.8, rotY: 0 },
        { file: "construction-cone.glb", along: 24.5, perp: -4.5, rotY: 0 }
      ]
    },
    {
      armDeg: 120,
      items: [
        { file: "construction-barrier.glb", along: 19, perp: -5.0, rotY: 0 },
        { file: "construction-light.glb", along: 22, perp: -5.5, rotY: -0.4 },
        { file: "construction-cone.glb", along: 24, perp: -4.7, rotY: 0 }
      ]
    }
  ];

  return (
    <group>
      {placements.flatMap((p) =>
        p.items.map((it, i) => {
          const [dx, dz] = armDirection(p.armDeg);
          const perpX = -dz;
          const perpZ = dx;
          const x = dx * it.along + perpX * it.perp;
          const z = dz * it.along + perpZ * it.perp;
          const rotY = (p.armDeg * Math.PI) / 180 + it.rotY;
          // construction-light là pole (cắm đất) → static. Còn lại knockable.
          if (it.file === "construction-light.glb") {
            return (
              <KenneyProp
                key={`${p.armDeg}-${i}`}
                file={it.file}
                position={[x, 0, z]}
                rotationY={rotY}
                scale={2.5}
              />
            );
          }
          return (
            <KnockableGLTF
              key={`${p.armDeg}-${i}`}
              file={`${KR}/${it.file}`}
              position={[x, 0, z]}
              rotationY={rotY}
              scale={2.5}
              carPositionRef={carPositionRef}
              carVelocityRef={carVelocityRef}
            />
          );
        })
      )}
    </group>
  );
}

// ============== COLLIDERS for static poles/landmarks ==============
export const DECORATION_COLLIDERS: { x: number; z: number; radius: number }[] = [
  // TrafficLights (poles cắm đất)
  ...TRAFFIC_LIGHT_ARMS.map((angleDeg) => {
    const [dx, dz] = armDirection(angleDeg);
    const perpX = -dz;
    const perpZ = dx;
    const r = ROUNDABOUT_RADIUS_OUTER + 2.0;
    const perp = ROAD_WIDTH / 2 + KERB_WIDTH + 1.5;
    return {
      x: dx * r + perpX * perp,
      z: dz * r + perpZ * perp,
      radius: 0.5
    };
  }),
  // ExtraFireHydrants (cắm đất)
  ...[60, 240].map((aDeg) => {
    const [dx, dz] = armDirection(aDeg);
    const perpX = -dz;
    const perpZ = dx;
    const r = ROUNDABOUT_RADIUS_OUTER + 4;
    const perp = ROAD_WIDTH / 2 + KERB_WIDTH + 1.0;
    return {
      x: dx * r + perpX * perp,
      z: dz * r + perpZ * perp,
      radius: 0.6
    };
  }),
  // construction-light (poles)
  ...[
    { armDeg: 60, along: 21, perp: 5.5 },
    { armDeg: 120, along: 22, perp: -5.5 }
  ].map((p) => {
    const [dx, dz] = armDirection(p.armDeg);
    const perpX = -dz;
    const perpZ = dx;
    return {
      x: dx * p.along + perpX * p.perp,
      z: dz * p.along + perpZ * p.perp,
      radius: 0.5
    };
  })
];

// ============== EXPORT MAIN ==============
type DecorationsProps = {
  carPositionRef: React.MutableRefObject<[number, number]>;
  carVelocityRef: React.MutableRefObject<number>;
};

export function Decorations({ carPositionRef, carVelocityRef }: DecorationsProps) {
  return (
    <group>
      <TrafficLights />
      <Barriers carPositionRef={carPositionRef} carVelocityRef={carVelocityRef} />
      <TrashBags carPositionRef={carPositionRef} carVelocityRef={carVelocityRef} />
      <ExtraFireHydrants />
      <WaterTowerOnHorizon />
      <ConstructionProps
        carPositionRef={carPositionRef}
        carVelocityRef={carVelocityRef}
      />
    </group>
  );
}
