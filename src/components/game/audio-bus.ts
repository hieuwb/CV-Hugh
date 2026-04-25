"use client";

// Global audio bus — components import và gọi bất cứ lúc nào.
// AudioManager sẽ overwrite các method khi AudioContext sẵn sàng.

export type AudioBus = {
  enabled: boolean;
  engine: (speedRatio: number) => void; // 0..1
  impact: (intensity: number) => void;   // 0..1
  knock: (intensity: number) => void;    // brick / letter knock
  boost: () => void;                     // shift boost whoosh
};

export const audioBus: AudioBus = {
  enabled: false,
  engine: () => {},
  impact: () => {},
  knock: () => {},
  boost: () => {}
};
