"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D
} from "three";

// Thin wrappers quanh useGLTF cho asset Bruno Simon (folio-2025, MIT).
// Xem LICENSE-THIRD-PARTY.md. Path: /models/folio2025/*.glb.

const BASE = "/models/folio2025";

useGLTF.preload(`${BASE}/default.glb`);
useGLTF.preload(`${BASE}/scenery.glb`);

function enhanceScene(root: Object3D) {
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

function findChildByName(root: Object3D, name: string): Object3D | null {
  let found: Object3D | null = null;
  root.traverse((n) => {
    if (!found && n.name === name) found = n;
  });
  return found;
}

type BaseProps = {
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
};

// =====================================================================
// VehicleModel:
// - Bruno car với +X forward. Wrap qua rotate Y=π/2 để +X → world -Z.
// - Ẩn wheelContainer gốc (chỉ có 1 wheel, lệch vị trí).
// - 4 bánh cylinder fallback NẰM NGOÀI rotate π/2 group, dùng
//   world-aligned car-local coords (car forward = -Z, right = +X).
// - Spin internal: group.rotation.x quanh local X = axle axis của xe.
// =====================================================================

const WORLD_WHEEL_CORNERS: [number, number][] = [
  [-0.82, -1.05], // FL
  [+0.82, -1.05], // FR
  [-0.82, +1.05], // BL
  [+0.82, +1.05]  // BR
];
const WHEEL_Y = 0.0;

export function VehicleModel({
  scale = 1,
  position = [0, 0, 0],
  velocityRef
}: BaseProps & { velocityRef?: React.MutableRefObject<number> }) {
  const gltf = useGLTF(`${BASE}/default.glb`);

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    enhanceScene(cloned);
    const orig = findChildByName(cloned, "wheelContainer.001");
    if (orig) orig.visible = false;
    return cloned;
  }, [gltf.scene]);

  const wheelGroups = useRef<(Group | null)[]>([null, null, null, null]);

  useFrame((_, dt) => {
    if (!velocityRef) return;
    const spin = velocityRef.current * dt * 1.4;
    for (const g of wheelGroups.current) {
      if (g) g.rotation.x -= spin;
    }
  });

  return (
    <group position={position} scale={scale}>
      <group rotation-y={Math.PI / 2}>
        <primitive object={scene} />
      </group>

      {/* Fallback wheels — OUTSIDE inner rotation, world-aligned. */}
      {WORLD_WHEEL_CORNERS.map(([x, z], i) => (
        <group
          key={i}
          ref={(el) => {
            wheelGroups.current[i] = el;
          }}
          position={[x, WHEEL_Y, z]}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.36, 20]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.92} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.38, 12]} />
            <meshStandardMaterial color="#8a8276" metalness={0.4} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// PoleLight: Victorian-style lantern procedural (giống lantern lồng đèn cũ
// trong reference). Bruno's poleLights.glb là 1 cluster nhiều cột → gây
// hàng trăm cột nếu instance, nên dùng procedural hand-built theo design Bruno.
//   • Bệ vuông 2 tầng + tapered pedestal
//   • Trụ đứng có ring trang trí
//   • Lồng đèn box trong suốt + bóng phát sáng bên trong
//   • Pyramid roof + spike finial
export function PoleLight(props: BaseProps) {
  const bodyColor = "#3a2a3a";
  const bodyDark = "#251a25";
  return (
    <group
      position={props.position ?? [0, 0, 0]}
      rotation-y={props.rotationY ?? 0}
      scale={props.scale ?? 1}
    >
      {/* Base tier 1 — wide square platform */}
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[0.72, 0.2, 0.72]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} metalness={0.35} flatShading />
      </mesh>
      {/* Base tier 2 — smaller square */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.5]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} metalness={0.35} flatShading />
      </mesh>
      {/* Pedestal taper (4-sided) */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.13, 0.2, 0.3, 4]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} metalness={0.35} flatShading />
      </mesh>
      {/* Shaft */}
      <mesh castShadow position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.08, 0.11, 2.3, 10]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} metalness={0.4} />
      </mesh>
      {/* Ring decoration mid-shaft */}
      <mesh position={[0, 2.0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.06, 10]} />
        <meshStandardMaterial color={bodyDark} roughness={0.8} metalness={0.3} />
      </mesh>
      {/* Lantern base collar */}
      <mesh castShadow position={[0, 3.08, 0]}>
        <boxGeometry args={[0.52, 0.08, 0.52]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} metalness={0.35} flatShading />
      </mesh>
      {/* Lantern housing — frame transparent */}
      <mesh castShadow position={[0, 3.45, 0]}>
        <boxGeometry args={[0.44, 0.66, 0.44]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.6}
          metalness={0.45}
          transparent
          opacity={0.5}
          flatShading
        />
      </mesh>
      {/* Inner glowing bulb */}
      <mesh position={[0, 3.45, 0]}>
        <boxGeometry args={[0.28, 0.5, 0.28]} />
        <meshStandardMaterial
          color="#ffb060"
          emissive="#ff8b30"
          emissiveIntensity={1.8}
          toneMapped={false}
          roughness={0.3}
        />
      </mesh>
      {/* Pyramid roof */}
      <mesh castShadow position={[0, 3.95, 0]}>
        <coneGeometry args={[0.34, 0.36, 4]} />
        <meshStandardMaterial color={bodyDark} roughness={0.6} metalness={0.5} flatShading />
      </mesh>
      {/* Finial spike */}
      <mesh castShadow position={[0, 4.28, 0]}>
        <coneGeometry args={[0.035, 0.28, 6]} />
        <meshStandardMaterial color={bodyDark} metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

// Bench: ghế đơn giản — Bruno's benches.glb cũng là 1 cụm. Tự vẽ: mặt + 2 chân.
export function Bench(props: BaseProps) {
  return (
    <group
      position={props.position ?? [0, 0, 0]}
      rotation-y={props.rotationY ?? 0}
      scale={props.scale ?? 1}
    >
      <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[1.8, 0.08, 0.5]} />
        <meshStandardMaterial color="#8b6a3d" roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.95, -0.21]}>
        <boxGeometry args={[1.8, 0.6, 0.08]} />
        <meshStandardMaterial color="#8b6a3d" roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow position={[-0.75, 0.27, 0]}>
        <boxGeometry args={[0.12, 0.55, 0.45]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.95} flatShading />
      </mesh>
      <mesh castShadow position={[0.75, 0.27, 0]}>
        <boxGeometry args={[0.12, 0.55, 0.45]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.95} flatShading />
      </mesh>
    </group>
  );
}

export function Scenery(props: BaseProps) {
  const gltf = useGLTF(`${BASE}/scenery.glb`);
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    enhanceScene(cloned);
    return cloned;
  }, [gltf.scene]);
  return (
    <group
      position={props.position ?? [0, 0, 0]}
      rotation-y={props.rotationY ?? 0}
      scale={props.scale ?? 1}
    >
      <primitive object={scene} />
    </group>
  );
}

export { Group };
