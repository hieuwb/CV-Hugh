"use client";

import { useMemo } from "react";

import { Bench, PoleLight } from "./bruno-models";
import {
  ALL_ARM_ANGLES,
  CONTACT_ARM_ANGLE,
  KERB_WIDTH,
  ROAD_WIDTH,
  ROUNDABOUT_RADIUS_OUTER,
  armDirection
} from "@/lib/game-content";

// ---------------------------------------------------------------------
// Scenery v8 — ít hơn + đối xứng 2 bên:
//   • Lamps: 1 cặp (2 đèn 2 bên) mỗi arm ở r=45 (midway) = 12 tổng
//   • Benches: 3 ghế dọc contact arm
// Export LAMP_POSITIONS + BENCH_POSITIONS cho collision.
// ---------------------------------------------------------------------

const OFF_ROAD = ROAD_WIDTH / 2 + KERB_WIDTH + 1.2;
const BENCH_OFF_ROAD = ROAD_WIDTH / 2 + KERB_WIDTH + 2.2;

// Lamp collision radius
export const LAMP_COLLISION_RADIUS = 0.1;
// Bench collision radius
export const BENCH_COLLISION_RADIUS = 0.6;

// ==================== BENCHES ====================
function computeBenchPositions(): { x: number; z: number; rotY: number }[] {
  const [dx, dz] = armDirection(CONTACT_ARM_ANGLE);
  const perpX = -dz;
  const perpZ = dx;
  const armRad = (CONTACT_ARM_ANGLE * Math.PI) / 180;
  const radii = [32, 55, 72];
  return radii.map((r, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const x = dx * r + perpX * BENCH_OFF_ROAD * side;
    const z = dz * r + perpZ * BENCH_OFF_ROAD * side;
    const rotY = armRad + (side > 0 ? -Math.PI / 2 : Math.PI / 2);
    return { x, z, rotY };
  });
}

const BENCHES = computeBenchPositions();
export const BENCH_POSITIONS: [number, number][] = BENCHES.map((b) => [b.x, b.z]);

// ==================== LAMPS ====================
// Giảm 80%: chỉ 4 đèn tổng — 2 cặp đối xứng ở 2 arm điểm nhấn (contact + spawn arm).
// Không có đèn giữa đường; tất cả nằm ngoài kerb.
function computeLampPositions(): { x: number; z: number }[] {
  const out: { x: number; z: number }[] = [];

  // Mid-arm lamps (skills + contact)
  const MID_ARMS = [0, 240];
  for (const angleDeg of MID_ARMS) {
    const [dx, dz] = armDirection(angleDeg);
    const perpX = -dz;
    const perpZ = dx;
    const r = ROUNDABOUT_RADIUS_OUTER + 30;
    for (const side of [1, -1]) {
      out.push({
        x: dx * r + perpX * OFF_ROAD * side,
        z: dz * r + perpZ * OFF_ROAD * side
      });
    }
  }

  // Junction lamps: ở các góc giao giữa arm kerb và roundabout outer kerb.
  // 6 arm × 2 corners = 12 cột đèn đánh dấu lối vào roundabout.
  const JUNC_R = ROUNDABOUT_RADIUS_OUTER + KERB_WIDTH + 0.6;
  const JUNC_PERP = ROAD_WIDTH / 2 + KERB_WIDTH + 0.6;
  for (const angleDeg of ALL_ARM_ANGLES) {
    const [dx, dz] = armDirection(angleDeg);
    const perpX = -dz;
    const perpZ = dx;
    for (const side of [1, -1]) {
      out.push({
        x: dx * JUNC_R + perpX * JUNC_PERP * side,
        z: dz * JUNC_R + perpZ * JUNC_PERP * side
      });
    }
  }

  return out;
}

const LAMPS = computeLampPositions();
export const LAMP_POSITIONS: [number, number][] = LAMPS.map((p) => [p.x, p.z]);

export function RoadLamps() {
  const positions = useMemo(() => LAMPS, []);
  // Perf: chỉ 4 lamp đầu tiên (mid-arm) có pointLight thật, junction lamps
  // chỉ visual emissive (đỡ ~12 dynamic lights).
  return (
    <group>
      {positions.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <PoleLight scale={0.9} />
          {i < 4 && (
            <pointLight
              position={[0, 3.1, 0]}
              color="#ffa050"
              intensity={1.6}
              distance={8}
              decay={2}
            />
          )}
        </group>
      ))}
    </group>
  );
}

export function Benches() {
  return (
    <group>
      {BENCHES.map((p, i) => (
        <Bench
          key={i}
          position={[p.x, 0, p.z]}
          rotationY={p.rotY}
          scale={0.9}
        />
      ))}
    </group>
  );
}

export function Bushes(_: { excludes?: [number, number][] }) {
  return null;
}
