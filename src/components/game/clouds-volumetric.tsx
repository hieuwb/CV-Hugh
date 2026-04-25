"use client";

import { Cloud, Clouds } from "@react-three/drei";

// Vài cụm mây volumetric từ drei — ít dep mà vibe cinematic.
// Đặt khá cao (y = 30-50) và ra xa arena để không đè lên scene chính.
export function SunsetClouds() {
  return (
    <Clouds limit={40}>
      <Cloud
        segments={30}
        bounds={[14, 4, 4]}
        volume={12}
        position={[-35, 32, -18]}
        color="#ff9a78"
        fade={60}
        speed={0.08}
        opacity={0.65}
      />
      <Cloud
        segments={24}
        bounds={[10, 3, 4]}
        volume={9}
        position={[40, 38, -10]}
        color="#ffb26b"
        fade={60}
        speed={0.06}
        opacity={0.55}
      />
      <Cloud
        segments={20}
        bounds={[8, 2.5, 3]}
        volume={7}
        position={[-10, 44, 22]}
        color="#f87b8c"
        fade={60}
        speed={0.1}
        opacity={0.55}
      />
      <Cloud
        segments={18}
        bounds={[10, 3, 3]}
        volume={8}
        position={[20, 46, 28]}
        color="#ffb26b"
        fade={60}
        speed={0.07}
        opacity={0.5}
      />
    </Clouds>
  );
}
