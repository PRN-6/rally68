import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TrackGenerator } from '../Track';

export const Forest = () => {
  const track = useMemo(() => new TrackGenerator(), []);

  // Generate tree positions based on the track curve
  const trees = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const numTrees = 300;

    for (let i = 0; i < numTrees; i++) {
      // Random point along the track
      const t = Math.random();
      const point = track.getPointAt(t);
      const tangent = track.getTangentAt(t);

      // Create a perpendicular vector for offset
      const lateralVec = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

      // Place tree randomly between 15m and 40m away from the road
      const offset = (Math.random() - 0.5) * 60;
      const treePos = new THREE.Vector3().add(point).add(lateralVec.multiplyScalar(offset));

      // Add some random height variation to the ground
      treePos.y = (Math.random() - 0.5) * 0.5;

      positions.push(treePos);
    }
    return positions;
  }, [track]);

  return (
    <group>
      {trees.map((pos, i) => (
        <LowPolyTree key={i} position={pos} />
      ))}
    </group>
  );
};

const LowPolyTree = ({ position }: { position: THREE.Vector3 }) => {
  // Use useMemo to ensure random values are constant across renders
  const { scale, rotationY } = React.useMemo(() => ({
    scale: 0.8 + Math.random() * 0.4,
    rotationY: Math.random() * Math.PI * 2,
  }), []);

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.6, 6]} />
        <meshStandardMaterial color="#4b3621" />
      </mesh>
      {/* Round Foliage - Using a Dodecahedron for a stylized "puff" look */}
      <mesh position={[0, 1.2, 0]}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#3a5a2a" />
      </mesh>
      {/* Smaller puff on top */}
      <mesh position={[0, 1.8, 0]}>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#4a7a3a" />
      </mesh>
    </group>
  );
};
