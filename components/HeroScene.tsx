"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

function AutomationCore({ reduce }: { reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const nodes = useMemo(
    () => [
      [2.1, 0.7, 0.15],
      [-1.9, 1.05, -0.25],
      [1.45, -1.5, 0.5],
      [-1.25, -1.65, -0.45],
      [0.25, 2.05, -0.6],
    ] as [number, number, number][],
    [],
  );

  useFrame((state, delta) => {
    if (!group.current || !core.current || reduce) return;
    const pointerX = state.pointer.x * 0.18;
    const pointerY = state.pointer.y * 0.12;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointerX, 3.5, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointerY, 3.5, delta);
    core.current.rotation.x += delta * 0.08;
    core.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={group} rotation={[0.25, -0.3, -0.08]}>
      <mesh ref={core}>
        <icosahedronGeometry args={[1.08, 4]} />
        <meshPhysicalMaterial
          color="#1b1d1a"
          metalness={0.82}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </mesh>

      <mesh rotation={[1.15, 0.4, 0.2]}>
        <torusGeometry args={[1.58, 0.018, 16, 180]} />
        <meshBasicMaterial color="#6befbc" toneMapped={false} />
      </mesh>
      <mesh rotation={[0.1, 1.1, 0.6]}>
        <torusGeometry args={[1.9, 0.012, 12, 180]} />
        <meshBasicMaterial color="#74786f" transparent opacity={0.6} />
      </mesh>

      {nodes.map((position, index) => (
        <mesh key={index} position={position} scale={index === 0 ? 1.25 : 1}>
          <sphereGeometry args={[0.09, 32, 32]} />
          <meshStandardMaterial
            color={index === 0 ? "#6befbc" : "#d9ddd3"}
            emissive={index === 0 ? "#2eae84" : "#11120f"}
            emissiveIntensity={index === 0 ? 1.8 : 0.2}
            roughness={0.24}
          />
        </mesh>
      ))}
    </group>
  );
}

function SceneCanvas() {
  const reduce = Boolean(useReducedMotion());

  return (
    <Canvas
      camera={{ position: [0, 0, 6.4], fov: 42 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={1.35} />
      <directionalLight position={[4, 5, 5]} intensity={3.2} color="#e8fff6" />
      <pointLight position={[-4, -2, 3]} intensity={18} color="#88908a" distance={8} />
      <AutomationCore reduce={reduce} />
    </Canvas>
  );
}

const DynamicScene = dynamic(() => Promise.resolve(SceneCanvas), { ssr: false });

export function HeroScene() {
  return (
    <motion.div
      className="hero-scene"
      initial={{ opacity: 0, transform: "scale(0.94)" }}
      animate={{ opacity: 1, transform: "scale(1)" }}
      transition={{ duration: 1.1, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
      aria-label="Interactive three-dimensional model of connected automation systems"
      role="img"
    >
      <Suspense fallback={<div className="scene-fallback">Preparing the system</div>}>
        <DynamicScene />
      </Suspense>
      <div className="scene-caption">
        <span>One connected system</span>
        <span>Built around your operation</span>
      </div>
    </motion.div>
  );
}
