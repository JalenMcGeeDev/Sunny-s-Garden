"use client";

import React, { Component, useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Grid, Text } from "@react-three/drei";
import * as THREE from "three";
import { CustomBuildConfig, SOLID_COLORS } from "@/types";

/* ── Debug log overlay for mobile ────────────────────────── */
const debugLogs: string[] = [];
function addLog(msg: string) {
  const ts = new Date().toLocaleTimeString();
  debugLogs.push(`[${ts}] ${msg}`);
  if (debugLogs.length > 20) debugLogs.shift();
}

function DebugOverlay() {
  const [visible, setVisible] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <button
        onClick={() => setVisible((v) => !v)}
        className="absolute top-2 right-2 z-50 bg-black/60 text-white text-xs px-2 py-1 rounded"
      >
        {visible ? "Hide Log" : "Debug"}
      </button>
      {visible && (
        <div className="absolute inset-x-0 bottom-0 z-50 bg-black/80 text-green-400 text-xs p-2 max-h-48 overflow-y-auto font-mono">
          {debugLogs.length === 0 && <p>No logs yet.</p>}
          {debugLogs.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </>
  );
}

/* ── Error boundary so WebGL failures don't break the page ─ */
class PreviewErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error?.message || "Unknown error" };
  }
  componentDidCatch(error: Error) {
    addLog(`ERROR BOUNDARY: ${error.message}`);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center bg-stone-100 border border-stone-200 relative">
          <div className="text-center p-6">
            <p className="text-stone-700 font-semibold mb-1">3D preview unavailable</p>
            <p className="text-stone-500 text-sm mb-2">
              Your browser doesn&apos;t support the 3D viewer. You can still
              configure your planter below.
            </p>
            <p className="text-red-500 text-xs font-mono break-all">
              {this.state.errorMsg}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Colours ─────────────────────────────────────────────── */
const CEDAR       = "#c49a6c";
const CEDAR_DARK  = "#a07850";
const CEDAR_BOTTOM = "#a88860";
const GRASS_COLOR = "#5a8c4a";
const POST_COLOR  = "#8b6e4e";
const DEFAULT_WALL_H = 0.55; // fallback wall height in world units
const BOARD_T = 0.06; // board thickness
const RIM_T   = 0.04;
const LEG_H   = 0.35;
const LEG_W   = 0.08;

/* ── Procedural cedar texture ────────────────────────────── */
function useCedarTexture(tint: string = CEDAR) {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Base fill
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, size, size);

    // Horizontal grain lines
    for (let i = 0; i < 80; i++) {
      const y = Math.random() * size;
      ctx.strokeStyle = `rgba(120,80,40,${0.06 + Math.random() * 0.08})`;
      ctx.lineWidth = 0.5 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      // Slight waviness
      for (let x = 0; x < size; x += 8) {
        ctx.lineTo(x, y + (Math.random() - 0.5) * 2);
      }
      ctx.stroke();
    }

    // Knots
    for (let k = 0; k < 3; k++) {
      const kx = Math.random() * size;
      const ky = Math.random() * size;
      const kr = 3 + Math.random() * 6;
      const grad = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr);
      grad.addColorStop(0, "rgba(90,60,30,0.35)");
      grad.addColorStop(1, "rgba(90,60,30,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(kx, ky, kr, kr * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, [tint]);
}

/* ── Single wall panel ───────────────────────────────────── */
function WallPanel({
  width, height, position, rotation, color, interiorFace,
}: {
  width: number; height: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  interiorFace?: 4 | 5; // boxGeometry index: 4 = +Z, 5 = -Z
}) {
  const isPainted = !!color && color !== CEDAR;
  const cedarTex = useCedarTexture(CEDAR);

  // boxGeometry face order: +X(0), -X(1), +Y(2), -Y(3), +Z(4), -Z(5)
  const materials = useMemo(() => {
    const cedarMat = new THREE.MeshStandardMaterial({
      map: cedarTex, color: new THREE.Color(CEDAR), roughness: 0.75,
    });
    if (!isPainted) {
      return [cedarMat, cedarMat, cedarMat, cedarMat, cedarMat, cedarMat];
    }
    // Painted exterior: flat uniform color, no lighting
    const paintMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
    // Start with all faces painted
    const mats = [paintMat, paintMat, cedarMat, cedarMat, paintMat, paintMat];
    // Keep interior broad face as cedar
    if (interiorFace !== undefined) {
      mats[interiorFace] = cedarMat;
    }
    return mats;
  }, [isPainted, color, cedarTex, interiorFace]);

  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow
      material={materials}>
      <boxGeometry args={[width, height, BOARD_T]} />
    </mesh>
  );
}

/* ── Planter model ───────────────────────────────────────── */
function PlanterModel({ config }: { config: CustomBuildConfig }) {
  const W = config.width * 0.35;   // scale feet → world units
  const L = config.length * 0.35;
  const wallH = (config.height ?? 2) * 0.35; // dynamic height
  const baseY = config.hasLegs ? LEG_H : 0;
  const cy = baseY + wallH / 2;   // wall centre Y

  // Resolve paint color for exterior + legs
  const paintHex = config.paintOption === "solid" && config.paintColor
    ? SOLID_COLORS.find((c) => c.value === config.paintColor)?.hex ?? undefined
    : undefined;
  const wallColor = paintHex ?? CEDAR;
  const legColor = paintHex ?? CEDAR_DARK;
  const bottomTex = useCedarTexture(CEDAR_BOTTOM);

  return (
    <group>
      {/* ─ Four walls ─ */}
      {/* Front (+Z): interior face is -Z (index 5) */}
      <WallPanel width={W} height={wallH}
        position={[0, cy, L / 2]} color={wallColor} interiorFace={5} />
      {/* Back (-Z): interior face is +Z (index 4) */}
      <WallPanel width={W} height={wallH}
        position={[0, cy, -L / 2]} color={wallColor} interiorFace={4} />
      {/* Right (+X, rotated): interior face is -Z (index 5, maps to -X in world) */}
      <WallPanel width={L} height={wallH}
        position={[W / 2, cy, 0]}
        rotation={[0, Math.PI / 2, 0]} color={wallColor} interiorFace={5} />
      {/* Left (-X, rotated): interior face is +Z (index 4, maps to +X in world) */}
      <WallPanel width={L} height={wallH}
        position={[-W / 2, cy, 0]}
        rotation={[0, Math.PI / 2, 0]} color={wallColor} interiorFace={4} />

      {/* ─ Corner posts ─ */}
      {[
        [W / 2, L / 2], [W / 2, -L / 2],
        [-W / 2, L / 2], [-W / 2, -L / 2],
      ].map(([px, pz], i) => (
        <mesh key={`post-${i}`}
          position={[px, baseY + wallH / 2, pz]} castShadow>
          <boxGeometry args={[BOARD_T + 0.02, wallH + 0.02, BOARD_T + 0.02]} />
          {paintHex ? (
            <meshBasicMaterial color={paintHex} />
          ) : (
            <meshStandardMaterial color={POST_COLOR} roughness={0.8} />
          )}
        </mesh>
      ))}

      {/* ─ Legs (optional) ─ */}
      {config.hasLegs && [
        [W / 2 - 0.06, -L / 2 + 0.06],
        [-W / 2 + 0.06, -L / 2 + 0.06],
        [W / 2 - 0.06, L / 2 - 0.06],
        [-W / 2 + 0.06, L / 2 - 0.06],
      ].map(([lx, lz], i) => (
        <mesh key={`leg-${i}`} position={[lx, LEG_H / 2, lz]} castShadow>
          <boxGeometry args={[LEG_W, LEG_H, LEG_W]} />
          {paintHex ? (
            <meshBasicMaterial color={paintHex} />
          ) : (
            <meshStandardMaterial color={legColor} roughness={0.8} />
          )}
        </mesh>
      ))}

      {/* ─ Bottom panel ─ */}
      {config.hasBottom ? (
        <mesh position={[0, baseY + BOARD_T / 2, 0]} receiveShadow>
          <boxGeometry args={[W - 0.02, BOARD_T, L - 0.02]} />
          <meshStandardMaterial map={bottomTex} color={CEDAR_BOTTOM} roughness={0.8} />
        </mesh>
      ) : null}
    </group>
  );
}

/* ── Garden scene dressing ───────────────────────────────── */
function GardenScene() {
  return (
    <group>
      {/* Ground disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial color={GRASS_COLOR} roughness={1} />
      </mesh>

      {/* Subtle grid */}
      <Grid
        args={[16, 16]}
        position={[0, 0.001, 0]}
        cellSize={0.5}
        cellThickness={0.4}
        cellColor="#4a7c3d"
        sectionSize={2}
        sectionThickness={0.8}
        sectionColor="#3d6b4a"
        fadeDistance={10}
        fadeStrength={2}
        infiniteGrid={false}
      />

      {/* Bushes */}
      {[
        [-3.5, 0.25, -3], [-2.8, 0.2, -3.3], [3.2, 0.3, -2.8],
        [3.8, 0.2, -3.2], [-4, 0.18, 2.5], [4.2, 0.22, 2.8],
      ].map(([x, s, z], i) => (
        <mesh key={`bush-${i}`} position={[x, s, z]} castShadow>
          <sphereGeometry args={[s + 0.15, 16, 12]} />
          <meshStandardMaterial color="#4a7c59" roughness={0.9} />
        </mesh>
      ))}

      {/* Fence */}
      {Array.from({ length: 14 }, (_, i) => {
        const x = -3.5 + i * 0.55;
        return (
          <group key={`fpost-${i}`}>
            <mesh position={[x, 0.35, -3.6]} castShadow>
              <boxGeometry args={[0.06, 0.7, 0.04]} />
              <meshStandardMaterial color="#d4b896" roughness={0.85} />
            </mesh>
            {/* Pointed cap */}
            <mesh position={[x, 0.72, -3.6]}>
              <coneGeometry args={[0.04, 0.08, 4]} />
              <meshStandardMaterial color="#d4b896" roughness={0.85} />
            </mesh>
          </group>
        );
      })}
      {/* Fence rails */}
      <mesh position={[0, 0.22, -3.6]}>
        <boxGeometry args={[7.7, 0.04, 0.03]} />
        <meshStandardMaterial color="#c4a882" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.48, -3.6]}>
        <boxGeometry args={[7.7, 0.04, 0.03]} />
        <meshStandardMaterial color="#c4a882" roughness={0.85} />
      </mesh>

      {/* Flowers */}
      {[
        [-3, 0.08, 1.5, "#e879a0"], [-2.5, 0.06, 2, "#c084fc"],
        [2.8, 0.07, 1.8, "#f97316"], [3.2, 0.08, 2.3, "#60a5fa"],
        [-1.5, 0.05, 3, "#e879a0"], [1.8, 0.06, 3.2, "#c084fc"],
      ].map(([x, s, z, color], i) => (
        <mesh key={`flower-${i}`} position={[x as number, s as number, z as number]}>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshStandardMaterial color={color as string} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Dimension labels ────────────────────────────────────── */
function DimensionLabels({ config }: { config: CustomBuildConfig }) {
  const W = config.width * 0.35;
  const L = config.length * 0.35;
  const wallH = (config.height ?? 2) * 0.35;
  const baseY = config.hasLegs ? LEG_H : 0;
  const labelY = baseY + wallH + 0.25;

  return (
    <group>
      {/* Width label (along X) */}
      <Text
        position={[0, labelY, L / 2 + 0.3]}
        fontSize={0.18}
        color="#57534e"
        anchorX="center"
        anchorY="middle"
      >
        {config.width}ft
      </Text>
      {/* Length label (along Z) */}
      <Text
        position={[W / 2 + 0.3, labelY, 0]}
        fontSize={0.18}
        color="#57534e"
        anchorX="center"
        anchorY="middle"
        rotation={[0, -Math.PI / 2, 0]}
      >
        {config.length}ft
      </Text>
      {/* Box height label (along Y) */}
      <Text
        position={[-W / 2 - 0.3, baseY + wallH / 2, L / 2]}
        fontSize={0.15}
        color="#57534e"
        anchorX="center"
        anchorY="middle"
      >
        {`Box ${config.height}ft`}
      </Text>
      {/* Legs height label (along Y, below box) */}
      {config.hasLegs && (
        <Text
          position={[-W / 2 - 0.3, LEG_H / 2, L / 2]}
          fontSize={0.15}
          color="#78716c"
          anchorX="center"
          anchorY="middle"
        >
          {`Legs 1ft`}
        </Text>
      )}
    </group>
  );
}

/* ── Gentle auto-rotation wrapper ────────────────────────── */
function AutoRotate({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.08;
  });
  return <group ref={ref}>{children}</group>;
}

/* ── Main export ─────────────────────────────────────────── */
interface PlanterPreviewProps {
  config: CustomBuildConfig;
}

export default function PlanterPreview({ config }: PlanterPreviewProps) {
  const maxDim = Math.max(config.width, config.length);
  const camDist = Math.max(3.5, maxDim * 0.8 + 1);

  useEffect(() => {
    addLog(`UA: ${navigator.userAgent}`);
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (gl) {
      const dbg = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
      const renderer = dbg ? (gl as WebGLRenderingContext).getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "unknown";
      addLog(`WebGL OK — renderer: ${renderer}`);
    } else {
      addLog("WebGL NOT available");
    }
    addLog(`Screen: ${screen.width}x${screen.height} DPR: ${devicePixelRatio}`);
  }, []);

  return (
    <PreviewErrorBoundary>
      <div
        className="w-full aspect-[4/3] rounded-2xl overflow-hidden touch-none relative"
        style={{
          background: "linear-gradient(180deg, #87CEEB 0%, #b8e0f5 60%, #ddeef8 100%)",
        }}
      >
        <DebugOverlay />
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          camera={{ position: [camDist, camDist * 0.7, camDist], fov: 40 }}
          gl={{ antialias: true, powerPreference: "default" }}
          onCreated={() => addLog("Canvas created successfully")}
        >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          <AutoRotate>
            <PlanterModel config={config} />
            <DimensionLabels config={config} />
          </AutoRotate>

          <GardenScene />

          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />

          <Environment preset="park" />

          <OrbitControls
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={2}
            maxDistance={camDist + 3}
          />
        </Suspense>
      </Canvas>
    </div>
    </PreviewErrorBoundary>
  );
}
