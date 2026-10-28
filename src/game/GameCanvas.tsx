import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { World } from './World';
import * as THREE from 'three';

export const GameCanvas = () => {
  return (
    <div className="absolute inset-0 z-0 bg-slate-900">
      <Canvas camera={{ position: [0, 10, 30], fov: 75 }}>
        <Sky sunPosition={[100, 20, 100]} />

        <World />

        <OrbitControls />
      </Canvas>
    </div>
  );
};
