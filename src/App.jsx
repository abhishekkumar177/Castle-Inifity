import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Floating Particles (Birds/Debris)
function FloatingParticles({ count = 30 }) {
  const particlesRef = useRef();
  const positions = useRef(new Float32Array(count * 3));

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 8;
      const y = (Math.random() - 0.5) * 15 + 5;
      const z = (Math.random() - 0.5) * 8;
      positions.current[i * 3] = x;
      positions.current[i * 3 + 1] = y;
      positions.current[i * 3 + 2] = z;
    }
    particlesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions.current, 3));
  }, [count]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const positions = particlesRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += Math.sin(time + i) * 0.005;
      positions[i * 3] += Math.cos(time + i * 0.5) * 0.002;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  );
}

// Book Stack Block (Scaled)
function BookStack({ position, scale = [1, 1, 1], rotation = [0, 0, 0] }) {
  const meshRef = useRef();

  // Placeholder texture for book pages
  const texture = new THREE.TextureLoader().load(
    'https://i.imgur.com/7Kc6fVd.png'
  );
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);

  return (
    <mesh ref={meshRef} position={position} scale={scale} rotation={rotation}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial map={texture} metalness={0.1} roughness={0.8} />
    </mesh>
  );
}

// Silhouetted Figure (Smaller)
function SilhouetteFigure({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 6]} />
        <meshBasicMaterial color="black" />
      </mesh>
    </group>
  );
}

// Fog Effect
function FogEffect() {
  const { scene } = useThree();
  useEffect(() => {
    scene.fog = new THREE.FogExp2(0x000000, 0.02);
  }, [scene]);
  return null;
}

// Main Scene (Optimized for Preview)
function Scene() {
  const cameraRef = useRef();
  const controlsRef = useRef();

  return (
    <>
      {/* Camera: Moved closer to the center of the scene for better rotation feeling */}
      <perspectiveCamera
        ref={cameraRef}
        position={[0, 1.5, 3]}
        fov={70}
        near={0.1}
        far={50}
      />

      {/* Orbit Controls: Set for pure 360-degree rotation (no zoom, no pan, no limits) */}
      <OrbitControls
        ref={controlsRef}
        enableZoom={false} // Disabled zoom
        enablePan={false} // Disabled pan (user only rotates)
        autoRotate={false}
        target={[0, 1.5, 0]} // Set target to the center of the scene height
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Sky & Stars */}
      <Sky
        distance={2000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
      />
      <Stars radius={50} depth={30} count={2000} factor={3} saturation={0} fade />

      {/* Fog */}
      <FogEffect />

      {/* Floating Particles */}
      <FloatingParticles count={40} />

      {/* Silhouette Figure */}
      <SilhouetteFigure position={[0, 1.5, -3]} />

      {/* Towering Structures (Fewer & Smaller) */}
      {[...Array(9)].map((_, i) => {
        const x = (i % 3 - 1) * 2;
        const z = Math.floor(i / 3) * 3 - 3;
        const height = 1 + Math.random() * 4;
        return (
          <BookStack
            key={i}
            position={[x, height / 2, z]}
            scale={[0.8, height, 0.8]}
            rotation={[0, Math.random() * 0.1, 0]}
          />
        );
      })}

      {/* Ground Platform: Increased size significantly to cover more area */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <planeGeometry args={[100, 100]} /> {/* Increased args to [100, 100] */}
        <meshStandardMaterial color="#111" roughness={0.9} metalness={0.1} />
      </mesh>
    </>
  );
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas shadows dpr={[1, 2]} style={{ width: '100%', height: '100%' }}>
        <Scene />
      </Canvas>
    </div>
  );
}

export default App;