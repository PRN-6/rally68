import { useRef, useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import {
  getTrackCache,
  getNearestTrackInfo,
  getUpcomingPacenote,
  TRACK_DEFINITIONS,
  TOTAL_CHECKPOINTS,
  type NearestTrackResult,
} from './Track'
import { useGameStore, CARS } from '../store/gameStore'
import {
  startAudio,
  updateAudio,
  playCountdownBeep,
  playCheckpointChime,
  playCollisionSound,
} from './audio'
import {
  createInitialPhysicsState,
  updateVehiclePhysics,
  touchInputs,
  type VehicleInputs,
  type VehiclePhysicsState,
} from './physics'
import { resolveVehicleCollisions, getActiveObstacleGrid } from './collisions'
import { CarModel } from './CarModel'

export default function Car() {
  const group = useRef<THREE.Group>(null)
  const wheelFL = useRef<THREE.Group>(null)
  const wheelFR = useRef<THREE.Group>(null)
  const wheelRL = useRef<THREE.Group>(null)
  const wheelRR = useRef<THREE.Group>(null)
  const steerWheel = useRef<THREE.Group>(null)
  const speedNeedle = useRef<THREE.Group>(null)
  const rpmNeedle = useRef<THREE.Group>(null)

  // Local gear state for Drei Text reactivity
  const [displayGear, setDisplayGear] = useState<number>(1)

  const keyboardInputs = useRef<VehicleInputs>({
    throttle: 0,
    brake: 0,
    steer: 0,
    handbrake: false,
    gearUp: false,
    gearDown: false,
    boost: false,
    reset: false,
  })

  const physicsState = useRef<VehiclePhysicsState>(createInitialPhysicsState())
  const cachedTrackInfo = useRef<NearestTrackResult>({
    u: 0,
    point: new THREE.Vector3(),
    tangent: new THREE.Vector3(0, 0, 1),
    right: new THREE.Vector3(1, 0, 0),
    width: 7,
    dist: 0,
    lateral: 0,
    offTrack: false,
  })

  // Smooth camera tracking vectors
  const smoothCamPos = useRef(new THREE.Vector3(0, 2.5, 5))
  const smoothCamLook = useRef(new THREE.Vector3(0, 1, 0))

  // Countdown timer state
  const countdownTimer = useRef<number>(3.0)
  const lastBeepSecond = useRef<number>(4)

  const selectedCarId = useGameStore((s) => s.selectedCar)
  const selectedTrack = useGameStore((s) => s.selectedTrack)
  const cameraMode = useGameStore((s) => s.settings.cameraMode)
  const toggleCameraMode = useGameStore((s) => s.toggleCameraMode)

  const spec = useMemo(
    () => CARS.find((c) => c.id === selectedCarId) ?? CARS[0],
    [selectedCarId],
  )

  const trackDef = useMemo(
    () => TRACK_DEFINITIONS[selectedTrack] ?? TRACK_DEFINITIONS.mountain,
    [selectedTrack],
  )

  // Initialize car position at track start
  useEffect(() => {
    const cache = getTrackCache(selectedTrack)
    const startPoint = cache.curve.getPoint(0)
    const tangent = cache.curve.getTangent(0).normalize()
    const heading = Math.atan2(tangent.x, tangent.z)

    physicsState.current.pos.set(startPoint.x, startPoint.y + 0.45, startPoint.z)
    physicsState.current.heading = heading
    physicsState.current.speed = 0
    physicsState.current.lateralVelocity = 0
    physicsState.current.lastCheckpoint = 0
    physicsState.current.finished = false
    physicsState.current.time = 0
    countdownTimer.current = 3.0
    lastBeepSecond.current = 4
  }, [selectedTrack])

  // Keyboard controls listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft', 'ShiftRight'].includes(e.code)
      ) {
        e.preventDefault()
      }
      startAudio()
      const kb = keyboardInputs.current
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          kb.throttle = 1
          break
        case 'KeyS':
        case 'ArrowDown':
          kb.brake = 1
          break
        case 'KeyA':
        case 'ArrowLeft':
          kb.steer = 1
          break
        case 'KeyD':
        case 'ArrowRight':
          kb.steer = -1
          break
        case 'Space':
          kb.handbrake = true
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          kb.boost = true
          break
        case 'KeyQ':
          kb.gearDown = true
          break
        case 'KeyE':
          kb.gearUp = true
          break
        case 'KeyC':
          toggleCameraMode()
          break
        case 'KeyR':
          kb.reset = true
          break
      }
    }

    const up = (e: KeyboardEvent) => {
      const kb = keyboardInputs.current
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          kb.throttle = 0
          break
        case 'KeyS':
        case 'ArrowDown':
          kb.brake = 0
          break
        case 'KeyA':
        case 'ArrowLeft':
          if (kb.steer > 0) kb.steer = 0
          break
        case 'KeyD':
        case 'ArrowRight':
          if (kb.steer < 0) kb.steer = 0
          break
        case 'Space':
          kb.handbrake = false
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          kb.boost = false
          break
      }
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [toggleCameraMode])

  // Frame simulation loop
  useFrame((r3fState, dtRaw) => {
    const dt = Math.min(0.05, Math.max(0.001, dtRaw))
    const st = physicsState.current
    const store = useGameStore.getState()

    // When paused or outside race screen, maintain vehicle transform and return
    if (store.screen !== 'race' || store.paused) {
      if (group.current) {
        group.current.position.copy(st.pos)
        group.current.rotation.y = st.heading
      }
      return
    }

    // Combine keyboard and touch inputs
    const kb = keyboardInputs.current
    const combinedInputs: VehicleInputs = {
      throttle: Math.max(kb.throttle, touchInputs.throttle),
      brake: Math.max(kb.brake, touchInputs.brake),
      steer: Math.abs(touchInputs.steer) > 0.01 ? touchInputs.steer : kb.steer,
      handbrake: kb.handbrake || touchInputs.handbrake,
      gearUp: kb.gearUp || touchInputs.gearUp,
      gearDown: kb.gearDown || touchInputs.gearDown,
      boost: kb.boost || touchInputs.boost,
      reset: kb.reset || touchInputs.reset,
    }

    // Clear one-shot touch actions
    touchInputs.gearUp = false
    touchInputs.gearDown = false
    touchInputs.reset = false

    // Reset car onto track centerline if requested
    if (combinedInputs.reset) {
      const cache = getTrackCache(selectedTrack)
      const p = cache.curve.getPoint(st.progressU || 0)
      const t = cache.curve.getTangent(st.progressU || 0).normalize()
      st.pos.set(p.x, p.y + 0.45, p.z)
      st.heading = Math.atan2(t.x, t.z)
      st.speed = 0
      st.lateralVelocity = 0
      st.rpm = 800
      combinedInputs.reset = false
      kb.reset = false
    }

    // Race Countdown Manager (3 -> 2 -> 1 -> GO -> -1)
    let canMove = false
    if (countdownTimer.current > -0.8) {
      countdownTimer.current -= dt
      const sec = Math.ceil(countdownTimer.current)

      if (sec !== lastBeepSecond.current && sec >= 0) {
        lastBeepSecond.current = sec
        store.setCountdown(sec)
        playCountdownBeep(sec === 0)
      }

      if (countdownTimer.current <= 0) {
        canMove = true
      }
    } else {
      canMove = true
      if (store.countdown !== -1) {
        store.setCountdown(-1)
      }
    }

    // Query nearest track point (zero allocation)
    getNearestTrackInfo(selectedTrack, st.pos, cachedTrackInfo.current)
    const trackInfo = cachedTrackInfo.current
    st.progressU = trackInfo.u

    // Update vehicle physics
    updateVehiclePhysics(st, combinedInputs, spec, trackInfo, dt, canMove)

    // Sync gear for cockpit UI when changed
    if (st.gear !== displayGear) {
      setDisplayGear(st.gear)
    }

    // Resolve roadside obstacle collisions (push-back + impact audio)
    resolveVehicleCollisions(st, getActiveObstacleGrid(), (sev) => {
      playCollisionSound(sev)
    })

    // Update Web Audio continuously
    updateAudio(
      Math.abs(st.speed) * 3.6,
      st.rpm,
      combinedInputs.throttle,
      st.isDrifting,
    )

    // Update visual meshes
    if (group.current) {
      group.current.position.copy(st.pos)
      group.current.rotation.y = st.heading
    }

    // Wheels rotation & visual steering
    const wr = st.wheelRot
    if (wheelFL.current) {
      wheelFL.current.rotation.x = wr
      wheelFL.current.rotation.y = THREE.MathUtils.lerp(
        wheelFL.current.rotation.y,
        st.steerAngle,
        15 * dt,
      )
    }
    if (wheelFR.current) {
      wheelFR.current.rotation.x = wr
      wheelFR.current.rotation.y = THREE.MathUtils.lerp(
        wheelFR.current.rotation.y,
        st.steerAngle,
        15 * dt,
      )
    }
    if (wheelRL.current) wheelRL.current.rotation.x = wr
    if (wheelRR.current) wheelRR.current.rotation.x = wr

    // Steering wheel & dashboard needles
    if (steerWheel.current) {
      steerWheel.current.rotation.z = -st.steerAngle * 2.2
    }
    if (speedNeedle.current) {
      const maxSpeed = spec.topSpeed / 3.6
      speedNeedle.current.rotation.z = -(Math.abs(st.speed) / maxSpeed) * 4.2
    }
    if (rpmNeedle.current) {
      rpmNeedle.current.rotation.z = -(st.rpm / 8000) * 4.2
    }

    // Camera Controller (Smooth Chase vs Cockpit)
    const forwardX = Math.sin(st.heading)
    const forwardZ = Math.cos(st.heading)

    if (cameraMode === 'cockpit') {
      // First-person view inside driver seat
      const eyeOffset = new THREE.Vector3(0, 1.35, -0.28).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        st.heading,
      )
      const shakeAmt = st.shake + (st.isDrifting ? 0.03 : 0)
      r3fState.camera.position.set(
        st.pos.x + eyeOffset.x + Math.sin(st.time * 30) * shakeAmt * 0.4,
        st.pos.y + eyeOffset.y + Math.sin(st.time * 48) * shakeAmt * 0.3,
        st.pos.z + eyeOffset.z + Math.cos(st.time * 25) * shakeAmt * 0.4,
      )
      r3fState.camera.rotation.set(0, st.heading, 0)
    } else {
      // Third-person chase camera
      const speedOffset = Math.min(2.5, Math.abs(st.speed) * 0.05)
      const targetCamPos = new THREE.Vector3(
        st.pos.x - forwardX * (5.5 + speedOffset),
        st.pos.y + 2.3 + speedOffset * 0.3,
        st.pos.z - forwardZ * (5.5 + speedOffset),
      )
      const targetLook = new THREE.Vector3(
        st.pos.x + forwardX * 6.0,
        st.pos.y + 1.2,
        st.pos.z + forwardZ * 6.0,
      )

      smoothCamPos.current.lerp(targetCamPos, Math.min(1, 10 * dt))
      smoothCamLook.current.lerp(targetLook, Math.min(1, 12 * dt))

      r3fState.camera.position.copy(smoothCamPos.current)
      r3fState.camera.position.y += Math.sin(st.time * 35) * st.shake * 0.5
      r3fState.camera.lookAt(smoothCamLook.current)
    }

    // Checkpoint & Finish detection
    const cps = trackDef.checkpointRatios
    for (let c = 0; c < cps.length; c++) {
      const cpU = cps[c]
      if (st.lastCheckpoint === c && trackInfo.u >= cpU && trackInfo.u < cpU + 0.12) {
        st.lastCheckpoint = c + 1
        playCheckpointChime()
        break
      }
    }

    // Finish crossing: require all intermediate checkpoints passed
    if (
      !st.finished &&
      st.lastCheckpoint >= cps.length &&
      (trackInfo.u > 0.96 || (trackInfo.u < 0.05 && st.lastCheckpoint >= cps.length))
    ) {
      st.finished = true
      st.lastCheckpoint = TOTAL_CHECKPOINTS
      store.finishRace(st.time)
    }

    // Co-Driver Pacenotes lookup
    const pacenote = getUpcomingPacenote(
      selectedTrack,
      trackInfo.u,
      Math.abs(st.speed) * 3.6,
    )

    // Update Zustand race telemetry for HUD
    store.setRace({
      speed: Math.abs(st.speed) * 3.6,
      rpm: st.rpm,
      gear: st.gear,
      time: st.time,
      checkpoint: st.lastCheckpoint,
      totalCheckpoints: TOTAL_CHECKPOINTS,
      lapProgress: Math.round(trackInfo.u * 100),
      position: 1,
      boostRemaining: Math.round(st.boostRemaining),
      isDrifting: st.isDrifting,
      pacenote,
    })
  })

  return (
    <group ref={group}>
      <CarModel
        spec={spec}
        wheelFLRef={wheelFL}
        wheelFRRef={wheelFR}
        wheelRLRef={wheelRL}
        wheelRRRef={wheelRR}
        steerWheelRef={steerWheel}
        speedNeedleRef={speedNeedle}
        rpmNeedleRef={rpmNeedle}
        currentGear={displayGear}
        isCockpit={cameraMode === 'cockpit'}
      />

      {/* Reactive digital gear indicator in cockpit */}
      <group position={[0, 0.95, 0]}>
        <Text
          position={[0, 0.07, -0.82]}
          rotation={[0.65, 0, 0]}
          fontSize={0.11}
          color="#00e676"
          anchorX="center"
          anchorY="middle"
        >
          {displayGear}
        </Text>
      </group>
    </group>
  )
}
