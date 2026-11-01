import { useMemo } from 'react'
import * as THREE from 'three'
import { getTrackCache, TRACK_DEFINITIONS } from './Track'
import { useGameStore } from '../store/gameStore'

export function Road({ trackId }: { trackId?: string }) {
  const storeTrack = useGameStore((s) => s.selectedTrack)
  const currentTrack = trackId || storeTrack || 'mountain'

  const { geom, startPos, startRot, finishPos, finishRot } = useMemo(() => {
    const cache = getTrackCache(currentTrack)
    const curve = cache.curve
    const N = 500
    const positions: number[] = []
    const indices: number[] = []
    const uvs: number[] = []
    const def = TRACK_DEFINITIONS[currentTrack] ?? TRACK_DEFINITIONS.mountain

    const up = new THREE.Vector3(0, 1, 0)

    for (let i = 0; i <= N; i++) {
      const u = i / N
      const p = curve.getPoint(u)
      const t = curve.getTangent(u).normalize()
      const right = new THREE.Vector3().crossVectors(up, t).normalize()
      const pLen = def.points.length - 1
      const idx = Math.min(pLen, Math.floor(u * pLen))
      const w = (def.points[idx].w || 7.0) * 0.5

      const left = p.clone().addScaledVector(right, -w)
      const rightP = p.clone().addScaledVector(right, w)

      positions.push(left.x, left.y + 0.04, left.z, rightP.x, rightP.y + 0.04, rightP.z)
      uvs.push(0, i * 0.06, 1, i * 0.06)
    }

    for (let i = 0; i < N; i++) {
      const a = i * 2
      const b = i * 2 + 1
      const c = (i + 1) * 2
      const d = (i + 1) * 2 + 1
      indices.push(a, c, b, b, c, d)
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    g.setIndex(indices)
    g.computeVertexNormals()

    // Start line marker
    const sp = curve.getPoint(0)
    const st = curve.getTangent(0).normalize()
    const sRot = Math.atan2(st.x, st.z)

    // Finish line marker
    const fp = curve.getPoint(0.99)
    const ft = curve.getTangent(0.99).normalize()
    const fRot = Math.atan2(ft.x, ft.z)

    return {
      geom: g,
      startPos: [sp.x, sp.y + 0.06, sp.z] as [number, number, number],
      startRot: sRot,
      finishPos: [fp.x, fp.y + 0.06, fp.z] as [number, number, number],
      finishRot: fRot,
    }
  }, [currentTrack])

  return (
    <group>
      {/* Asphalt / Gravel road surface */}
      <mesh geometry={geom} receiveShadow>
        <meshStandardMaterial color="#4a4237" roughness={0.92} flatShading />
      </mesh>

      {/* Start Line Decal */}
      <group position={startPos} rotation={[0, startRot, 0]}>
        <mesh>
          <boxGeometry args={[7.2, 0.04, 1.4]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[7.2, 0.04, 0.6]} />
          <meshStandardMaterial color="#d32f2f" flatShading />
        </mesh>
      </group>

      {/* Finish Line Decal */}
      <group position={finishPos} rotation={[0, finishRot, 0]}>
        <mesh>
          <boxGeometry args={[7.2, 0.04, 1.4]} />
          <meshStandardMaterial color="#1a1a1a" flatShading />
        </mesh>
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[7.2, 0.04, 0.6]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
      </group>
    </group>
  )
}
export default Road
