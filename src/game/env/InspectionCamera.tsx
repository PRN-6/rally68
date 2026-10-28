import React from 'react';
import { useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

export const InspectionCamera = ({ children }: { children: React.ReactNode }) => {
  // We use PointerLockControls from drei for theinspection mode
  // But to keep it simple and allow "switching modes" as requested,
  // we'll wrap the scene.

  return (
    <>
      <PointerLockControls />
      <div className="absolute top-4 left-4 z-50 p-4 bg-black/50 text-white text-xs rounded-sm pointer-events-none font-mono">
        <p className="font-bold mb-2 text-rally-orange">INSPECTION MODE</p>
        <p>W A S D : Move</p>
        <p>Q E : Down / Up</p>
        <p>MOUSE : Look</p>
        <p>SHIFT : Sprint</p>
        <p>R : Reset Position</p>
        <p>ESC : Unlock Mouse</p>
      </div>
      {children}
    </>
  );
};

// Separate Component for the movement logic
export const CameraController = () => {
  const keys = {
    w: false, a: false, s: false, d: false, q: false, e: false, shift: false
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (key === 'shift') keys.shift = true;
    else if (keys.hasOwnProperty(key as keyof typeof keys)) {
      (keys as any)[key] = true;
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (key === 'shift') keys.shift = false;
    else if (keys.hasOwnProperty(key as keyof typeof keys)) {
      (keys as any)[key] = false;
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const speed = keys.shift ? 50 : 20;
    const move = new THREE.Vector3();

    if (keys.w) move.z -= 1;
    if (keys.s) move.z += 1;
    if (keys.a) move.x -= 1;
    if (keys.d) move.x += 1;
    if (keys.q) move.y -= 1;
    if (keys.e) move.y += 1;

    move.normalize().multiplyScalar(speed * delta);
    state.camera.position.add(move);
  });

  return null;
};
