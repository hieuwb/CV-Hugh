"use client";

import { useMemo } from "react";
import {
  ExtrudeGeometry,
  Path,
  Shape,
  type BufferGeometry
} from "three";

import {
  ALL_ARM_ANGLES,
  ASPHALT_COLOR,
  KERB_COLOR,
  KERB_HEIGHT,
  KERB_WIDTH,
  RING_INNER_RADIUS,
  RING_OUTER_RADIUS,
  ROAD_WIDTH,
  ROUNDABOUT_RADIUS_INNER,
  ROUNDABOUT_RADIUS_OUTER,
  TERRAIN_RADIUS_V2
} from "@/lib/game-content";

// ---------------------------------------------------------------------
// Ground v9:
//   • Đường nhựa + kerb 2 bên arm (shortened để không chắn ring)
//   • Ring road lớn, KHÔNG vạch kẻ (user yêu cầu)
//   • Ring INNER kerb có 6 gaps tại mỗi cửa arm (xe qua được)
//   • Ring OUTER kerb liền (không ai vào từ ngoài)
//   • Terrain r=97; ngoài là beach + water
// ---------------------------------------------------------------------

export const TERRAIN_RADIUS = TERRAIN_RADIUS_V2;

// Gap góc cho ring inner kerb (khoảng trống ở mỗi cửa arm).
// arc length = (ROAD_WIDTH + 2 * KERB_WIDTH) tại radius = RING_INNER.
// angleGap = arcLen / R
const ARM_GAP_ANGLE =
  (ROAD_WIDTH + 2 * KERB_WIDTH + 0.4) / RING_INNER_RADIUS;

export function Ground() {
  return (
    <group>
      {/* Grass terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[TERRAIN_RADIUS, 80]} />
        <meshStandardMaterial color="#355f35" roughness={1} />
      </mesh>

      {/* Beach ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[TERRAIN_RADIUS, TERRAIN_RADIUS + 6, 96]} />
        <meshStandardMaterial color="#d49a6a" roughness={1} />
      </mesh>

      {/* Ring road asphalt (không vạch kẻ) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <ringGeometry args={[RING_INNER_RADIUS, RING_OUTER_RADIUS, 96]} />
        <meshStandardMaterial color={ASPHALT_COLOR} roughness={0.95} />
      </mesh>

      {/* 6 radial arm roads */}
      {ALL_ARM_ANGLES.map((angleDeg) => (
        <RadialAsphaltRoad key={angleDeg} angleDeg={angleDeg} />
      ))}

      {/* Arm kerbs — shortened 0.5 mỗi đầu để không dè ring/roundabout */}
      {ALL_ARM_ANGLES.map((angleDeg) => (
        <ArmKerb key={`kerb-${angleDeg}`} angleDeg={angleDeg} />
      ))}

      {/* Ring OUTER kerb (liền) */}
      <FullRingKerb radius={RING_OUTER_RADIUS + KERB_WIDTH / 2} />

      {/* Ring INNER kerb — 6 gaps tại mỗi cửa arm */}
      <RingKerbWithGaps
        radius={RING_INNER_RADIUS - KERB_WIDTH / 2}
        gapAngleRad={ARM_GAP_ANGLE}
      />

      {/* Roundabout asphalt + kerbs */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <ringGeometry args={[ROUNDABOUT_RADIUS_INNER, ROUNDABOUT_RADIUS_OUTER, 64]} />
        <meshStandardMaterial color={ASPHALT_COLOR} roughness={0.95} />
      </mesh>

      {/* Yellow paint ring quanh mép trong roundabout */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.028, 0]}>
        <ringGeometry
          args={[
            ROUNDABOUT_RADIUS_INNER + 0.1,
            ROUNDABOUT_RADIUS_INNER + 0.4,
            64
          ]}
        />
        <meshStandardMaterial color="#7a5e2a" roughness={1} />
      </mesh>

      {/* Crosswalks (vạch ngựa vằn) ở mỗi cửa arm */}
      {ALL_ARM_ANGLES.map((deg) => (
        <Crosswalk key={`xwalk-${deg}`} angleDeg={deg} />
      ))}
      {/* Roundabout OUTER kerb với 6 gaps cho arm */}
      <RingKerbWithGaps
        radius={ROUNDABOUT_RADIUS_OUTER + KERB_WIDTH / 2}
        gapAngleRad={
          (ROAD_WIDTH + 2 * KERB_WIDTH + 0.4) / ROUNDABOUT_RADIUS_OUTER
        }
      />
      {/* Roundabout INNER kerb (liền, bảo vệ pedestal) */}
      <FullRingKerb
        radius={ROUNDABOUT_RADIUS_INNER - KERB_WIDTH / 2}
        highlight
      />

      {/* Pedestal đá ở tâm */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <circleGeometry args={[ROUNDABOUT_RADIUS_INNER - KERB_WIDTH, 32]} />
        <meshStandardMaterial color="#5c4638" roughness={1} />
      </mesh>
    </group>
  );
}

// =====================================================================
// Radial asphalt road + dashed centerline
// =====================================================================
function RadialAsphaltRoad({ angleDeg }: { angleDeg: number }) {
  const rad = (angleDeg * Math.PI) / 180;
  const rStart = ROUNDABOUT_RADIUS_OUTER - ROAD_WIDTH * 0.72;
  const rEnd = RING_INNER_RADIUS + ROAD_WIDTH * 0.72;
  const length = rEnd - rStart;
  const midR = (rStart + rEnd) / 2;
  const midX = Math.cos(rad) * midR;
  const midZ = -Math.sin(rad) * midR;

  // Vạch kẻ chỉ phủ phần arm road thực tế (giữa roundabout outer và ring inner),
  // KHÔNG kéo vào trong vòng xoay hoặc ring road.
  const dashRStart = ROUNDABOUT_RADIUS_OUTER + 1.5;
  const dashREnd = RING_INNER_RADIUS - 1.5;
  const dashSpan = dashREnd - dashRStart;
  const dashes = Math.max(4, Math.floor(dashSpan / 4));
  const dashLen = 1.8;
  const totalDashSpace = dashSpan - dashes * dashLen;
  const gap = dashes > 1 ? totalDashSpace / (dashes - 1) : 0;

  return (
    <group position={[midX, 0.015, midZ]} rotation-y={rad}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[length, ROAD_WIDTH]} />
        <meshStandardMaterial color={ASPHALT_COLOR} roughness={0.95} />
      </mesh>
      {Array.from({ length: dashes }).map((_, i) => {
        const r = dashRStart + dashLen / 2 + i * (dashLen + gap);
        const localX = r - midR;
        return (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[localX, 0.005, 0]}
          >
            <planeGeometry args={[dashLen, 0.18]} />
            <meshStandardMaterial color="#807060" roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

// =====================================================================
// Arm kerb — full length (0 gap) để liền mạch với ring/roundabout kerb
// (ring/roundabout kerb đã có arm-angle gap tương ứng).
// =====================================================================
// Arm kerb không nhô ra khỏi ring/roundabout kerb (= 0). Dùng bụi cây để
// che các góc 90° giao nhau (xem JUNCTION_BUSH_SPOTS trong forest.tsx).
const ARM_KERB_OVERLAP = 0;

function ArmKerb({ angleDeg }: { angleDeg: number }) {
  const rad = (angleDeg * Math.PI) / 180;
  const dirX = Math.cos(rad);
  const dirZ = -Math.sin(rad);
  const perpX = -dirZ;
  const perpZ = dirX;
  const halfRoad = ROAD_WIDTH / 2;

  const rStart = ROUNDABOUT_RADIUS_OUTER - ARM_KERB_OVERLAP;
  const rEnd = RING_INNER_RADIUS + ARM_KERB_OVERLAP;
  const length = rEnd - rStart;
  const midR = (rStart + rEnd) / 2;

  const kerbOffset = halfRoad + KERB_WIDTH / 2;
  const centerX = dirX * midR;
  const centerZ = dirZ * midR;

  return (
    <group>
      {[1, -1].map((side) => {
        const x = centerX + perpX * kerbOffset * side;
        const z = centerZ + perpZ * kerbOffset * side;
        return (
          <group key={side} position={[x, 0, z]} rotation-y={rad}>
            <mesh position={[0, KERB_HEIGHT / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[length, KERB_HEIGHT, KERB_WIDTH]} />
              <meshStandardMaterial color={KERB_COLOR} roughness={0.85} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// =====================================================================
// Full ring kerb (annulus liền)
// =====================================================================
function FullRingKerb({
  radius,
  highlight
}: {
  radius: number;
  highlight?: boolean;
}) {
  const geometry: BufferGeometry = useMemo(() => {
    const outer = radius + KERB_WIDTH / 2;
    const inner = radius - KERB_WIDTH / 2;
    const shape = new Shape();
    shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
    const hole = new Path();
    hole.absarc(0, 0, inner, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    return new ExtrudeGeometry(shape, {
      depth: KERB_HEIGHT,
      bevelEnabled: false,
      curveSegments: 72
    });
  }, [radius]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        color={highlight ? "#ffd479" : KERB_COLOR}
        roughness={0.85}
        emissive={highlight ? "#ffb347" : "#000000"}
        emissiveIntensity={highlight ? 0.4 : 0}
      />
    </mesh>
  );
}

// =====================================================================
// Ring kerb với 6 gaps (không liền, hở tại mỗi cửa arm)
// Render bằng 6 arcs riêng biệt.
// =====================================================================
function RingKerbWithGaps({
  radius,
  gapAngleRad
}: {
  radius: number;
  gapAngleRad: number;
}) {
  // 6 arcs giữa các arm angles
  const arcs = useMemo(() => {
    const outer = radius + KERB_WIDTH / 2;
    const inner = radius - KERB_WIDTH / 2;
    const out: BufferGeometry[] = [];
    const armRads = ALL_ARM_ANGLES.map((a) => (a * Math.PI) / 180);
    // Sort ascending để arc đi theo chiều CCW
    const sortedArms = [...armRads].sort((a, b) => a - b);

    for (let i = 0; i < sortedArms.length; i++) {
      const startArm = sortedArms[i];
      const endArm = sortedArms[(i + 1) % sortedArms.length];
      // Từ startArm + gapAngle/2 đến endArm - gapAngle/2
      let from = startArm + gapAngleRad / 2;
      let to = endArm - gapAngleRad / 2;
      if (to < from) to += Math.PI * 2;

      const shape = new Shape();
      shape.absarc(0, 0, outer, from, to, false);
      shape.absarc(0, 0, inner, to, from, true);
      const geom = new ExtrudeGeometry(shape, {
        depth: KERB_HEIGHT,
        bevelEnabled: false,
        curveSegments: 32
      });
      out.push(geom);
    }
    return out;
  }, [radius, gapAngleRad]);

  return (
    <group>
      {arcs.map((g, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <primitive object={g} attach="geometry" />
          <meshStandardMaterial color={KERB_COLOR} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

// =====================================================================
// Crosswalk (vạch ngựa vằn) ở mép roundabout, mỗi cửa arm
// =====================================================================
function Crosswalk({ angleDeg }: { angleDeg: number }) {
  const rad = (angleDeg * Math.PI) / 180;
  const dirX = Math.cos(rad);
  const dirZ = -Math.sin(rad);
  const r = ROUNDABOUT_RADIUS_OUTER + 1.4;
  const cx = dirX * r;
  const cz = dirZ * r;

  const stripeCount = 5;
  const stripeWidth = 0.45;
  const stripeGap = 0.42;
  const stripeLen = ROAD_WIDTH * 0.75;
  const totalSpan = stripeCount * stripeWidth + (stripeCount - 1) * stripeGap;
  const startOffset = -totalSpan / 2 + stripeWidth / 2;

  return (
    <group position={[cx, 0.022, cz]} rotation-y={rad}>
      {Array.from({ length: stripeCount }).map((_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[startOffset + i * (stripeWidth + stripeGap), 0.002, 0]}
        >
          <planeGeometry args={[stripeWidth, stripeLen]} />
          <meshStandardMaterial color="#85786a" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}
