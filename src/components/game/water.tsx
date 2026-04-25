"use client";

// ---------------------------------------------------------------------
// Water v4 — plain plane, no reflection (perf). MeshReflectorMaterial
// re-renders entire scene to texture mỗi frame ⇒ rất tốn FPS.
// ---------------------------------------------------------------------

const SIZE = 1200;

export function Water() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.35, 0]}
      receiveShadow
    >
      <planeGeometry args={[SIZE, SIZE, 1, 1]} />
      <meshStandardMaterial
        color="#0e2832"
        roughness={0.4}
        metalness={0.4}
      />
    </mesh>
  );
}
