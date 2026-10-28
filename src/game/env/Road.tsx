import React, { useMemo } from 'react';
import * as THREE from 'three';
import { trackData } from '../trackData';

export const Road = () => {
  const width = 8;
  const segments = 300;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const indices = [];
    const uvs = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const pos = trackData.getPointAt(t);
      const normal = trackData.getNormalAt(t);

      const left = new THREE.Vector3().add(pos).add(normal.clone().multiplyScalar(-width / 2));
      const right = new THREE.Vector3().add(pos).add(normal.clone().multiplyScalar(width / 2));

      positions.push(left.x, left.y, left.z);
      positions.push(right.x, right.y, right.z);

      uvs.push(0, t);
      uvs.push(1, t);

      if (i < segments) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    return geo;
  }, [width, segments]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#8b7355" roughness={0.8} />
    </mesh>
  );
};
