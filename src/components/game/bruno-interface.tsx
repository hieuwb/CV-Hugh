"use client";

import {
  Gauge,
  Hand,
  Map,
  RotateCcw,
  Settings,
  Volume2,
  X
} from "lucide-react";
import type { MutableRefObject, ReactNode } from "react";

import { ALL_LANDMARKS } from "@/lib/game-content";

type Props = {
  nearTitle: string | null;
  introOpen: boolean;
  optionsOpen: boolean;
  mapOpen: boolean;
  audioEnabled: boolean;
  onCloseIntro: () => void;
  onInteract: () => void;
  onRespawn: () => void;
  onResetWorld: () => void;
  onToggleOptions: () => void;
  onToggleMap: () => void;
  onToggleAudio: () => void;
  playerPositionRef: MutableRefObject<[number, number]>;
};

const CONTROLS = [
  ["WASD / ARROWS", "Move around"],
  ["SHIFT", "Boost"],
  ["ENTER", "Interact"],
  ["M", "Map"],
  ["O", "Options"],
  ["R", "Respawn"]
];

export function BrunoInterface({
  nearTitle,
  introOpen,
  optionsOpen,
  mapOpen,
  audioEnabled,
  onCloseIntro,
  onInteract,
  onRespawn,
  onResetWorld,
  onToggleOptions,
  onToggleMap,
  onToggleAudio,
  playerPositionRef
}: Props) {
  return (
    <>
      <div className="fixed left-4 top-14 z-30 flex flex-col gap-2 md:left-6 md:top-16">
        <GameButton
          icon={<Hand size={15} />}
          label="Interact"
          hotkey="Enter"
          onClick={onInteract}
          active={Boolean(nearTitle)}
        />
        <GameButton
          icon={<RotateCcw size={15} />}
          label="Unstuck"
          hotkey="R"
          onClick={onRespawn}
        />
      </div>

      <div className="fixed right-4 top-16 z-30 flex gap-2 md:right-6 md:top-16">
        <IconButton
          label="Map"
          icon={<Map size={16} />}
          active={mapOpen}
          onClick={onToggleMap}
        />
        <IconButton
          label="Options"
          icon={<Settings size={16} />}
          active={optionsOpen}
          onClick={onToggleOptions}
        />
      </div>

      {introOpen ? (
        <div className="fixed inset-x-4 bottom-20 z-40 mx-auto max-w-[520px] rounded-[8px] border border-white/20 bg-[#151018]/90 p-5 text-white shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl md:bottom-10">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[#ffd479]">
            Hugh&apos;s Home
          </p>
          <h1 className="m-0 text-3xl font-black leading-none md:text-5xl">
            Welcome!
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/78 md:text-base">
            Drive around this little island to discover the story, projects,
            skills, contacts, and a few things you are absolutely allowed to
            knock over.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onCloseIntro}
              className="rounded-[6px] bg-[#ffd479] px-4 py-2 text-sm font-black text-[#24160c] transition hover:bg-[#ffe3a1]"
            >
              Start driving
            </button>
            <button
              type="button"
              onClick={onToggleOptions}
              className="rounded-[6px] border border-white/18 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-white/[0.1] hover:text-white"
            >
              Controls
            </button>
          </div>
          <button
            type="button"
            aria-label="Close welcome"
            onClick={onCloseIntro}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-[6px] text-white/55 transition hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      {optionsOpen ? (
        <Panel title="Options" onClose={onToggleOptions}>
          <OptionRow
            icon={<Volume2 size={16} />}
            title="Audio"
            text="Toggles procedural engine and impact sounds"
            action={audioEnabled ? "On" : "Off"}
            onClick={onToggleAudio}
          />
          <OptionRow
            icon={<Gauge size={16} />}
            title="Quality"
            text="Keeps bloom, fog, shadows, reflections and grass enabled"
            action="High"
          />
          <OptionRow
            icon={<RotateCcw size={16} />}
            title="I&apos;m stuck!"
            text="Teleports you to the central respawn"
            action="Respawn"
            onClick={onRespawn}
          />
          <OptionRow
            icon={<Settings size={16} />}
            title="Reset"
            text="Resets the car and closes the current panel"
            action="Reset"
            onClick={onResetWorld}
          />
          <div className="mt-4 border-t border-white/10 pt-4">
            <h3 className="m-0 mb-3 text-sm font-black text-white">Controls</h3>
            <div className="grid gap-2">
              {CONTROLS.map(([key, label]) => (
                <div
                  key={key}
                  className="grid grid-cols-[112px_1fr] items-center gap-3 text-xs"
                >
                  <kbd className="rounded-[5px] border border-white/18 bg-white/[0.06] px-2 py-1 text-center font-mono text-white/85">
                    {key}
                  </kbd>
                  <span className="text-white/62">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      ) : null}

      {mapOpen ? (
        <Panel title="Map" onClose={onToggleMap}>
          <WorldMap playerPositionRef={playerPositionRef} />
          <div className="mt-4 grid gap-2">
            {ALL_LANDMARKS.slice(0, 10).map((landmark) => (
              <button
                key={landmark.id}
                type="button"
                onClick={onToggleMap}
                className="flex items-center gap-2 rounded-[6px] border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-xs text-white/72"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: landmark.accent }}
                />
                {landmark.title}
              </button>
            ))}
          </div>
        </Panel>
      ) : null}
    </>
  );
}

function GameButton({
  icon,
  label,
  hotkey,
  active,
  onClick
}: {
  icon: ReactNode;
  label: string;
  hotkey: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-2 rounded-[7px] border px-3 py-2 text-left text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur transition ${
        active
          ? "border-[#ffd479]/70 bg-[#ffd479]/18"
          : "border-white/15 bg-[#151018]/72 hover:bg-[#151018]/90"
      }`}
    >
      <span className="text-[#ffd479]">{icon}</span>
      <span>{label}</span>
      <kbd className="ml-1 rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-white/48">
        {hotkey}
      </kbd>
    </button>
  );
}

function IconButton({
  icon,
  label,
  active,
  onClick
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-[7px] border text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur transition ${
        active
          ? "border-[#ffd479]/70 bg-[#ffd479]/20"
          : "border-white/15 bg-[#151018]/72 hover:bg-[#151018]/90"
      }`}
    >
      {icon}
    </button>
  );
}

function Panel({
  title,
  children,
  onClose
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <aside className="fixed right-4 top-[112px] z-40 w-[min(390px,calc(100vw-2rem))] rounded-[8px] border border-white/16 bg-[#151018]/92 p-4 text-white shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl md:right-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="m-0 text-lg font-black">{title}</h2>
        <button
          type="button"
          aria-label={`Close ${title}`}
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-[6px] text-white/55 transition hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
      {children}
    </aside>
  );
}

function OptionRow({
  icon,
  title,
  text,
  action,
  onClick
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="mt-0.5 text-[#ffd479]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-black text-white">{title}</span>
        <span className="block text-xs leading-snug text-white/55">{text}</span>
      </span>
      <span className="rounded-[5px] border border-white/15 bg-white/[0.06] px-2 py-1 text-xs font-bold text-white/78">
        {action}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="grid w-full grid-cols-[18px_1fr_auto] items-start gap-3 rounded-[6px] p-2 text-left transition hover:bg-white/[0.06]"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="grid grid-cols-[18px_1fr_auto] items-start gap-3 rounded-[6px] p-2">
      {content}
    </div>
  );
}

function WorldMap({
  playerPositionRef
}: {
  playerPositionRef: MutableRefObject<[number, number]>;
}) {
  const [px, pz] = playerPositionRef.current;
  const scale = 1.2;
  return (
    <svg
      viewBox="-130 -130 260 260"
      className="h-64 w-full rounded-[7px] border border-white/10 bg-[#08060b]"
    >
      <circle cx="0" cy="0" r="116" fill="#2b1320" stroke="#ffd47955" />
      <circle cx="0" cy="0" r="102" fill="none" stroke="#403941" strokeWidth="8" />
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 100;
        const y = -Math.sin(rad) * 100;
        return (
          <line
            key={angle}
            x1={Math.cos(rad) * 18}
            y1={-Math.sin(rad) * 18}
            x2={x}
            y2={y}
            stroke="#403941"
            strokeWidth="8"
            strokeLinecap="round"
          />
        );
      })}
      {ALL_LANDMARKS.map((landmark) => (
        <circle
          key={landmark.id}
          cx={landmark.position[0] * scale}
          cy={landmark.position[1] * scale}
          r={landmark.id.startsWith("proj-") ? 2.5 : 4}
          fill={landmark.accent}
        />
      ))}
      <circle
        cx={Math.max(-118, Math.min(118, px * scale))}
        cy={Math.max(-118, Math.min(118, pz * scale))}
        r="6"
        fill="#ff5c4a"
        stroke="#fff"
        strokeWidth="1.4"
      />
    </svg>
  );
}
