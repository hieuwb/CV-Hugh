"use client";

import { Text } from "@react-three/drei";
import { useMemo } from "react";

import {
  ARM_ANGLES,
  KERB_WIDTH,
  ROAD_WIDTH,
  ROUNDABOUT_RADIUS_OUTER,
  armDirection
} from "@/lib/game-content";

// ---------------------------------------------------------------------
// Wooden directional signposts at each arm entry — gỗ + 1-2 plank, accent
// glow, label hướng về center. Reference: cozy low-poly portfolio with
// stacked sign boards (ABOUT ME / SKILLS / CONTACT...).
// ---------------------------------------------------------------------

type SignSpec = {
  armDeg: number;
  side: 1 | -1;
  boards: { label: string; accent: string }[];
};

// 4 cửa arm có signpost (skills, journey, story, cv).
// Projects + Contact arm dùng landmark riêng (cluster + 7 stops) nên skip.
const SIGNS: SignSpec[] = [
  {
    armDeg: ARM_ANGLES.skills,
    side: 1,
    boards: [{ label: "KỸ NĂNG", accent: "#72d9ff" }]
  },
  {
    armDeg: ARM_ANGLES.journey,
    side: -1,
    boards: [{ label: "HÀNH TRÌNH", accent: "#c28bff" }]
  },
  {
    armDeg: ARM_ANGLES.story,
    side: 1,
    boards: [{ label: "GIỚI THIỆU", accent: "#ff7b4a" }]
  },
  {
    armDeg: ARM_ANGLES.cv,
    side: -1,
    boards: [{ label: "CV PDF", accent: "#9cff9c" }]
  },
  {
    armDeg: ARM_ANGLES.contact,
    side: 1,
    boards: [{ label: "LIÊN HỆ", accent: "#ff7a7a" }]
  },
  {
    armDeg: ARM_ANGLES.projects,
    side: -1,
    boards: [{ label: "DỰ ÁN", accent: "#ffb347" }]
  }
];

const POST_OFFSET = ROAD_WIDTH / 2 + KERB_WIDTH + 1.6;
const POST_RADIUS = ROUNDABOUT_RADIUS_OUTER + 4;

// Export collision colliders cho player-car
export const SIGNPOST_COLLIDERS: { x: number; z: number; radius: number }[] = SIGNS.map(
  (spec) => {
    const [dx, dz] = armDirection(spec.armDeg);
    const perpX = -dz;
    const perpZ = dx;
    const x = dx * POST_RADIUS + perpX * POST_OFFSET * spec.side;
    const z = dz * POST_RADIUS + perpZ * POST_OFFSET * spec.side;
    return { x, z, radius: 0.4 };
  }
);

function Signpost({ spec }: { spec: SignSpec }) {
  const [dx, dz] = useMemo(() => armDirection(spec.armDeg), [spec.armDeg]);
  const perpX = -dz;
  const perpZ = dx;
  const x = dx * POST_RADIUS + perpX * POST_OFFSET * spec.side;
  const z = dz * POST_RADIUS + perpZ * POST_OFFSET * spec.side;

  // Text trên plank mặt local +Z. Sau rotateY(θ), local +Z → (sinθ, cosθ).
  // Driver đi outward từ center có forward = armDir. Text phải face TOWARD driver
  // = -armDir. Required: (sinθ, cosθ) = -armDir = (-cos(armDeg), sin(armDeg)).
  // ⇒ θ = armRad - π/2 (verified for all 6 arms).
  const facing = (spec.armDeg * Math.PI) / 180 - Math.PI / 2;

  return (
    <group position={[x, 0, z]} rotation-y={facing}>
      {/* Wooden post */}
      <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[0.16, 2.2, 0.16]} />
        <meshStandardMaterial color="#5a3820" roughness={0.95} flatShading />
      </mesh>
      {/* Foot stone */}
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[0.42, 0.16, 0.42]} />
        <meshStandardMaterial color="#3a2a20" roughness={1} flatShading />
      </mesh>
      {/* Boards */}
      {spec.boards.map((b, i) => {
        const y = 1.85 - i * 0.55;
        return (
          <group key={i} position={[0, y, 0]}>
            {/* Plank */}
            <mesh castShadow position={[0.45, 0, 0.04]}>
              <boxGeometry args={[1.6, 0.42, 0.08]} />
              <meshStandardMaterial color="#7a4a26" roughness={0.92} flatShading />
            </mesh>
            {/* Accent border bar */}
            <mesh position={[0.45, -0.16, 0.09]}>
              <boxGeometry args={[1.55, 0.04, 0.02]} />
              <meshStandardMaterial
                color={b.accent}
                emissive={b.accent}
                emissiveIntensity={0.8}
                toneMapped={false}
              />
            </mesh>
            {/* Pointer arrow tip on the leading edge */}
            <mesh
              castShadow
              position={[1.32, 0, 0.04]}
              rotation={[0, 0, Math.PI / 4]}
            >
              <boxGeometry args={[0.3, 0.3, 0.08]} />
              <meshStandardMaterial color="#7a4a26" roughness={0.92} flatShading />
            </mesh>
            {/* Label text */}
            <Text
              position={[0.45, 0.02, 0.09]}
              fontSize={0.18}
              color="#fff7de"
              outlineColor="#1a0d08"
              outlineWidth={0.012}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.06}
              maxWidth={1.4}
            >
              {b.label}
            </Text>
          </group>
        );
      })}
      {/* Lantern on top */}
      <mesh castShadow position={[0, 2.4, 0]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial
          color="#ffb040"
          emissive="#ff8820"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        position={[0, 2.4, 0]}
        color="#ffb040"
        intensity={1.6}
        distance={6}
        decay={1.7}
      />
    </group>
  );
}

export function Signposts() {
  return (
    <group>
      {SIGNS.map((s, i) => (
        <Signpost key={i} spec={s} />
      ))}
    </group>
  );
}
