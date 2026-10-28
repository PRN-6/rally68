import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const Cockpit = () => {
  const steeringRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!steeringRef.current) return;
    // Steering animation can be added here
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Dashboard */}
      <mesh position={[0, -0.4, -0.5]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[1.2, 0.3, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Steering Wheel */}
      <group ref={steeringRef} position={[0, -0.2, -0.3]}>
        <mesh rotation={[0.2, 0, 0]}>
          <torusGeometry args={[0.15, 0.02, 16, 32]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, -0.15, 0]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.05, 0.2, 0.02]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>

      {/* Hood */}
      <mesh position={[0, -0.6, -0.8]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color="#d32f2f" />
      </mesh>

      {/* Windshield Frame */}
      <mesh position={[0, 0, -0.6]}>
        <boxGeometry args={[1.4, 0.05, 0.1]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  );
};
