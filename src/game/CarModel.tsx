import React from 'react'
import * as THREE from 'three'
import type { CarSpec } from '../store/gameStore'

export interface CarModelProps {
  spec: CarSpec
  wheelFLRef?: React.RefObject<THREE.Group | null>
  wheelFRRef?: React.RefObject<THREE.Group | null>
  wheelRLRef?: React.RefObject<THREE.Group | null>
  wheelRRRef?: React.RefObject<THREE.Group | null>
  steerWheelRef?: React.RefObject<THREE.Group | null>
  speedNeedleRef?: React.RefObject<THREE.Group | null>
  rpmNeedleRef?: React.RefObject<THREE.Group | null>
  currentGear?: number
  isCockpit?: boolean
}

export function CarModel({
  spec,
  wheelFLRef,
  wheelFRRef,
  wheelRLRef,
  wheelRRRef,
  steerWheelRef,
  speedNeedleRef,
  rpmNeedleRef,
  currentGear: _currentGear = 1,
  isCockpit = false,
}: CarModelProps) {
  const bodyColor = spec.color
  const accentColor = spec.accentColor || '#ffffff'

  return (
    <group>
      {/* Chassis / Lower Body */}
      <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.85, 4.0]} />
        <meshStandardMaterial color={bodyColor} flatShading roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Hood */}
      <mesh position={[0, 0.82, -1.55]} castShadow receiveShadow>
        <boxGeometry args={[1.85, 0.38, 1.1]} />
        <meshStandardMaterial color={bodyColor} flatShading roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Racing Stripe Accent */}
      <mesh position={[0, 0.84, -0.2]}>
        <boxGeometry args={[0.38, 0.9, 3.8]} />
        <meshStandardMaterial color={accentColor} flatShading />
      </mesh>

      {/* Cabin Windows & Roof */}
      <mesh position={[0, 1.25, 0.2]} castShadow>
        <boxGeometry args={[1.65, 0.75, 1.95]} />
        <meshStandardMaterial
          color="#0d141e"
          flatShading
          transparent
          opacity={isCockpit ? 0.3 : 0.85}
        />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 1.25, -0.88]}>
        <boxGeometry args={[1.58, 0.65, 0.05]} />
        <meshStandardMaterial
          color="#90caf9"
          transparent
          opacity={isCockpit ? 0.15 : 0.45}
          flatShading
        />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 1.66, 0.2]} castShadow>
        <boxGeometry args={[1.68, 0.12, 1.95]} />
        <meshStandardMaterial color={bodyColor} flatShading roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Rear Spoiler */}
      <mesh position={[0, 1.45, 1.95]} castShadow>
        <boxGeometry args={[1.75, 0.1, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" flatShading />
      </mesh>
      {[-0.65, 0.65].map((x) => (
        <mesh key={x} position={[x, 1.25, 1.9]}>
          <boxGeometry args={[0.08, 0.38, 0.08]} />
          <meshStandardMaterial color="#111" flatShading />
        </mesh>
      ))}

      {/* Front Grille & Bumper */}
      <mesh position={[0, 0.35, -2.05]}>
        <boxGeometry args={[1.95, 0.45, 0.3]} />
        <meshStandardMaterial color="#1f1f1f" flatShading />
      </mesh>

      {/* Headlights */}
      {[-0.68, 0.68].map((x) => (
        <mesh key={x} position={[x, 0.55, -2.02]}>
          <boxGeometry args={[0.34, 0.22, 0.1]} />
          <meshStandardMaterial
            color="#fffde7"
            emissive="#fff9c4"
            emissiveIntensity={1.2}
            flatShading
          />
        </mesh>
      ))}

      {/* Taillights */}
      {[-0.68, 0.68].map((x) => (
        <mesh key={x} position={[x, 0.55, 2.02]}>
          <boxGeometry args={[0.34, 0.18, 0.1]} />
          <meshStandardMaterial
            color="#d32f2f"
            emissive="#b71c1c"
            emissiveIntensity={0.9}
            flatShading
          />
        </mesh>
      ))}

      {/* Wheels */}
      {/* Front Left */}
      <group ref={wheelFLRef} position={[-0.98, 0.32, -1.35]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.34, 0.34, 0.3, 14]} />
          <meshStandardMaterial color="#111111" flatShading />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.32, 8]} />
          <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} flatShading />
        </mesh>
      </group>

      {/* Front Right */}
      <group ref={wheelFRRef} position={[0.98, 0.32, -1.35]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.34, 0.34, 0.3, 14]} />
          <meshStandardMaterial color="#111111" flatShading />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.32, 8]} />
          <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} flatShading />
        </mesh>
      </group>

      {/* Rear Left */}
      <group ref={wheelRLRef} position={[-0.98, 0.32, 1.35]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.34, 0.34, 0.3, 14]} />
          <meshStandardMaterial color="#111111" flatShading />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.32, 8]} />
          <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} flatShading />
        </mesh>
      </group>

      {/* Rear Right */}
      <group ref={wheelRRRef} position={[0.98, 0.32, 1.35]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.34, 0.34, 0.3, 14]} />
          <meshStandardMaterial color="#111111" flatShading />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.32, 8]} />
          <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.3} flatShading />
        </mesh>
      </group>

      {/* Cockpit Interior */}
      <group position={[0, 0.95, 0]}>
        {/* Dashboard */}
        <mesh position={[0, -0.08, -0.85]}>
          <boxGeometry args={[1.55, 0.25, 0.6]} />
          <meshStandardMaterial color="#1a1a1a" flatShading />
        </mesh>

        {/* Steering Wheel */}
        <group ref={steerWheelRef} position={[0, 0.06, -0.55]}>
          <mesh>
            <torusGeometry args={[0.28, 0.045, 8, 16]} />
            <meshStandardMaterial color="#212121" flatShading />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.08, 8]} />
            <meshStandardMaterial color="#333333" flatShading />
          </mesh>
        </group>

        {/* Speedometer Gauge Dial */}
        <group position={[-0.42, 0.06, -0.82]} rotation={[0.65, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
            <meshStandardMaterial color="#0f0f0f" flatShading />
          </mesh>
          <group ref={speedNeedleRef} position={[0, 0.025, 0]}>
            <mesh position={[0.05, 0, 0]}>
              <boxGeometry args={[0.11, 0.01, 0.005]} />
              <meshStandardMaterial color="#ffeb3b" />
            </mesh>
          </group>
        </group>

        {/* Tachometer Gauge Dial */}
        <group position={[0.42, 0.06, -0.82]} rotation={[0.65, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
            <meshStandardMaterial color="#0f0f0f" flatShading />
          </mesh>
          <group ref={rpmNeedleRef} position={[0, 0.025, 0]}>
            <mesh position={[0.05, 0, 0]}>
              <boxGeometry args={[0.11, 0.01, 0.005]} />
              <meshStandardMaterial color="#ff5252" />
            </mesh>
          </group>
        </group>

        {/* Digital Gear Display Pod */}
        <mesh position={[0, 0.02, -0.82]} rotation={[0.65, 0, 0]}>
          <boxGeometry args={[0.22, 0.18, 0.04]} />
          <meshStandardMaterial color="#1a1a1a" flatShading />
        </mesh>

        {/* Seats */}
        <mesh position={[0, -0.4, 0.55]}>
          <boxGeometry args={[1.35, 0.85, 0.95]} />
          <meshStandardMaterial color="#212121" flatShading />
        </mesh>
      </group>
    </group>
  )
}
