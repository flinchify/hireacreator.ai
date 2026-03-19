"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float, OrbitControls, Environment, Line } from "@react-three/drei";
import * as THREE from "three";
import { CanvasWrapper } from "./canvas-wrapper";

/* ── Node colors ── */
const NODE_COLORS: Record<string, { bg: string; border: string; accent: string; icon: string }> = {
  Creator:  { bg: "#fff7ed", border: "#f59e0b", accent: "#f59e0b", icon: "C" },
  Profile:  { bg: "#eff6ff", border: "#3b82f6", accent: "#3b82f6", icon: "★" },
  Discover: { bg: "#ecfdf5", border: "#10b981", accent: "#10b981", icon: "◉" },
  Enquire:  { bg: "#f5f3ff", border: "#8b5cf6", accent: "#8b5cf6", icon: "✉" },
  Payment:  { bg: "#fffbeb", border: "#eab308", accent: "#eab308", icon: "$" },
  Deliver:  { bg: "#f0f9ff", border: "#0ea5e9", accent: "#0ea5e9", icon: "✓" },
};

/* ── Flow data ── */
const NODES = [
  { label: "Creator",  pos: [-3.6, 1.0, 0] as const },
  { label: "Profile",  pos: [-1.8, -0.6, 0.6] as const },
  { label: "Discover", pos: [0.2, 1.2, -0.3] as const },
  { label: "Enquire",  pos: [1.8, -0.4, 0.4] as const },
  { label: "Payment",  pos: [3.2, 0.8, -0.2] as const },
  { label: "Deliver",  pos: [4.6, -0.2, 0.3] as const },
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
];

/* ── Animated particle along edge ── */
function EdgeParticle({ from, to, color }: { from: THREE.Vector3; to: THREE.Vector3; color: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  const speed = useMemo(() => 0.3 + Math.random() * 0.2, []);
  const offset = useMemo(() => Math.random(), []);

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * speed + offset) % 1;
    ref.current.position.lerpVectors(from, to, t);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}

/* ── Connection line between nodes ── */
function Edge({ from, to, fromLabel, toLabel }: { from: THREE.Vector3; to: THREE.Vector3; fromLabel: string; toLabel: string }) {
  const points = useMemo(() => [from.toArray(), to.toArray()] as [number, number, number][], [from, to]);
  const fromColor = NODE_COLORS[fromLabel]?.accent || "#a3a3a3";
  const toColor = NODE_COLORS[toLabel]?.accent || "#a3a3a3";

  // Midpoint color blend — use the source color for the line
  const midColor = useMemo(() => {
    const c1 = new THREE.Color(fromColor);
    const c2 = new THREE.Color(toColor);
    return "#" + c1.clone().lerp(c2, 0.5).getHexString();
  }, [fromColor, toColor]);

  return (
    <group>
      <Line points={points} color={midColor} lineWidth={1.5} transparent opacity={0.5} />
      <EdgeParticle from={from} to={to} color={fromColor} />
      <EdgeParticle from={from} to={to} color={toColor} />
    </group>
  );
}

/* ── Accent ring floating above each card ── */
function AccentRing({ color, position }: { color: string; position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.12, 0.03, 8, 24]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.3} metalness={0.2} />
    </mesh>
  );
}

/* ── Single flow node ── */
function FlowNode({ label, position }: { label: string; position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null!);
  const theme = NODE_COLORS[label] || NODE_COLORS.Creator;

  useFrame(() => {
    if (!meshRef.current) return;
    const scale = hovered ? 1.12 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
  });

  return (
    <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.3} floatingRange={[-0.06, 0.06]}>
      <group position={position}>
        {/* Card body */}
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[1.5, 0.7, 0.12]} />
          <meshStandardMaterial
            color={hovered ? "#ffffff" : theme.bg}
            roughness={0.35}
            metalness={0.05}
            emissive={theme.accent}
            emissiveIntensity={hovered ? 0.2 : 0.05}
          />
        </mesh>
        {/* Colored border outline */}
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[1.56, 0.76, 0.1]} />
          <meshBasicMaterial color={theme.border} transparent opacity={hovered ? 0.5 : 0.25} />
        </mesh>
        {/* Icon character */}
        <Text
          position={[-0.45, 0, 0.08]}
          fontSize={0.26}
          color={theme.accent}
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {theme.icon}
        </Text>
        {/* Label */}
        <Text
          position={[0.15, 0, 0.08]}
          fontSize={0.2}
          color="#171717"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
        {/* Accent ring above the card */}
        <AccentRing color={theme.accent} position={[0.55, 0.45, 0]} />
      </group>
    </Float>
  );
}

/* ── Scene ── */
function HeroFlowScene() {
  const groupRef = useRef<THREE.Group>(null!);
  const vectors = useMemo(
    () => NODES.map((n) => new THREE.Vector3(...n.pos)),
    []
  );

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <Environment preset="studio" environmentIntensity={0.3} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 2.8}
        maxAzimuthAngle={Math.PI / 6}
        minAzimuthAngle={-Math.PI / 6}
      />

      <group ref={groupRef}>
        {NODES.map((node) => (
          <FlowNode key={node.label} label={node.label} position={[...node.pos]} />
        ))}
        {EDGES.map(([a, b], i) => (
          <Edge
            key={i}
            from={vectors[a]}
            to={vectors[b]}
            fromLabel={NODES[a].label}
            toLabel={NODES[b].label}
          />
        ))}
      </group>
    </>
  );
}

/* ── Exported wrapper ── */
export function HeroFlow() {
  return (
    <CanvasWrapper
      className="w-full h-full"
      camera={{ position: [0, 0.5, 8], fov: 35 }}
      frameloop="always"
      fallback={
        <div className="w-full h-full flex items-center justify-center text-neutral-300">
          {/* Static fallback — empty for clean degradation */}
        </div>
      }
    >
      <HeroFlowScene />
    </CanvasWrapper>
  );
}
