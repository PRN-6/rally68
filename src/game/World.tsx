import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Environment from './Environment'
import Car from './Car'
import { useGameStore } from '../store/gameStore'
import { stopAudio, pauseAudio, resumeAudio } from './audio'

export default function World() {
  const shadowsEnabled = useGameStore((s) => s.settings.shadowsEnabled)
  const paused = useGameStore((s) => s.paused)
  const selectedTrack = useGameStore((s) => s.selectedTrack)

  // Pause / resume audio when game pauses
  useEffect(() => {
    if (paused) {
      pauseAudio()
    } else {
      resumeAudio()
    }
  }, [paused])

  // Cleanup audio nodes when unmounting the 3D scene
  useEffect(() => {
    return () => stopAudio()
  }, [])

  return (
    <Canvas
      shadows={shadowsEnabled ? { type: THREE.PCFShadowMap } : false}
      camera={{ fov: 72, near: 0.05, far: 650, position: [0, 2.5, 5] }}
    >
      <color attach="background" args={['#9bb6d6']} />
      <fog attach="fog" args={['#b8c9de', 60, 450]} />
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[80, 100, 40]}
        intensity={1.2}
        castShadow={shadowsEnabled}
        shadow-mapSize={shadowsEnabled ? [2048, 2048] : [256, 256]}
      />
      <hemisphereLight args={['#b0d0ff', '#4a6b3a', 0.45]} />
      <Environment trackId={selectedTrack} />
      <Car />
    </Canvas>
  )
}
