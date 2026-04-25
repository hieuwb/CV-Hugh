"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group, MathUtils, SpotLight, Vector3 } from "three";

import {
  ALL_ARM_ANGLES,
  ALL_LANDMARKS,
  KERB_WIDTH,
  RING_INNER_RADIUS,
  RING_OUTER_RADIUS,
  ROAD_WIDTH,
  ROUNDABOUT_RADIUS_INNER,
  ROUNDABOUT_RADIUS_OUTER,
  armDirection
} from "@/lib/game-content";

import { DEBRIS_COLLIDERS } from "./apocalypse-debris";
import { audioBus } from "./audio-bus";
import { VehicleModel } from "./bruno-models";
import { DECORATION_COLLIDERS } from "./decorations";
import { TREE_COLLISION_RADIUS, TREE_POSITIONS } from "./forest";
import { SIGNPOST_COLLIDERS } from "./signposts";
import { WORKSHOP_COLLIDERS } from "./zone-workshop";
import { ZONE_COLLIDERS } from "./zones";
import {
  BENCH_COLLISION_RADIUS,
  BENCH_POSITIONS,
  LAMP_COLLISION_RADIUS,
  LAMP_POSITIONS
} from "./scenery";
import type { ControlsState } from "./use-controls";

function collisionRadiusFor(landmarkId: string): number {
  if (landmarkId.startsWith("proj-")) return 1.1;
  if (landmarkId === "hero") return 2;
  return 1.3;
}
const CAR_COLLISION_RADIUS = 1.0;

// ---------- Kerb check ----------
// Trả về true nếu (x, z) đang ĐÈ LÊN kerb (arm hoặc ring/roundabout).
// Chú ý: ring inner kerb + roundabout outer kerb có 6 GAP tại cửa arm.
// Trong các gap đó không có kerb → không trigger bump (user complaint).
function isOnKerb(x: number, z: number): boolean {
  const r = Math.hypot(x, z);

  // Góc cực hiện tại trong world XZ (atan2(-z, x) vì convention -Z = "up")
  const carAngleRad = Math.atan2(-z, x);

  // Helper: player có trong "gap zone" ở radius R không (tại mỗi arm).
  function isInArmGap(radius: number): boolean {
    // gap arc width = (ROAD_WIDTH + 2*KERB_WIDTH + 0.4) / radius
    const gapHalf = (ROAD_WIDTH + 2 * KERB_WIDTH + 0.4) / (2 * radius);
    for (const angleDeg of ALL_ARM_ANGLES) {
      const armRad = (angleDeg * Math.PI) / 180;
      let diff = Math.abs(carAngleRad - armRad);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff < gapHalf) return true;
    }
    return false;
  }

  // Ring inner kerb: có gap tại arm angles
  if (r >= RING_INNER_RADIUS - KERB_WIDTH && r <= RING_INNER_RADIUS) {
    if (!isInArmGap(RING_INNER_RADIUS)) return true;
  }
  // Ring outer kerb: FULL (không gap)
  if (r >= RING_OUTER_RADIUS && r <= RING_OUTER_RADIUS + KERB_WIDTH)
    return true;
  // Roundabout inner kerb: FULL
  if (
    r >= ROUNDABOUT_RADIUS_INNER - KERB_WIDTH &&
    r <= ROUNDABOUT_RADIUS_INNER
  )
    return true;
  // Roundabout outer kerb: có gap tại arm angles
  if (
    r >= ROUNDABOUT_RADIUS_OUTER &&
    r <= ROUNDABOUT_RADIUS_OUTER + KERB_WIDTH
  ) {
    if (!isInArmGap(ROUNDABOUT_RADIUS_OUTER)) return true;
  }

  // Arm kerbs: dải rectangular 2 bên, bắt đầu từ RA_OUTER đến RING_INNER
  const halfRoad = ROAD_WIDTH / 2;
  for (const angleDeg of ALL_ARM_ANGLES) {
    const [dx, dz] = armDirection(angleDeg);
    const along = x * dx + z * dz;
    const perp = x * (-dz) + z * dx;
    if (along < ROUNDABOUT_RADIUS_OUTER || along > RING_INNER_RADIUS) continue;
    const absPerp = Math.abs(perp);
    if (absPerp >= halfRoad && absPerp <= halfRoad + KERB_WIDTH) return true;
  }

  return false;
}

type Props = {
  controls: React.MutableRefObject<ControlsState>;
  onPositionChange: (x: number, z: number) => void;
  // Expose velocity cho VehicleModel tự quay bánh, và cho KnockableBricks
  // dùng để tính lực tông.
  velocityRef?: React.MutableRefObject<number>;
  worldPositionRef?: React.MutableRefObject<[number, number]>;
};

const MAX_SPEED = 16;
const ACCEL = 32;
const TURN_SPEED = 2.5;
const FRICTION = 7;
const BOOST_MULT = 1.8;

const BASE_Y = 0.22;
const GRAVITY = 22;
const KERB_BUMP_VY = 3.8;

export function PlayerCar({
  controls,
  onPositionChange,
  velocityRef,
  worldPositionRef
}: Props) {
  const group = useRef<Group | null>(null);
  const bodyTilt = useRef<Group | null>(null);
  const headlightRef = useRef<SpotLight | null>(null);
  const headlightTargetRef = useRef<Group | null>(null);

  useEffect(() => {
    if (headlightRef.current && headlightTargetRef.current) {
      headlightRef.current.target = headlightTargetRef.current;
    }
  }, []);
  const velocity = useRef(0);
  const vy = useRef(0);               // vertical velocity cho bump effect
  const wasOnKerb = useRef(false);    // edge detection để bump 1 lần khi lên
  const wasColliding = useRef(false); // edge detect cho impact sfx
  const wasBoost = useRef(false);     // edge detect cho boost whoosh
  const { camera } = useThree();
  const cameraTarget = useRef(new Vector3());
  const cameraPos = useRef(new Vector3());
  const desiredCamPos = new Vector3();
  const forward = new Vector3();

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;

    const c = controls.current;

    // Reset (R): về spawn
    if (c.reset) {
      g.position.set(0, 0.22, 4);
      g.rotation.set(0, 0, 0);
      velocity.current = 0;
      c.reset = 0;
    }

    const joyForward = -c.joystickY;
    const joyTurn = c.joystickX;

    const fwdInput = MathUtils.clamp(c.forward - c.backward + joyForward, -1, 1);
    const turnInput = MathUtils.clamp(c.right - c.left + joyTurn, -1, 1);

    const turnFactor = 0.35 + Math.min(1, Math.abs(velocity.current) / 6) * 0.65;
    g.rotation.y -= turnInput * TURN_SPEED * dt * turnFactor;

    const accel = fwdInput * ACCEL * (c.boost ? BOOST_MULT : 1);
    velocity.current += accel * dt;
    if (fwdInput === 0) {
      const decel = FRICTION * dt * Math.sign(velocity.current);
      if (Math.abs(decel) > Math.abs(velocity.current)) velocity.current = 0;
      else velocity.current -= decel;
    }
    const cap = MAX_SPEED * (c.boost ? BOOST_MULT : 1);
    velocity.current = MathUtils.clamp(velocity.current, -MAX_SPEED * 0.6, cap);

    forward.set(0, 0, -1).applyEuler(g.rotation);
    g.position.addScaledVector(forward, velocity.current * dt);

    // Không clamp edge — xe có thể chạy mãi ra rìa (water sẽ kéo dài vô hạn
    // qua scene-scale plane).

    let collidedThisFrame = false;
    const preSpeed = Math.abs(velocity.current);

    // Collision với landmarks
    for (const l of ALL_LANDMARKS) {
      const dx = g.position.x - l.position[0];
      const dz = g.position.z - l.position[1];
      const d = Math.hypot(dx, dz);
      const minDist = CAR_COLLISION_RADIUS + collisionRadiusFor(l.id);
      if (d < minDist && d > 0.01) {
        const k = minDist / d;
        g.position.x = l.position[0] + dx * k;
        g.position.z = l.position[1] + dz * k;
        velocity.current *= -0.35;
        collidedThisFrame = true;
      }
    }

    // Collision với benches
    for (const b of BENCH_POSITIONS) {
      const dx = g.position.x - b[0];
      const dz = g.position.z - b[1];
      const d = Math.hypot(dx, dz);
      const minDist = CAR_COLLISION_RADIUS + BENCH_COLLISION_RADIUS;
      if (d < minDist && d > 0.01) {
        const k = minDist / d;
        g.position.x = b[0] + dx * k;
        g.position.z = b[1] + dz * k;
        velocity.current *= -0.4;
        collidedThisFrame = true;
      }
    }

    // Collision với lamp posts (cột đèn)
    for (const p of LAMP_POSITIONS) {
      const dx = g.position.x - p[0];
      const dz = g.position.z - p[1];
      const d = Math.hypot(dx, dz);
      const minDist = CAR_COLLISION_RADIUS + LAMP_COLLISION_RADIUS;
      if (d < minDist && d > 0.01) {
        const k = minDist / d;
        g.position.x = p[0] + dx * k;
        g.position.z = p[1] + dz * k;
        velocity.current *= -0.45;
        collidedThisFrame = true;
      }
    }

    // Collision với trees (thân cây)
    for (const p of TREE_POSITIONS) {
      const dx = g.position.x - p[0];
      const dz = g.position.z - p[1];
      const d = Math.hypot(dx, dz);
      const minDist = CAR_COLLISION_RADIUS + TREE_COLLISION_RADIUS;
      if (d < minDist && d > 0.01) {
        const k = minDist / d;
        g.position.x = p[0] + dx * k;
        g.position.z = p[1] + dz * k;
        velocity.current *= -0.3;
        collidedThisFrame = true;
      }
    }

    // Collision với abandoned vehicles + debris
    for (const c of DEBRIS_COLLIDERS) {
      const dx = g.position.x - c.x;
      const dz = g.position.z - c.z;
      const d = Math.hypot(dx, dz);
      const minDist = CAR_COLLISION_RADIUS + c.radius;
      if (d < minDist && d > 0.01) {
        const k = minDist / d;
        g.position.x = c.x + dx * k;
        g.position.z = c.z + dz * k;
        velocity.current *= -0.4;
        collidedThisFrame = true;
      }
    }

    // Collision với workshop zone props (containers, chest, fire hydrant)
    for (const c of WORKSHOP_COLLIDERS) {
      const dx = g.position.x - c.x;
      const dz = g.position.z - c.z;
      const d = Math.hypot(dx, dz);
      const minDist = CAR_COLLISION_RADIUS + c.radius;
      if (d < minDist && d > 0.01) {
        const k = minDist / d;
        g.position.x = c.x + dx * k;
        g.position.z = c.z + dz * k;
        velocity.current *= -0.4;
        collidedThisFrame = true;
      }
    }

    // Collision với 5 arm zones props (couches, containers, chests, etc.)
    for (const c of ZONE_COLLIDERS) {
      const dx = g.position.x - c.x;
      const dz = g.position.z - c.z;
      const d = Math.hypot(dx, dz);
      const minDist = CAR_COLLISION_RADIUS + c.radius;
      if (d < minDist && d > 0.01) {
        const k = minDist / d;
        g.position.x = c.x + dx * k;
        g.position.z = c.z + dz * k;
        velocity.current *= -0.4;
        collidedThisFrame = true;
      }
    }

    // Collision với signposts (post + plank)
    for (const c of SIGNPOST_COLLIDERS) {
      const dx = g.position.x - c.x;
      const dz = g.position.z - c.z;
      const d = Math.hypot(dx, dz);
      const minDist = CAR_COLLISION_RADIUS + c.radius;
      if (d < minDist && d > 0.01) {
        const k = minDist / d;
        g.position.x = c.x + dx * k;
        g.position.z = c.z + dz * k;
        velocity.current *= -0.45;
        collidedThisFrame = true;
      }
    }

    // Collision với decorations (TrafficLight, FireHydrant, etc.)
    for (const c of DECORATION_COLLIDERS) {
      const dx = g.position.x - c.x;
      const dz = g.position.z - c.z;
      const d = Math.hypot(dx, dz);
      const minDist = CAR_COLLISION_RADIUS + c.radius;
      if (d < minDist && d > 0.01) {
        const k = minDist / d;
        g.position.x = c.x + dx * k;
        g.position.z = c.z + dz * k;
        velocity.current *= -0.45;
        collidedThisFrame = true;
      }
    }

    // Impact SFX: rising-edge, intensity theo tốc độ trước va
    if (collidedThisFrame && !wasColliding.current) {
      audioBus.impact(Math.min(1, preSpeed / MAX_SPEED));
    }
    wasColliding.current = collidedThisFrame;

    // Boost SFX: rising-edge khi nhấn Shift
    const boostNow = !!c.boost && Math.abs(velocity.current) > 3;
    if (boostNow && !wasBoost.current) audioBus.boost();
    wasBoost.current = boostNow;

    // Engine: pitch + gain theo tốc độ
    audioBus.engine(Math.abs(velocity.current) / (MAX_SPEED * BOOST_MULT));

    // ---------- Kerb bump effect ----------
    // Khi xe VỪA đi từ ngoài-kerb LÊN trên kerb (edge detect), cho Y velocity
    // nhảy. Gravity sẽ kéo về. Scale với speed để chạy nhanh → bay cao hơn.
    const onKerbNow = isOnKerb(g.position.x, g.position.z);
    if (onKerbNow && !wasOnKerb.current) {
      const speedFactor = Math.min(1, Math.abs(velocity.current) / 6);
      vy.current = KERB_BUMP_VY * (0.5 + speedFactor);
    }
    wasOnKerb.current = onKerbNow;

    // Integrate vertical position (gravity + vy)
    vy.current -= GRAVITY * dt;
    g.position.y += vy.current * dt;
    if (g.position.y <= BASE_Y) {
      g.position.y = BASE_Y;
      if (vy.current < 0) vy.current = 0;
    }

    if (bodyTilt.current) {
      bodyTilt.current.rotation.z = MathUtils.lerp(
        bodyTilt.current.rotation.z,
        -turnInput * 0.12,
        1 - Math.exp(-dt * 12)
      );
      bodyTilt.current.rotation.x = MathUtils.lerp(
        bodyTilt.current.rotation.x,
        -fwdInput * 0.04,
        1 - Math.exp(-dt * 12)
      );
    }

    // Camera: thấp + nghiêng hơn, lookAt ở phía trước xe → xe nằm ~1/3 khung hình.
    // Khi gần landmark thì zoom nhẹ + lookAt xe trực tiếp (showcase).
    let nearLandmark = false;
    for (const l of ALL_LANDMARKS) {
      const dx = g.position.x - l.position[0];
      const dz = g.position.z - l.position[1];
      const r = l.radius * 1.6;
      if (dx * dx + dz * dz < r * r) {
        nearLandmark = true;
        break;
      }
    }

    const FOLLOW_BACK = nearLandmark ? 7 : 10;
    const FOLLOW_HEIGHT = nearLandmark ? 3.6 : 4.6;
    const LOOK_AHEAD = nearLandmark ? 1.5 : 5.0;

    desiredCamPos
      .copy(g.position)
      .add(forward.clone().multiplyScalar(-FOLLOW_BACK))
      .setY(FOLLOW_HEIGHT);
    cameraPos.current.lerp(desiredCamPos, 1 - Math.exp(-dt * 4));
    camera.position.copy(cameraPos.current);

    const lookTargetVec = forward
      .clone()
      .multiplyScalar(LOOK_AHEAD)
      .add(g.position)
      .setY(g.position.y + 0.5);
    cameraTarget.current.lerp(lookTargetVec, 1 - Math.exp(-dt * 6));
    camera.lookAt(cameraTarget.current);

    // Expose state cho VehicleModel (bánh xe) + KnockableBricks + Minimap
    if (velocityRef) velocityRef.current = velocity.current;
    if (worldPositionRef) {
      worldPositionRef.current[0] = g.position.x;
      worldPositionRef.current[1] = g.position.z;
    }

    onPositionChange(g.position.x, g.position.z);
  });

  const internalVelocityRef = useRef(0);
  useFrame(() => {
    internalVelocityRef.current = velocity.current;
  });

  // Đặt xe ở y=0.22 (thấp hơn trước 0.42). Bánh xe (radius 0.42 × scale
  // 0.65 = 0.273) có tâm tại y=0.22 → đáy bánh ~ -0.05 (chìm nhẹ dưới đất
  // 5cm), nhìn như ngồi chắc chắn trên mặt đường thay vì "bay".
  return (
    <group ref={group} position={[0, 0.22, 4]}>
      <spotLight
        ref={headlightRef}
        position={[0, 1.2, -1.8]}
        intensity={7}
        angle={0.55}
        penumbra={0.4}
        distance={24}
        decay={1.6}
        color="#fff0c6"
      />
      <group ref={headlightTargetRef} position={[0, 0.4, -12]} />
      <group ref={bodyTilt}>
        <VehicleModel scale={0.65} velocityRef={internalVelocityRef} />
        {/* Fenders — mudguard đen trên mỗi bánh, gắn vào chassis (tilt
            cùng body). Vị trí tương ứng WORLD_WHEEL_CORNERS ở bruno-models
            nhưng scale theo outer 0.65: (0.82*0.65 = 0.53, 1.05*0.65 = 0.68). */}
        {[
          [-0.53, -0.68],
          [0.53, -0.68],
          [-0.53, 0.68],
          [0.53, 0.68]
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.42, z]} castShadow>
            <boxGeometry args={[0.35, 0.12, 0.65]} />
            <meshStandardMaterial color="#0a0505" roughness={0.9} />
          </mesh>
        ))}
        {/* Axle beams: thanh ngang nối 2 bánh cùng trục, visible dưới gầm */}
        <mesh position={[0, 0.28, -0.68]} castShadow>
          <boxGeometry args={[1.15, 0.09, 0.09]} />
          <meshStandardMaterial color="#1a1010" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.28, 0.68]} castShadow>
          <boxGeometry args={[1.15, 0.09, 0.09]} />
          <meshStandardMaterial color="#1a1010" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
