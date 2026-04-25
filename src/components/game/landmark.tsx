"use client";

import { Billboard, Html, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { CylinderGeometry, Group, Mesh, MeshStandardMaterial } from "three";

import type { Landmark } from "@/lib/game-content";

import { iconFor } from "./social-icons";

type Props = {
  landmark: Landmark;
  active: boolean;
};

// Landmark: bệ lục giác cream + rim sáng + tinh thể icosa lơ lửng phát sáng
// + biển tên retro sign. Fireflies quanh đỉnh trụ (từ scene level).
export function LandmarkMarker({ landmark, active }: Props) {
  const group = useRef<Group | null>(null);
  const crystal = useRef<Group | null>(null);
  const sign = useRef<Group | null>(null);
  const accent = landmark.accent;
  const SocialIcon = landmark.socialKind ? iconFor(landmark.socialKind) : null;

  const platformMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#2a0e18",
        roughness: 0.85,
        metalness: 0.1,
        flatShading: true
      }),
    []
  );

  const platformEdgeMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: accent,
        roughness: 0.4,
        emissive: accent,
        emissiveIntensity: 0.6,
        toneMapped: false
      }),
    [accent]
  );

  const crystalMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 2.5,
        roughness: 0.15,
        metalness: 0.1,
        toneMapped: false
      }),
    [accent]
  );

  const platformGeo = useMemo(() => new CylinderGeometry(0.65, 0.65, 0.25, 6), []);
  const rimGeo = useMemo(() => new CylinderGeometry(0.72, 0.72, 0.05, 6), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (crystal.current) {
      crystal.current.position.y =
        1.8 + Math.sin(t * 1.6 + landmark.position[0] * 0.3) * 0.2;
      crystal.current.rotation.y += dt * (active ? 1.6 : 0.6);
      crystal.current.rotation.x += dt * 0.25;
    }
    if (sign.current && active) {
      sign.current.rotation.y = Math.sin(t * 2) * 0.04;
    }
  });

  // Visual ring = 50% kích thước trigger radius (user feedback: quá to lấn đường)
  const visualRadius = landmark.radius * 0.5;
  const platformRotationY = Math.PI / 6;

  return (
    <group
      ref={group}
      position={[landmark.position[0], 0, landmark.position[1]]}
    >
      {/* Ring dưới đất khi active */}
      <mesh
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={active}
      >
        <ringGeometry args={[visualRadius - 0.2, visualRadius, 48]} />
        <meshBasicMaterial color={accent} transparent opacity={0.7} toneMapped={false} />
      </mesh>

      {/* Bệ lục giác — nhỏ (half size) */}
      <mesh
        geometry={platformGeo}
        material={platformMat}
        position={[0, 0.15, 0]}
        rotation={[0, platformRotationY, 0]}
        receiveShadow
        castShadow
      />
      <mesh
        geometry={rimGeo}
        material={platformEdgeMat}
        position={[0, 0.29, 0]}
        rotation={[0, platformRotationY, 0]}
      />

      {/* Crystal lơ lửng / Social icon billboard cho contact stops */}
      <group ref={crystal} position={[0, 1.8, 0]}>
        {SocialIcon ? (
          <Html
            center
            transform
            distanceFactor={6}
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                display: "grid",
                placeItems: "center",
                borderRadius: "50%",
                background: "rgba(8, 4, 16, 0.92)",
                border: `2px solid ${accent}`,
                boxShadow: `0 0 18px ${accent}cc, inset 0 0 8px ${accent}55`,
                color: "#ffffff"
              }}
            >
              <SocialIcon size={28} />
            </div>
          </Html>
        ) : (
          <mesh castShadow>
            <icosahedronGeometry args={[landmark.kind === "hero" ? 0.5 : 0.38, 0]} />
            <primitive object={crystalMat} attach="material" />
          </mesh>
        )}
      </group>

      <pointLight
        color={accent}
        intensity={active ? 4 : 1.8}
        distance={14}
        decay={1.5}
        position={[0, 1.8, 0]}
      />

      {/* Biển tên — nhỏ hơn, gần hơn */}
      <group ref={sign} position={[0, 1.0, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.06, 0.6, 0.06]} />
          <meshStandardMaterial color="#1f0b12" roughness={0.9} />
        </mesh>
        <Billboard follow>
          <group>
            <mesh>
              <planeGeometry args={[titleWidth(landmark.title), 0.55]} />
              <meshStandardMaterial
                color="#120612"
                roughness={0.85}
                emissive="#0a0410"
                emissiveIntensity={0.4}
              />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[titleWidth(landmark.title) + 0.1, 0.65]} />
              <meshBasicMaterial color={accent} toneMapped={false} />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={landmark.kind === "hero" ? 0.24 : 0.22}
              color="#ffffff"
              outlineColor="#000"
              outlineWidth={0.01}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.05}
            >
              {landmark.title.toUpperCase()}
            </Text>
          </group>
        </Billboard>
      </group>
    </group>
  );
}

function titleWidth(title: string) {
  return Math.max(1.2, title.length * 0.16 + 0.4);
}
