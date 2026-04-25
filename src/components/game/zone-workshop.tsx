"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Mesh, MeshStandardMaterial, type Object3D } from "three";

import { ARM_ANGLES, armDirection } from "@/lib/game-content";

import { KnockableGLTF, isKnockableFile } from "./knockable-gltf";

// ---------------------------------------------------------------------
// Workshop / Garage zone — cụm prop "bụi đời" gần arm projects (300°):
// crates, container, pallet, cinderblock, fire hydrant. Tạo cảm giác
// một góc workshop có máy móc khác hẳn các arm khác.
// ---------------------------------------------------------------------

const ZB = "/models/zombie/Environment";

const PROPS = [
  "Container_Green.gltf",
  "Container_Red.gltf",
  "Pallet.gltf",
  "Pallet_Broken.gltf",
  "CinderBlock.gltf",
  "Chest.gltf",
  "FireHydrant.gltf"
];

PROPS.forEach((p) => useGLTF.preload(`${ZB}/${p}`));

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
  along: number; // radial distance along arm
  perp: number;  // perpendicular offset (positive = right of arm dir)
  rotY: number;  // local rotation
  scale: number;
};

// Cluster bố cục quanh arm 300° (projects) ở khoảng r=18-30, vỉa hè bên ngoài
const ARM_DEG = ARM_ANGLES.projects; // 300°
const SPECS: Spec[] = [
  { file: "Container_Green.gltf", along: 22, perp: 7.5, rotY: 0.3, scale: 1.4 },
  { file: "Container_Red.gltf", along: 22, perp: 11.0, rotY: -0.4, scale: 1.4 },
  { file: "Pallet.gltf", along: 28, perp: 7.0, rotY: 0.6, scale: 1.4 },
  { file: "Pallet_Broken.gltf", along: 30, perp: 8.5, rotY: 1.2, scale: 1.3 },
  { file: "CinderBlock.gltf", along: 25, perp: 6.5, rotY: 0.0, scale: 1.4 },
  { file: "CinderBlock.gltf", along: 26.5, perp: 6.6, rotY: 0.4, scale: 1.4 },
  { file: "Chest.gltf", along: 32, perp: 7.5, rotY: -0.2, scale: 1.5 },
  { file: "FireHydrant.gltf", along: 19, perp: 6.5, rotY: 0, scale: 1.5 }
];

function Prop({ spec }: { spec: Spec }) {
  const gltf = useGLTF(`${ZB}/${spec.file}`);
  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    enhanceProp(c);
    return c;
  }, [gltf.scene]);
  const [dx, dz] = armDirection(ARM_DEG);
  const perpX = -dz;
  const perpZ = dx;
  const x = dx * spec.along + perpX * spec.perp;
  const z = dz * spec.along + perpZ * spec.perp;
  return (
    <primitive
      object={scene}
      position={[x, 0, z]}
      rotation-y={(ARM_DEG * Math.PI) / 180 + spec.rotY}
      scale={spec.scale}
    />
  );
}

// Export collision colliders cho STATIC items only (knockable items handled by physics)
export const WORKSHOP_COLLIDERS: { x: number; z: number; radius: number }[] = SPECS
  .filter((spec) => !isKnockableFile(spec.file))
  .map((spec) => {
    const [dx, dz] = armDirection(ARM_DEG);
    const perpX = -dz;
    const perpZ = dx;
    const x = dx * spec.along + perpX * spec.perp;
    const z = dz * spec.along + perpZ * spec.perp;
    // Container = big (cần radius rộng để xe không xuyên), others smaller
    const isContainer = spec.file.startsWith("Container_");
    const radius = isContainer ? 2.6 * spec.scale : 0.55 * spec.scale;
    return { x, z, radius };
  });

type WorkshopProps = {
  carPositionRef: React.MutableRefObject<[number, number]>;
  carVelocityRef: React.MutableRefObject<number>;
};

export function WorkshopZone({ carPositionRef, carVelocityRef }: WorkshopProps) {
  const [dx, dz] = armDirection(ARM_DEG);
  const perpX = -dz;
  const perpZ = dx;
  return (
    <group>
      {SPECS.map((s, i) => {
        const x = dx * s.along + perpX * s.perp;
        const z = dz * s.along + perpZ * s.perp;
        const rotY = (ARM_DEG * Math.PI) / 180 + s.rotY;
        if (isKnockableFile(s.file)) {
          return (
            <KnockableGLTF
              key={i}
              file={`${ZB}/${s.file}`}
              position={[x, 0, z]}
              rotationY={rotY}
              scale={s.scale}
              carPositionRef={carPositionRef}
              carVelocityRef={carVelocityRef}
            />
          );
        }
        return <Prop key={i} spec={s} />;
      })}
      {/* Warm work-light at zone center */}
      <pointLight
        position={[
          armDirection(ARM_DEG)[0] * 25 + (-armDirection(ARM_DEG)[1]) * 8,
          3.5,
          armDirection(ARM_DEG)[1] * 25 + armDirection(ARM_DEG)[0] * 8
        ]}
        color="#ff7030"
        intensity={5}
        distance={18}
        decay={1.7}
      />
    </group>
  );
}
