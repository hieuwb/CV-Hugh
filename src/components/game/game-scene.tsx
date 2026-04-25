"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  ToneMapping,
  Vignette
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type { MutableRefObject } from "react";
import { Fog, Vector2 } from "three";

import { ALL_LANDMARKS, LANDMARKS, type Landmark } from "@/lib/game-content";

import { ApocalypseDebris } from "./apocalypse-debris";
import { AudioManager } from "./audio-manager";
import { BrunoInterface } from "./bruno-interface";
import { SunsetClouds } from "./clouds-volumetric";
import { ContentOverlay } from "./content-overlay";
import { Decorations } from "./decorations";
import { BushesFolio, FlowerClumps, Forest } from "./forest";
import { Grass } from "./grass";
import { Ground } from "./ground";
import { KerbBlocks } from "./kerb-blocks";
import { HUD } from "./hud";
import { KnockableBricks } from "./knockable-bricks";
import { KnockableProps } from "./knockable-props";
import { LandmarkMarker } from "./landmark";
import { MiniMap } from "./minimap";
import { Dust, Fireflies } from "./particles";
import { PlayerCar } from "./player-car";
import { SceneLoadingOverlay } from "./scene-loading-overlay";
import { Benches, RoadLamps } from "./scenery";
import { Signposts } from "./signposts";
import { SkyDome } from "./sky-dome";
import { WorkshopZone } from "./zone-workshop";
import { Statue } from "./statue";
import { TouchJoystick } from "./touch-joystick";
import { useControls } from "./use-controls";
import type { ControlsState } from "./use-controls";
import { Water } from "./water";
import { ArmZones, RoadDecay } from "./zones";

// ---------------------------------------------------------------------
// Rich scene: SkyDome + fog + clouds + grass + lamps + benches +
// particles + Water + KnockableBricks + Minimap + post-processing.
// ---------------------------------------------------------------------

export function GameScene() {
  const { stateRef, setJoystick } = useControls();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [audioRequested, setAudioRequested] = useState(false);
  const playerPos = useRef<[number, number]>([0, 6]);
  const playerVelocity = useRef(0);

  const landmarksById = useMemo(() => {
    const m = new Map<string, Landmark>();
    for (const l of ALL_LANDMARKS) m.set(l.id, l);
    return m;
  }, []);

  const landmarkPoints = useMemo<[number, number][]>(
    () => ALL_LANDMARKS.map((l) => l.position),
    []
  );


  const onPlayerMove = useCallback((x: number, z: number) => {
    playerPos.current[0] = x;
    playerPos.current[1] = z;
    let best: { id: string; d: number } | null = null;
    for (const l of ALL_LANDMARKS) {
      const dx = x - l.position[0];
      const dz = z - l.position[1];
      const d = Math.hypot(dx, dz);
      if (d < l.radius) {
        if (!best || d < best.d) best = { id: l.id, d };
      }
    }
    const nextId = best?.id ?? null;
    setActiveId((prev) => (prev === nextId ? prev : nextId));
  }, []);

  const active = activeId ? landmarksById.get(activeId) ?? null : null;

  const requestRespawn = useCallback(() => {
    stateRef.current.reset = 1;
    setShowIntro(false);
  }, [stateRef]);

  const requestInteract = useCallback(() => {
    setShowIntro(false);
    setActiveId((prev) => prev ?? "hero");
  }, []);

  const requestResetWorld = useCallback(() => {
    stateRef.current.reset = 1;
    setActiveId(null);
    setShowIntro(false);
    setShowOptions(false);
    setShowMap(false);
  }, [stateRef]);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#140619]">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 20, 30], fov: 58, near: 0.1, far: 360 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMappingExposure: 1.15
        }}
      >
        <SceneSetup />
        <KeyboardActions
          controls={stateRef}
          onInteract={requestInteract}
          onMap={() => setShowMap((v) => !v)}
          onOptions={() => setShowOptions((v) => !v)}
        />
        <SkyDome />
        <Water />
        <Ground />
        <KerbBlocks />

        <Suspense fallback={null}>
          <Statue />
          <Grass excludes={landmarkPoints} />
          <RoadLamps />
          <Benches />
          <Signposts />
          <KnockableBricks
            carPositionRef={playerPos}
            carVelocityRef={playerVelocity}
          />
          <KnockableProps
            carPositionRef={playerPos}
            carVelocityRef={playerVelocity}
          />
          <Forest />
          <BushesFolio />
          <FlowerClumps />
          <WorkshopZone
            carPositionRef={playerPos}
            carVelocityRef={playerVelocity}
          />
          <ArmZones
            carPositionRef={playerPos}
            carVelocityRef={playerVelocity}
          />
          <RoadDecay />
          <Decorations
            carPositionRef={playerPos}
            carVelocityRef={playerVelocity}
          />
          <ApocalypseDebris
            carPositionRef={playerPos}
            carVelocityRef={playerVelocity}
          />
          {/* Skyline removed — post-apoc lone-island feel, no distant city */}
          <SunsetClouds />
          <Dust />

          {LANDMARKS.map((l) => (
            <Fireflies key={`ff-${l.id}`} center={l.position} accent={l.accent} />
          ))}

          {ALL_LANDMARKS.map((l) => (
            <LandmarkMarker key={l.id} landmark={l} active={activeId === l.id} />
          ))}
          <PlayerCar
            controls={stateRef}
            onPositionChange={onPlayerMove}
            velocityRef={playerVelocity}
            worldPositionRef={playerPos}
          />
        </Suspense>

        <EffectComposer multisampling={4}>
          <Bloom
            intensity={0.55}
            luminanceThreshold={0.7}
            luminanceSmoothing={0.4}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.15} darkness={0.65} />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={new Vector2(0.0008, 0.0012)}
            radialModulation
            modulationOffset={0.5}
          />
          <ToneMapping />
        </EffectComposer>
      </Canvas>

      <HUD nearTitle={active?.title ?? null} />
      <MiniMap positionRef={playerPos} />
      <ContentOverlay landmark={active} onDismiss={() => setActiveId(null)} />
      <BrunoInterface
        nearTitle={active?.title ?? null}
        introOpen={showIntro}
        optionsOpen={showOptions}
        mapOpen={showMap}
        audioEnabled={audioRequested}
        onCloseIntro={() => setShowIntro(false)}
        onInteract={requestInteract}
        onRespawn={requestRespawn}
        onResetWorld={requestResetWorld}
        onToggleOptions={() => setShowOptions((v) => !v)}
        onToggleMap={() => setShowMap((v) => !v)}
        onToggleAudio={() => setAudioRequested((v) => !v)}
        playerPositionRef={playerPos}
      />
      <TouchJoystick onChange={setJoystick} />
      <AudioManager
        requested={audioRequested}
        showButton={false}
        onEnabledChange={setAudioRequested}
      />
      <SceneLoadingOverlay />
    </div>
  );
}

function KeyboardActions({
  controls,
  onInteract,
  onMap,
  onOptions
}: {
  controls: MutableRefObject<ControlsState>;
  onInteract: () => void;
  onMap: () => void;
  onOptions: () => void;
}) {
  useFrame(() => {
    const c = controls.current;
    if (c.interact) {
      c.interact = 0;
      onInteract();
    }
    if (c.map) {
      c.map = 0;
      onMap();
    }
    if (c.options) {
      c.options = 0;
      onOptions();
    }
  });
  return null;
}

// WorldTitle removed — bị overlap với Statue tablet ở cùng y=3.35.
// Tagline + identity giờ nằm trên Statue (HUGH · pmhieu111.eth name plate).

function SceneSetup() {
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.position.set(0, 20, 30);
    camera.lookAt(0, 0, 0);
    // Fog xa hơn — thấy được mép water trước khi fade
    // Post-apocalyptic fog: xanh xám u ám, đè dần ở xa
    scene.fog = new Fog("#1a1f1c", 45, 180);
    return () => {
      scene.fog = null;
    };
  }, [camera, scene]);

  // Night mood — sky tím đậm, ambient tím yếu, key light cam ấm, fill tím đậm
  return (
    <>
      <ambientLight intensity={0.28} color="#5a6862" />
      <directionalLight
        castShadow
        intensity={0.85}
        position={[18, 14, 14]}
        color="#ffaf60"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={0.5}
        shadow-camera-far={150}
        shadow-bias={-0.0003}
      />
      <directionalLight intensity={0.4} position={[-18, 8, -14]} color="#4a5a78" />
      <hemisphereLight args={["#a08760", "#1a1f18", 0.4]} />
    </>
  );
}
