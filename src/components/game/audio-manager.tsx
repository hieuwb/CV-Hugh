"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { audioBus } from "./audio-bus";

// ---------------------------------------------------------------------
// AudioManager — procedural sound engine via WebAudio API.
//   • Engine: sawtooth osc + lowpass filter, pitch/gain driven by speed
//   • Impact: short noise burst (low-passed) cho xe tông chướng ngại
//   • Knock: mid-frequency clack cho letter/brick bị hất văng
//   • Boost: swoosh khi nhấn Shift
// Bruno's folio-2025 dùng file MP3. Ở đây gen procedural để không cần assets.
// ---------------------------------------------------------------------

type AudioContextCtor = typeof AudioContext;

type Props = {
  requested?: boolean;
  showButton?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
};

export function AudioManager({
  requested = false,
  showButton = true,
  onEnabledChange
}: Props) {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const engineOscRef = useRef<OscillatorNode | null>(null);
  const engineSubRef = useRef<OscillatorNode | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  const enable = useCallback(() => {
    if (ctxRef.current) return;
    const Ctor: AudioContextCtor | undefined =
      (typeof window !== "undefined" &&
        (window.AudioContext ||
          (window as unknown as { webkitAudioContext?: AudioContextCtor })
            .webkitAudioContext)) || undefined;
    if (!Ctor) return;
    const ctx = new Ctor();
    ctxRef.current = ctx;

    // Master gain
    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    masterRef.current = master;

    // Engine: 2 saw oscillators (octave apart) through lowpass + gain
    const osc1 = ctx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.value = 55;
    const osc2 = ctx.createOscillator();
    osc2.type = "square";
    osc2.frequency.value = 110;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    filter.Q.value = 3;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    osc1.start();
    osc2.start();
    engineOscRef.current = osc1;
    engineSubRef.current = osc2;
    engineGainRef.current = gain;

    // Wire bus methods
    audioBus.enabled = true;

    audioBus.engine = (ratio: number) => {
      const r = Math.max(0, Math.min(1, ratio));
      const o1 = engineOscRef.current;
      const o2 = engineSubRef.current;
      const g = engineGainRef.current;
      if (!o1 || !o2 || !g) return;
      const now = ctx.currentTime;
      const base = 55 + r * 140;
      o1.frequency.setTargetAtTime(base, now, 0.08);
      o2.frequency.setTargetAtTime(base * 2, now, 0.08);
      const targetGain = 0.05 + r * 0.12;
      g.gain.setTargetAtTime(targetGain, now, 0.1);
    };

    audioBus.impact = (intensity: number) => {
      const i = Math.max(0.2, Math.min(1, intensity));
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.22), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let n = 0; n < data.length; n++) {
        const t = n / data.length;
        data[n] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.5);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const flt = ctx.createBiquadFilter();
      flt.type = "lowpass";
      flt.frequency.value = 500 + i * 400;
      const g = ctx.createGain();
      g.gain.value = i * 0.7;
      src.connect(flt);
      flt.connect(g);
      g.connect(master);
      src.start();
    };

    audioBus.knock = (intensity: number) => {
      const i = Math.max(0.2, Math.min(1, intensity));
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = 180 + Math.random() * 120;
      const g = ctx.createGain();
      const now = ctx.currentTime;
      g.gain.setValueAtTime(i * 0.35, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + 0.18);
    };

    audioBus.boost = () => {
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let n = 0; n < data.length; n++) {
        const t = n / data.length;
        data[n] = (Math.random() * 2 - 1) * (1 - t);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const flt = ctx.createBiquadFilter();
      flt.type = "bandpass";
      flt.frequency.setValueAtTime(400, ctx.currentTime);
      flt.frequency.linearRampToValueAtTime(2400, ctx.currentTime + 0.45);
      flt.Q.value = 3;
      const g = ctx.createGain();
      g.gain.value = 0.3;
      src.connect(flt);
      flt.connect(g);
      g.connect(master);
      src.start();
    };

    setEnabled(true);
    onEnabledChange?.(true);
  }, [onEnabledChange]);

  useEffect(() => {
    if (requested) {
      enable();
      if (masterRef.current) masterRef.current.gain.value = 0.5;
      audioBus.enabled = true;
      setEnabled(true);
    } else {
      if (masterRef.current) masterRef.current.gain.value = 0;
      audioBus.enabled = false;
    }
  }, [enable, requested]);

  // Auto-resume AudioContext khi có gesture đầu tiên (browser autoplay policy
  // chặn audio play cho đến khi user tương tác). Listener self-removes sau lần đầu.
  useEffect(() => {
    if (!requested) return;
    const tryResume = () => {
      const ctx = ctxRef.current;
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    };
    const events: (keyof WindowEventMap)[] = [
      "pointerdown",
      "keydown",
      "touchstart"
    ];
    events.forEach((ev) =>
      window.addEventListener(ev, tryResume, { once: true, passive: true })
    );
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, tryResume));
    };
  }, [requested]);

  useEffect(() => {
    return () => {
      audioBus.enabled = false;
      audioBus.engine = () => {};
      audioBus.impact = () => {};
      audioBus.knock = () => {};
      audioBus.boost = () => {};
      const ctx = ctxRef.current;
      if (ctx) ctx.close();
      ctxRef.current = null;
    };
  }, []);

  if (enabled || !showButton) return null;

  return (
    <button
      onClick={enable}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-black/60 backdrop-blur border border-white/30 text-white text-sm hover:bg-black/80 transition"
    >
      🔊 Bật âm thanh
    </button>
  );
}
