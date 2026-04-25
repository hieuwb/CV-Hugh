"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group } from "three";

import { audioBus } from "./audio-bus";

// ---------------------------------------------------------------------
// Knockable LETTER blocks — mỗi chữ là 1 khối rigid gồm nhiều cube con,
// vị trí cube relative theo lưới 3×5. Physics áp dụng cho CẢ chữ (nhóm),
// không phải từng cube. Xe đâm → cả chữ văng lên + xoay.
// Từ: HUGH, 2026, WEB3, DEV, CODE rải quanh arms.
// ---------------------------------------------------------------------

type Grid = string[];

const L_H: Grid = ["X.X", "X.X", "XXX", "X.X", "X.X"];
const L_U: Grid = ["X.X", "X.X", "X.X", "X.X", "XXX"];
const L_G: Grid = ["XXX", "X..", "X.X", "X.X", "XXX"];
const L_D: Grid = ["XX.", "X.X", "X.X", "X.X", "XX."];
const L_E: Grid = ["XXX", "X..", "XX.", "X..", "XXX"];
const L_V: Grid = ["X.X", "X.X", "X.X", "X.X", ".X."];
const L_W: Grid = ["X.X", "X.X", "X.X", "XXX", "X.X"];
const L_B: Grid = ["XX.", "X.X", "XX.", "X.X", "XX."];
const L_C: Grid = ["XXX", "X..", "X..", "X..", "XXX"];
const L_O: Grid = ["XXX", "X.X", "X.X", "X.X", "XXX"];
const N_0: Grid = ["XXX", "X.X", "X.X", "X.X", "XXX"];
const N_2: Grid = ["XXX", "..X", "XXX", "X..", "XXX"];
const N_3: Grid = ["XXX", "..X", ".XX", "..X", "XXX"];
const N_6: Grid = ["XXX", "X..", "XXX", "X.X", "XXX"];

const CHARS: Record<string, Grid> = {
  H: L_H, U: L_U, G: L_G, D: L_D, E: L_E, V: L_V,
  W: L_W, B: L_B, C: L_C, O: L_O,
  "0": N_0, "2": N_2, "3": N_3, "6": N_6
};

const CELL = 0.65;
const LETTER_COLS = 3;
const LETTER_GAP = 0.7;

const GRAVITY = 14;
const GROUND_Y = CELL / 2;
const HIT_RADIUS_MULT = 1.4; // bounding sphere around letter
const CAR_RADIUS = 1.1;

type WordSpec = {
  text: string;
  sectorDeg: number;
  radius: number;
  rotY: number;
};

const WORDS: WordSpec[] = [
  { text: "HUGH", sectorDeg: 90, radius: 38, rotY: 0 },
  { text: "2026", sectorDeg: 30, radius: 38, rotY: -Math.PI / 3 },
  { text: "WEB3", sectorDeg: 150, radius: 38, rotY: Math.PI / 3 },
  { text: "DEV", sectorDeg: 330, radius: 40, rotY: -Math.PI * 2 / 3 },
  { text: "CODE", sectorDeg: 270, radius: 40, rotY: Math.PI }
];

type LetterSpec = {
  cells: [number, number][]; // (localX, localY) offsets, centered
  hx: number; hy: number; hz: number;
  ry0: number;
  palette: { color: string; accent: string };
};

type LetterState = {
  px: number; py: number; pz: number;
  vx: number; vy: number; vz: number;
  rx: number; ry: number; rz: number;
  sx: number; sy: number; sz: number;
};

const PALETTES = [
  { color: "#fbf2e4", accent: "#ffb347" },
  { color: "#e8d7c3", accent: "#72d9ff" },
  { color: "#ffdabf", accent: "#ff7b4a" },
  { color: "#d8e9ff", accent: "#c28bff" }
];

function buildLetters(): LetterSpec[] {
  const out: LetterSpec[] = [];
  WORDS.forEach((w, wi) => {
    const chars = w.text.split("").filter((c) => CHARS[c]);
    const letterWidth = LETTER_COLS * CELL;
    const totalWidth = chars.length * letterWidth + (chars.length - 1) * LETTER_GAP;
    const startX = -totalWidth / 2;

    const rad = (w.sectorDeg * Math.PI) / 180;
    const cx = Math.cos(rad) * w.radius;
    const cz = -Math.sin(rad) * w.radius;
    const cosR = Math.cos(w.rotY);
    const sinR = Math.sin(w.rotY);

    chars.forEach((ch, li) => {
      const grid = CHARS[ch];
      const letterOriginX = startX + li * (letterWidth + LETTER_GAP) + letterWidth / 2;
      const worldX = cx + letterOriginX * cosR;
      const worldZ = cz + -letterOriginX * sinR;

      const cells: [number, number][] = [];
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          if (grid[row][col] !== "X") continue;
          const rowsFromBottom = grid.length - 1 - row;
          const localX = (col - 1) * CELL; // center around col=1
          const localY = rowsFromBottom * CELL;
          cells.push([localX, localY]);
        }
      }

      out.push({
        cells,
        hx: worldX,
        hy: GROUND_Y,
        hz: worldZ,
        ry0: w.rotY,
        palette: PALETTES[(wi + li) % PALETTES.length]
      });
    });
  });
  return out;
}

type Props = {
  carPositionRef: React.MutableRefObject<[number, number]>;
  carVelocityRef: React.MutableRefObject<number>;
};

export function KnockableBricks({ carPositionRef, carVelocityRef }: Props) {
  const letters = useMemo(() => buildLetters(), []);

  // Hit radius: max distance from letter center to farthest cell corner
  const hitRadii = useMemo(
    () =>
      letters.map((l) => {
        let maxR = 0;
        for (const [lx, ly] of l.cells) {
          const d = Math.hypot(lx, ly - 2 * CELL); // center is at y = 2*CELL (mid of 5 rows)
          if (d > maxR) maxR = d;
        }
        return maxR * HIT_RADIUS_MULT;
      }),
    [letters]
  );

  const state = useRef<LetterState[]>(
    letters.map(() => ({
      px: 0, py: 0, pz: 0,
      vx: 0, vy: 0, vz: 0,
      rx: 0, ry: 0, rz: 0,
      sx: 0, sy: 0, sz: 0
    }))
  );
  // Init positions
  useMemo(() => {
    letters.forEach((l, i) => {
      state.current[i].px = l.hx;
      state.current[i].py = l.hy;
      state.current[i].pz = l.hz;
    });
  }, [letters]);

  const groupRefs = useRef<(Group | null)[]>([]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const [cx, cz] = carPositionRef.current;
    const cv = carVelocityRef.current;

    for (let i = 0; i < letters.length; i++) {
      const s = state.current[i];
      const l = letters[i];
      const g = groupRefs.current[i];
      const HIT_RADIUS = hitRadii[i];

      // Collision: only if letter still near ground
      if (s.py < 2.5) {
        const dx = s.px - cx;
        const dz = s.pz - cz;
        const d = Math.hypot(dx, dz);
        if (d < HIT_RADIUS + CAR_RADIUS && d > 0.001) {
          const dirX = dx / d;
          const dirZ = dz / d;
          const impulse = 4 + Math.min(16, Math.abs(cv) * 1.2);
          s.vx += dirX * impulse;
          s.vz += dirZ * impulse;
          s.vy += 5 + Math.abs(cv) * 0.3;
          s.sx += (Math.random() - 0.5) * 16;
          s.sz += (Math.random() - 0.5) * 16;
          s.sy += (Math.random() - 0.5) * 10;
          s.px = cx + dirX * (HIT_RADIUS + CAR_RADIUS) * 1.01;
          s.pz = cz + dirZ * (HIT_RADIUS + CAR_RADIUS) * 1.01;
          audioBus.knock(Math.min(1, Math.abs(cv) / 10));
        }
      }

      s.vy -= GRAVITY * dt;
      s.px += s.vx * dt;
      s.py += s.vy * dt;
      s.pz += s.vz * dt;

      if (s.py < GROUND_Y) {
        s.py = GROUND_Y;
        if (s.vy < 0) s.vy = -s.vy * 0.25;
        s.vx *= 0.8;
        s.vz *= 0.8;
        s.sx *= 0.82;
        s.sy *= 0.82;
        s.sz *= 0.82;
        if (Math.abs(s.vy) < 0.3) s.vy = 0;
      }

      s.rx += s.sx * dt;
      s.ry += s.sy * dt;
      s.rz += s.sz * dt;

      // Teleport home if flung too far
      if (Math.hypot(s.px, s.pz) > 180) {
        s.px = l.hx; s.py = l.hy; s.pz = l.hz;
        s.vx = s.vy = s.vz = 0;
        s.sx = s.sy = s.sz = 0;
        s.rx = s.ry = s.rz = 0;
      }

      if (g) {
        g.position.set(s.px, s.py, s.pz);
        g.rotation.set(s.rx, l.ry0 + s.ry, s.rz);
      }
    }
  });

  return (
    <group>
      {letters.map((l, i) => (
        <group
          key={i}
          ref={(el) => { groupRefs.current[i] = el; }}
          position={[l.hx, l.hy, l.hz]}
          rotation={[0, l.ry0, 0]}
        >
          {l.cells.map(([lx, ly], j) => (
            <mesh key={j} position={[lx, ly, 0]} castShadow receiveShadow>
              <boxGeometry args={[CELL * 0.96, CELL * 0.96, CELL * 0.9]} />
              <meshStandardMaterial color={l.palette.color} roughness={0.85} flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
