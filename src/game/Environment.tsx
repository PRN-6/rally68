import { useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Road } from './Road'
import { getTrackCache, getNearestTrackInfo, TRACK_DEFINITIONS } from './Track'
import { createObstacleGrid, setActiveObstacleGrid, type ObstacleCollider } from './collisions'
import { useGameStore } from '../store/gameStore'

function Mountains() {
  return (
    <group>
      {Array.from({ length: 22 }).map((_, i) => {
        const ang = (i / 22) * Math.PI * 2
        const r = 320 + (i % 4) * 35
        const h = 55 + (i % 5) * 22
        return (
          <mesh
            key={i}
            position={[Math.cos(ang) * r, h / 2 - 2, 180 + Math.sin(ang) * r - 450]}
            castShadow
            receiveShadow
          >
            <coneGeometry args={[75 + (i % 6) * 18, h, 7]} />
            <meshStandardMaterial
              color={i % 2 ? '#5c6d54' : '#6b7d62'}
              flatShading
              roughness={1}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function Terrain() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 180]} receiveShadow>
      <planeGeometry args={[800, 1100, 48, 64]} />
      <meshStandardMaterial color="#4d6942" flatShading roughness={1} />
    </mesh>
  )
}

export function Environment({ trackId }: { trackId?: string }) {
  const storeTrack = useGameStore((s) => s.selectedTrack)
  const currentTrack = trackId || storeTrack || 'mountain'

  const trunkMeshRef = useRef<THREE.InstancedMesh>(null)
  const foliageLowerMeshRef = useRef<THREE.InstancedMesh>(null)
  const foliageUpperMeshRef = useRef<THREE.InstancedMesh>(null)
  const rocksMeshRef = useRef<THREE.InstancedMesh>(null)
  const fencesMeshRef = useRef<THREE.InstancedMesh>(null)

  const {
    treeCount,
    rockCount,
    fenceCount,
    treeMatrices,
    foliageLowerMatrices,
    foliageUpperMatrices,
    rockMatrices,
    fenceMatrices,
    huts,
    checkpoints,
  } = useMemo(() => {
    const cache = getTrackCache(currentTrack)
    const curve = cache.curve
    const def = TRACK_DEFINITIONS[currentTrack] ?? TRACK_DEFINITIONS.mountain
    const colliders: ObstacleCollider[] = []

    // 1. Trees (Instanced)
    const treeSamples = 160
    const treeMatricesArr: THREE.Matrix4[] = []
    const lowerFolArr: THREE.Matrix4[] = []
    const upperFolArr: THREE.Matrix4[] = []

    const dummy = new THREE.Object3D()
    const up = new THREE.Vector3(0, 1, 0)

    for (let i = 0; i < treeSamples; i++) {
      const u = i / treeSamples
      const p = curve.getPoint(u)
      const t = curve.getTangent(u).normalize()
      const right = new THREE.Vector3().crossVectors(up, t).normalize()

      for (const side of [-1, 1]) {
        for (const row of [0, 1]) {
          const offset = 6.8 + row * 4.8 + (i % 5) * 0.6
          const along = ((i % 4) - 1.5) * 1.5
          const pos = p.clone().addScaledVector(t, along).addScaledVector(right, side * offset)

          // Verify that tree is strictly outside the road surface
          const trackInfo = getNearestTrackInfo(currentTrack, pos)
          const minTreeClearance = trackInfo.width * 0.5 + 2.2

          if (trackInfo.dist < minTreeClearance) {
            const away = pos.clone().sub(trackInfo.point).setY(0).normalize()
            if (away.lengthSq() < 0.01) {
              away.copy(right).multiplyScalar(side)
            }
            pos.copy(trackInfo.point).addScaledVector(away, minTreeClearance + 0.8 + row * 2.5)

            // Re-check distance against all track segments
            const recheck = getNearestTrackInfo(currentTrack, pos)
            if (recheck.dist < minTreeClearance) {
              continue // Skip tree if it conflicts with another track segment
            }
          }

          const scale = 0.9 + (i % 4) * 0.22 + row * 0.15
          const height = 2.8 + (i % 3) * 0.6

          // Trunk
          dummy.position.set(pos.x, pos.y + height * 0.4, pos.z)
          dummy.rotation.set(0, 0, 0)
          dummy.scale.set(scale, scale, scale)
          dummy.updateMatrix()
          treeMatricesArr.push(dummy.matrix.clone())

          // Lower foliage
          dummy.position.set(pos.x, pos.y + height * 0.9, pos.z)
          dummy.scale.set(scale, scale, scale)
          dummy.updateMatrix()
          lowerFolArr.push(dummy.matrix.clone())

          // Upper foliage
          dummy.position.set(pos.x, pos.y + height * 1.45, pos.z)
          dummy.scale.set(scale * 0.8, scale * 0.8, scale * 0.8)
          dummy.updateMatrix()
          upperFolArr.push(dummy.matrix.clone())

          // Register obstacle collider (only row 0 trees near track)
          if (row === 0) {
            colliders.push({
              x: pos.x,
              z: pos.z,
              radius: 0.65 * scale,
              elasticity: 0.2,
              slowdown: 0.55,
            })
          }
        }
      }
    }

    // 2. Rocks (Instanced)
    const rockSamples = 90
    const rockMatricesArr: THREE.Matrix4[] = []
    for (let i = 0; i < rockSamples; i++) {
      const u = (i / rockSamples + 0.005) % 1
      const p = curve.getPoint(u)
      const t = curve.getTangent(u).normalize()
      const right = new THREE.Vector3().crossVectors(up, t).normalize()
      const side = (i % 2 === 0 ? 1 : -1) * (5.8 + (i % 6) * 0.8)
      const pos = p.clone().addScaledVector(right, side)

      const trackInfo = getNearestTrackInfo(currentTrack, pos)
      const minRockClearance = trackInfo.width * 0.5 + 1.2
      if (trackInfo.dist < minRockClearance) {
        const away = pos.clone().sub(trackInfo.point).setY(0).normalize()
        if (away.lengthSq() < 0.01) away.copy(right).multiplyScalar(i % 2 === 0 ? 1 : -1)
        pos.copy(trackInfo.point).addScaledVector(away, minRockClearance + 0.6)

        const recheck = getNearestTrackInfo(currentTrack, pos)
        if (recheck.dist < minRockClearance) continue
      }

      const s = 0.8 + (i % 4) * 0.35
      dummy.position.set(pos.x, pos.y + 0.4 * s, pos.z)
      dummy.rotation.set(i * 0.5, i * 0.8, 0)
      dummy.scale.set(s, s, s)
      dummy.updateMatrix()
      rockMatricesArr.push(dummy.matrix.clone())

      colliders.push({
        x: pos.x,
        z: pos.z,
        radius: 0.75 * s,
        elasticity: 0.35,
        slowdown: 0.65,
      })
    }

    // 3. Fences (Instanced)
    const fenceSamples = 60
    const fenceMatricesArr: THREE.Matrix4[] = []
    for (let i = 0; i < fenceSamples; i++) {
      const u = (i / fenceSamples + 0.02) % 1
      const p = curve.getPoint(u)
      const t = curve.getTangent(u).normalize()
      const rot = Math.atan2(t.x, t.z)
      const right = new THREE.Vector3().crossVectors(up, t).normalize()
      const pos = p.clone().addScaledVector(right, 6.4)

      const trackInfo = getNearestTrackInfo(currentTrack, pos)
      const minFenceClearance = trackInfo.width * 0.5 + 0.8
      if (trackInfo.dist < minFenceClearance) {
        const away = pos.clone().sub(trackInfo.point).setY(0).normalize()
        if (away.lengthSq() < 0.01) away.copy(right)
        pos.copy(trackInfo.point).addScaledVector(away, minFenceClearance + 0.4)

        const recheck = getNearestTrackInfo(currentTrack, pos)
        if (recheck.dist < minFenceClearance) continue
      }

      dummy.position.set(pos.x, pos.y + 0.5, pos.z)
      dummy.rotation.set(0, rot, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      fenceMatricesArr.push(dummy.matrix.clone())

      colliders.push({
        x: pos.x,
        z: pos.z,
        radius: 0.8,
        elasticity: 0.25,
        slowdown: 0.75,
      })
    }

    // 4. Huts
    const hutList: { pos: [number, number, number]; rot: number }[] = []
    for (let i = 0; i < 5; i++) {
      const u = (i + 0.15) / 5
      const p = curve.getPoint(u)
      const t = curve.getTangent(u).normalize()
      const rot = Math.atan2(t.x, t.z)
      const right = new THREE.Vector3().crossVectors(up, t).normalize()
      const pos = p.clone().addScaledVector(right, -16)

      const trackInfo = getNearestTrackInfo(currentTrack, pos)
      const minHutClearance = trackInfo.width * 0.5 + 4.0
      if (trackInfo.dist < minHutClearance) {
        const away = pos.clone().sub(trackInfo.point).setY(0).normalize()
        if (away.lengthSq() < 0.01) away.copy(right).multiplyScalar(-1)
        pos.copy(trackInfo.point).addScaledVector(away, minHutClearance + 2.0)

        const recheck = getNearestTrackInfo(currentTrack, pos)
        if (recheck.dist < minHutClearance) continue
      }

      hutList.push({ pos: [pos.x, pos.y, pos.z], rot })

      colliders.push({
        x: pos.x,
        z: pos.z,
        radius: 2.5,
        elasticity: 0.1,
        slowdown: 0.35,
      })
    }

    // 5. Checkpoints
    const cpList = def.checkpointRatios.map((u, i) => {
      const p = curve.getPoint(u)
      const t = curve.getTangent(u).normalize()
      const rot = Math.atan2(t.x, t.z)
      return { id: i + 1, pos: [p.x, p.y, p.z] as [number, number, number], rot }
    })

    // Create obstacle collision grid
    const grid = createObstacleGrid(colliders)
    setActiveObstacleGrid(grid)

    return {
      treeCount: treeMatricesArr.length,
      rockCount: rockMatricesArr.length,
      fenceCount: fenceMatricesArr.length,
      treeMatrices: treeMatricesArr,
      foliageLowerMatrices: lowerFolArr,
      foliageUpperMatrices: upperFolArr,
      rockMatrices: rockMatricesArr,
      fenceMatrices: fenceMatricesArr,
      huts: hutList,
      checkpoints: cpList,
    }
  }, [currentTrack])

  // Apply matrix buffers to InstancedMeshes
  useEffect(() => {
    if (trunkMeshRef.current) {
      for (let i = 0; i < treeCount; i++) {
        trunkMeshRef.current.setMatrixAt(i, treeMatrices[i])
      }
      trunkMeshRef.current.instanceMatrix.needsUpdate = true
    }
    if (foliageLowerMeshRef.current) {
      for (let i = 0; i < treeCount; i++) {
        foliageLowerMeshRef.current.setMatrixAt(i, foliageLowerMatrices[i])
      }
      foliageLowerMeshRef.current.instanceMatrix.needsUpdate = true
    }
    if (foliageUpperMeshRef.current) {
      for (let i = 0; i < treeCount; i++) {
        foliageUpperMeshRef.current.setMatrixAt(i, foliageUpperMatrices[i])
      }
      foliageUpperMeshRef.current.instanceMatrix.needsUpdate = true
    }
    if (rocksMeshRef.current) {
      for (let i = 0; i < rockCount; i++) {
        rocksMeshRef.current.setMatrixAt(i, rockMatrices[i])
      }
      rocksMeshRef.current.instanceMatrix.needsUpdate = true
    }
    if (fencesMeshRef.current) {
      for (let i = 0; i < fenceCount; i++) {
        fencesMeshRef.current.setMatrixAt(i, fenceMatrices[i])
      }
      fencesMeshRef.current.instanceMatrix.needsUpdate = true
    }
  }, [treeCount, rockCount, fenceCount, treeMatrices, foliageLowerMatrices, foliageUpperMatrices, rockMatrices, fenceMatrices])

  return (
    <group>
      <Terrain />
      <Mountains />
      <Road trackId={currentTrack} />

      {/* Instanced Tree Trunks */}
      <instancedMesh
        ref={trunkMeshRef}
        args={[undefined, undefined, treeCount]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.16, 0.24, 2.8, 6]} />
        <meshStandardMaterial color="#3e2723" flatShading />
      </instancedMesh>

      {/* Instanced Foliage Lower */}
      <instancedMesh
        ref={foliageLowerMeshRef}
        args={[undefined, undefined, treeCount]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[1.3, 2.5, 7]} />
        <meshStandardMaterial color="#2d6035" flatShading />
      </instancedMesh>

      {/* Instanced Foliage Upper */}
      <instancedMesh
        ref={foliageUpperMeshRef}
        args={[undefined, undefined, treeCount]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.9, 1.8, 7]} />
        <meshStandardMaterial color="#387441" flatShading />
      </instancedMesh>

      {/* Instanced Rocks */}
      <instancedMesh
        ref={rocksMeshRef}
        args={[undefined, undefined, rockCount]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial color="#707070" flatShading roughness={0.9} />
      </instancedMesh>

      {/* Instanced Fences */}
      <instancedMesh
        ref={fencesMeshRef}
        args={[undefined, undefined, fenceCount]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[3.2, 0.9, 0.15]} />
        <meshStandardMaterial color="#795548" flatShading />
      </instancedMesh>

      {/* Rustic Huts */}
      {huts.map((h, i) => (
        <group key={i} position={h.pos} rotation={[0, h.rot, 0]}>
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[4.2, 3, 4.2]} />
            <meshStandardMaterial color="#8d6e63" flatShading />
          </mesh>
          <mesh position={[0, 3.4, 0]} castShadow>
            <boxGeometry args={[4.6, 0.7, 4.6]} />
            <meshStandardMaterial color="#4e342e" flatShading />
          </mesh>
        </group>
      ))}

      {/* Checkpoint Arches */}
      {checkpoints.map((cp) => (
        <group key={cp.id} position={cp.pos} rotation={[0, cp.rot, 0]}>
          <mesh position={[-3.8, 1.6, 0]} castShadow>
            <boxGeometry args={[0.3, 3.2, 0.3]} />
            <meshStandardMaterial color="#ffd54f" flatShading />
          </mesh>
          <mesh position={[3.8, 1.6, 0]} castShadow>
            <boxGeometry args={[0.3, 3.2, 0.3]} />
            <meshStandardMaterial color="#ffd54f" flatShading />
          </mesh>
          <mesh position={[0, 3.1, 0]} castShadow>
            <boxGeometry args={[7.9, 0.45, 0.45]} />
            <meshStandardMaterial
              color="#ffd54f"
              emissive="#ffb300"
              emissiveIntensity={0.4}
              flatShading
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
export default Environment
