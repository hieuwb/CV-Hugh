"use client";

import { useMemo } from "react";
import { BackSide, Color, ShaderMaterial } from "three";

// Dome sky với gradient 3 dải: zenith tím sẫm → mid đỏ cam → horizon hồng hot.
// Không load HDR, không phụ thuộc asset ngoài. Custom ShaderMaterial cho
// vertical gradient — rẻ, 1 draw call.
export function SkyDome() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          topColor: { value: new Color("#080c0a") },
          midColor: { value: new Color("#1f2a25") },
          horizonColor: { value: new Color("#5a4a30") }
        },
        side: BackSide,
        depthWrite: false,
        vertexShader: /* glsl */ `
          varying vec3 vWorldDir;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldDir = normalize(wp.xyz);
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 topColor;
          uniform vec3 midColor;
          uniform vec3 horizonColor;
          varying vec3 vWorldDir;
          void main() {
            float h = clamp(vWorldDir.y, -0.2, 1.0);
            vec3 col;
            if (h < 0.15) {
              col = mix(horizonColor, midColor, smoothstep(-0.2, 0.15, h));
            } else {
              col = mix(midColor, topColor, smoothstep(0.15, 0.75, h));
            }
            gl_FragColor = vec4(col, 1.0);
          }
        `
      }),
    []
  );

  return (
    <mesh>
      <sphereGeometry args={[200, 32, 24]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
