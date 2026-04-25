"use client";

import { Billboard, Text, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, Mesh } from "three";

// ---------------------------------------------------------------------
// Hugh's monument — bệ đá lục giác + tablet 2D ảnh avatar (Doraemon × Goku
// Ultra Instinct fusion). Tablet always face camera (Billboard) + glow halo.
// Image path: /images/hero-statue.png — user save vào public/images/
// ---------------------------------------------------------------------

const AVATAR_PATH = "/images/moniker-avatar.png";

function AvatarTablet() {
  const tex = useTexture(AVATAR_PATH);
  return (
    <mesh>
      <planeGeometry args={[2.6, 2.6]} />
      <meshBasicMaterial
        map={tex}
        toneMapped={false}
        transparent
        alphaTest={0.05}
      />
    </mesh>
  );
}

export function Statue() {
  const halo = useRef<Mesh | null>(null);
  const tablet = useRef<Group | null>(null);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (halo.current) {
      halo.current.rotation.z += dt * 0.4;
      halo.current.scale.setScalar(1 + Math.sin(t * 1.6) * 0.08);
    }
    if (tablet.current) {
      tablet.current.position.y = 5.5 + Math.sin(t * 1.2) * 0.15;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Tier 1 — bệ rộng nhất, hexagonal */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.6, 3.8, 0.5, 6]} />
        <meshStandardMaterial color="#1f1018" roughness={1} flatShading />
      </mesh>

      {/* Ring light vàng quanh tier 1 */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[3.7, 3.7, 0.06, 6]} />
        <meshBasicMaterial color="#d98030" toneMapped={false} />
      </mesh>
      <pointLight
        position={[0, 0.5, 0]}
        color="#ff9040"
        intensity={1.4}
        distance={10}
        decay={1.7}
      />

      {/* Tier 2 — hẹp hơn */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.4, 2.8, 0.55, 6]} />
        <meshStandardMaterial color="#2a1224" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 1.16, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.04, 6]} />
        <meshBasicMaterial color="#f4c26b" toneMapped={false} />
      </mesh>

      {/* Tier 3 — đế tablet */}
      <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.4, 1.6]} />
        <meshStandardMaterial color="#3a1d36" roughness={0.95} flatShading />
      </mesh>

      {/* Trụ đỡ tablet (cao hơn để tablet ở y=5.5) */}
      <mesh position={[0, 3.5, -0.05]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 4.0, 8]} />
        <meshStandardMaterial color="#2a1c2a" roughness={0.9} metalness={0.4} />
      </mesh>

      {/* Halo glow phía sau tablet — purple/pink kameha aura */}
      <mesh ref={halo} position={[0, 5.5, -0.15]}>
        <ringGeometry args={[1.4, 1.85, 24]} />
        <meshBasicMaterial
          color="#8a4dff"
          toneMapped={false}
          transparent
          opacity={0.55}
        />
      </mesh>
      <pointLight
        position={[0, 5.5, 0]}
        color="#a060ff"
        intensity={2.2}
        distance={14}
        decay={1.7}
      />

      {/* Avatar tablet + name plate — billboard chung face camera */}
      <group ref={tablet} position={[0, 5.5, 0]}>
        <Billboard follow>
          {/* Glow rim phía sau cùng */}
          <mesh position={[0, 0, -0.04]}>
            <planeGeometry args={[3.1, 3.1]} />
            <meshBasicMaterial
              color="#ff9040"
              toneMapped={false}
              transparent
              opacity={0.45}
            />
          </mesh>
          {/* Frame border đen */}
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[2.85, 2.85]} />
            <meshBasicMaterial color="#0c0820" toneMapped={false} />
          </mesh>
          {/* Avatar */}
          <AvatarTablet />

          {/* Name plate ở PHÍA TRÊN ảnh — xoay cùng billboard */}
          <mesh position={[0, 1.85, 0]} castShadow>
            <boxGeometry args={[2.85, 0.55, 0.08]} />
            <meshStandardMaterial
              color="#3a1c12"
              roughness={0.7}
              metalness={0.5}
            />
          </mesh>
          <Text
            position={[0, 1.85, 0.05]}
            fontSize={0.26}
            color="#ffd479"
            anchorX="center"
            anchorY="middle"
            outlineColor="#1a0d08"
            outlineWidth={0.014}
            maxWidth={2.7}
            letterSpacing={0.1}
          >
            HUGH · pmhieu111.eth
          </Text>
        </Billboard>
      </group>
    </group>
  );
}
