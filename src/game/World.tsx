import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TrackGenerator } from './Track';
import { VehiclePhysics } from './Physics';
import { Cockpit } from './Cockpit';
import { Forest } from './env/Forest';
import { useGameStore } from '../store/gameStore';

export const World = () => {
  const { gameState, setGameState, setCurrentSpeed, setCurrentRPM, setCurrentGear, setCurrentTime } = useGameStore();

  const track = useMemo(() => new TrackGenerator(), []);
  const physics = useMemo(() => new VehiclePhysics(), []);
  const cockpitRef = useRef<THREE.Group>(null);

  // Setup Inputs
  useMemo(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') physics.inputs.accelerate = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') physics.inputs.brake = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') physics.inputs.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') physics.inputs.right = true;
      if (e.code === 'Space') physics.inputs.handbrake = true;
      if (e.code === 'KeyR') physics.reset(0, 0);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') physics.inputs.accelerate = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') physics.inputs.brake = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') physics.inputs.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') physics.inputs.right = false;
      if (e.code === 'Space') physics.inputs.handbrake = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [physics]);

  useFrame((state, delta) => {
    // Log camera coordinates to console for debugging
    console.log(`Camera Position: x=${state.camera.position.x.toFixed(2)}, y=${state.camera.position.y.toFixed(2)}, z=${state.camera.position.z.toFixed(2)}`);

    if (gameState !== 'RACING') return;

    // 1. Physics Update
    physics.update(delta * 1000, 10); // 10m wide road

    // 2. Update Camera/Car Position
    const pos = track.getPointAt(physics.trackProgress);
    const tangent = track.getTangentAt(physics.trackProgress);

    const lateralVec = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
    const actualPos = new THREE.Vector3().add(pos).add(lateralVec.multiplyScalar(physics.lateralOffset));

    // Update car rotation to match track tangent
    const carQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);

    // Sync Car Model
    /*
    if (carRef.current) {
      carRef.current.position.copy(actualPos);
      carRef.current.quaternion.copy(carQuaternion);
    }
    */

    // FREE MOVE MODE:
    // We disable the locked camera and instead let OrbitControls
    // or the user move around. To make it feel "free",
    // we only update the camera if we aren't in a special free-cam mode.
    // For now, let's just comment out the hard-locked camera position.

    /*
    state.camera.position.copy(actualPos).add(new THREE.Vector3(0, 1.2, 0));
    const lookAtPos = track.getPointAt(physics.trackProgress + 0.01);
    const lookAtLateral = new THREE.Vector3().crossVectors(track.getTangentAt(physics.trackProgress + 0.01), new THREE.Vector3(0, 1, 0)).normalize();
    lookAtPos.add(lookAtLateral.multiplyScalar(physics.lateralOffset));
    state.camera.lookAt(lookAtPos);
    */

    // 3. Update Store
    setCurrentSpeed(Math.round(physics.speed));
    setCurrentRPM(Math.round(1000 + (physics.speed % 60) * 100));
    setCurrentGear(Math.floor(physics.speed / 60) + 1);
    setCurrentTime(state.clock.elapsedTime);

    // Check finish line (t=1)
    if (physics.trackProgress >= 1) {
      setGameState('FINISHED');
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <fog attach="fog" args={['#87ceeb', 10, 100]} />

      {/* Ground Terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -800]}>
        <planeGeometry args={[5000, 5000]} />
        <meshStandardMaterial color="#3a5a2a" />
      </mesh>

      {/* The Actual Rally Track */}
      <mesh position={[0, 0.2, 0]}>
        <tubeGeometry args={[track.curve, 2, 128, 16, false]} />
        <meshStandardMaterial color="#FF0000" roughness={1} metalness={0} />
      </mesh>

      {/* Environment */}
      <Forest />
    </>
  );
};
