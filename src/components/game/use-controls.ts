"use client";

import { useEffect, useRef } from "react";

export type ControlsState = {
  forward: number;   // 0 hoặc 1
  backward: number;
  left: number;
  right: number;
  boost: number;
  reset: number;  // R key — 1 trong 1 frame khi vừa bấm
  interact: number;
  map: number;
  options: number;
  // joystick mobile: vector chuẩn hoá trong đĩa đơn vị
  joystickX: number;
  joystickY: number;
};

// Hook lưu trạng thái phím + joystick bằng ref, không re-render React
// (loop Three.js đọc mỗi frame).
export function useControls() {
  const stateRef = useRef<ControlsState>({
    forward: 0,
    backward: 0,
    left: 0,
    right: 0,
    boost: 0,
    reset: 0,
    interact: 0,
    map: 0,
    options: 0,
    joystickX: 0,
    joystickY: 0
  });

  useEffect(() => {
    const s = stateRef.current;

    function setKey(e: KeyboardEvent, down: 1 | 0) {
      // Không cản trở shortcut bình thường khi typing
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          s.forward = down;
          break;
        case "KeyS":
        case "ArrowDown":
          s.backward = down;
          break;
        case "KeyA":
        case "ArrowLeft":
          s.left = down;
          break;
        case "KeyD":
        case "ArrowRight":
          s.right = down;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          s.boost = down;
          break;
        case "KeyR":
          // Pulse 1 frame khi vừa bấm xuống; useFrame sẽ reset về 0 sau khi đọc
          if (down) s.reset = 1;
          break;
        case "Enter":
        case "NumpadEnter":
          if (down) s.interact = 1;
          break;
        case "KeyM":
          if (down) s.map = 1;
          break;
        case "KeyO":
          if (down) s.options = 1;
          break;
      }
    }
    const onDown = (e: KeyboardEvent) => setKey(e, 1);
    const onUp = (e: KeyboardEvent) => setKey(e, 0);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);

    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // API mobile joystick cập nhật từ ngoài component (TouchJoystick).
  const setJoystick = (x: number, y: number) => {
    const s = stateRef.current;
    s.joystickX = x;
    s.joystickY = y;
  };

  return { stateRef, setJoystick };
}
