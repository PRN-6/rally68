import { useMemo } from 'react';
import * as THREE from 'three';

export const Terrain = () => {
  const size = 5000;
  const divisions = 100;

  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, divisions, divisions);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Simple rolling hills using sine waves
      const h = Math.sin(x * 0.01) * 5 + Math.cos(z * 0.01) * 5 + Math.sin((x + z) * 0.005) * 10;
      pos.setY(i, h);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <primitive object={terrainGeo} attach="geometry" />
      <meshStandardMaterial color="#4a7a3a" roughness={0.9} />
    </mesh>
  );
};
