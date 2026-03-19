"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float, OrbitControls, Environment, Line } from "@react-three/drei";
import * as THREE from "three";
import { CanvasWrapper } from "./canvas-wrapper";

/* ── Flow data ── */
const NODES = [
  { label: "Creator", pos: [-3.6, 1.2, 0] as const },
  { label: "Profile", pos: [-1.8, -0.6, 0.8] as const },
  { label: "Discover", pos: [0.2, 1.4, -0.4] as const },
  { label: "Enquire", pos: [1.8, -0.4, 0.6] as const },
  { label: "Payment", pos: [3.2, 1.0, -0.2] as const },
  { label: "Deliver", pos: [4.6, -0.2, 0.4] as const },
];

const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
];

/* ── Animated particle along edge ── */
function EdgeParticle({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null!);
  const speed = useMemo(() => 0.3 + Math.random() * 0.2, []);
  const offset = useMemo(() => Math.random(), []);

  useFrame(({ clock }) => {
    const t = ((clock.getElapsedTime() * speed + offset) % 1);
    ref.current.position.lerpVectors(from, to, t);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color="#a3a3a3" transparent opacity={0.7} />
    </mesh>
  );
}

/* ── Connection line between nodes ── */
function Edge({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const points = useMemo(() => [from.toArray(), to.toArray()] as [number, number, number][], [from, to]);

  return (
    <group>
      <Line points={points} color="#d4d4d4" lineWidth={1} transparent opacity={0.5} />
      <EdgeParticle from={from} to={to} />
      <EdgeParticle from={from} to={to} />
    </group>
  );
}

/* ── Single flow node ── */
function FlowNode({ label, position }: { label: string; position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (!meshRef.current) return;
    const scale = hovered ? 1.12 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.4} floatingRange={[-0.08, 0.08]}>
      <group position={position}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[1.5, 0.7, 0.12]} />
          <meshStandardMaterial
            color={hovered ? "#fafafa" : "#ffffff"}
            roughness={0.35}
            metalness={0.05}
            emissive={hovered ? "#fbbf24" : "#000000"}
            emissiveIntensity={hovered ? 0.15 : 0}
          />
        </mesh>
        {/* Subtle border outline */}
        <mesh>
          <boxGeometry args={[1.54, 0.74, 0.1]} />
          <meshBasicMaterial color="#e5e5e5" transparent opacity={0.6} />
        </mesh>
        <Text
          position={[0, 0, 0.08]}
          fontSize={0.22}
          color="#171717"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
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
        autoRotateSpeed={0.4}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 2.5}
      />

      <group ref={groupRef}>
        {NODES.map((node, i) => (
          <FlowNode key={node.label} label={node.label} position={[...node.pos]} />
        ))}
        {EDGES.map(([a, b], i) => (
          <Edge key={i} from={vectors[a]} to={vectors[b]} />
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
      camera={{ position: [0, 0.5, 7], fov: 40 }}
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
