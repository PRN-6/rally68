import * as THREE from 'three'
import type { CarSpec } from '../store/gameStore'
import type { NearestTrackResult } from './Track'

export interface VehicleInputs {
  throttle: number // 0 to 1
  brake: number // 0 to 1
  steer: number // -1 (right) to 1 (left) or vice versa
  handbrake: boolean
  gearUp: boolean
  gearDown: boolean
  boost: boolean
  reset: boolean
}

export interface VehiclePhysicsState {
  pos: THREE.Vector3
  heading: number // Yaw in radians
  speed: number // Forward velocity (m/s)
  lateralVelocity: number // Sideways velocity (m/s) for drifting
  steerAngle: number // Visual & physics steering angle
  gear: number
  rpm: number
  boostRemaining: number // 0 to 100
  isDrifting: boolean
  slipAngle: number // radians
  wheelRot: number
  suspension: number
  lastCheckpoint: number
  progressU: number
  finished: boolean
  shake: number
  time: number
}

export const touchInputs: VehicleInputs = {
  throttle: 0,
  brake: 0,
  steer: 0,
  handbrake: false,
  gearUp: false,
  gearDown: false,
  boost: false,
  reset: false,
}

export function createInitialPhysicsState(): VehiclePhysicsState {
  return {
    pos: new THREE.Vector3(0, 0.5, 0),
    heading: 0.93,
    speed: 0,
    lateralVelocity: 0,
    steerAngle: 0,
    gear: 1,
    rpm: 800,
    boostRemaining: 100,
    isDrifting: false,
    slipAngle: 0,
    wheelRot: 0,
    suspension: 0,
    lastCheckpoint: 0,
    progressU: 0,
    finished: false,
    shake: 0,
    time: 0,
  }
}

// Gear ratios for engine RPM mapping
export const GEAR_RATIOS = [0, 0.18, 0.34, 0.52, 0.70, 0.86, 1.0]

/**
 * Step vehicle physics using bounded sub-steps for frame-rate independence.
 */
export function updateVehiclePhysics(
  state: VehiclePhysicsState,
  inputs: VehicleInputs,
  spec: CarSpec,
  trackInfo: NearestTrackResult,
  dtRaw: number,
  canMove: boolean = true,
): VehiclePhysicsState {
  // Clamp delta time to avoid physics explosion on lag spikes
  const dt = Math.min(0.05, Math.max(0.001, dtRaw))

  // Manual gear shifts
  if (inputs.gearUp) {
    state.gear = Math.min(6, state.gear + 1)
    inputs.gearUp = false
  }
  if (inputs.gearDown) {
    state.gear = Math.max(1, state.gear - 1)
    inputs.gearDown = false
  }

  // During countdown or freeze, car cannot accelerate
  if (!canMove) {
    state.rpm = 800 + (inputs.throttle ? 1800 : 0)
    state.speed = 0
    state.lateralVelocity = 0
    state.isDrifting = false
    return state
  }

  state.time += dt

  const maxSpeedMps = (spec.topSpeed / 3.6)
  const currentGearRatio = GEAR_RATIOS[state.gear] || 0.5
  const topSpeedInGear = maxSpeedMps * currentGearRatio

  // Base acceleration scaled by spec
  let baseAccel = 7.0 * spec.accel
  const brakeForce = 12.0
  const baseGrip = spec.grip * 1.0

  // Boost mechanic (Shift key)
  let isBoosting = false
  if (inputs.boost && state.boostRemaining > 0 && inputs.throttle > 0) {
    baseAccel *= 1.55
    state.boostRemaining = Math.max(0, state.boostRemaining - 20 * dt)
    isBoosting = true
  } else if (!inputs.boost && state.boostRemaining < 100) {
    state.boostRemaining = Math.min(100, state.boostRemaining + 6 * dt)
  }

  // Off-road terrain penalty
  let terrainGrip = baseGrip
  let terrainDrag = 3.5
  if (trackInfo.offTrack) {
    terrainGrip *= 0.55
    terrainDrag = 8.5
    baseAccel *= 0.7
  }

  // Throttle and braking
  let forwardAccel = 0
  if (inputs.throttle > 0 && inputs.brake <= 0) {
    // Diminishing acceleration near gear top speed
    const speedRatioInGear = Math.max(0, state.speed / Math.max(1, topSpeedInGear))
    const powerCurve = Math.max(0.15, 1.0 - speedRatioInGear * 0.85)
    forwardAccel = baseAccel * inputs.throttle * powerCurve
  } else if (inputs.brake > 0) {
    if (state.speed > 0.5) {
      forwardAccel = -brakeForce * inputs.brake
    } else {
      // Reverse
      forwardAccel = -baseAccel * 0.55 * inputs.brake
    }
  } else {
    // Natural engine / rolling drag
    forwardAccel = -terrainDrag * Math.sign(state.speed)
  }

  // Update forward speed
  state.speed += forwardAccel * dt

  // Natural stop when near zero without throttle
  if (inputs.throttle === 0 && inputs.brake === 0 && Math.abs(state.speed) < 0.2) {
    state.speed = 0
  }

  // Clamp speed to gear maximum and reverse limit
  if (state.speed > topSpeedInGear) {
    // Allow slight coasting down to gear max
    state.speed = Math.max(topSpeedInGear, state.speed - 4.0 * dt)
  }
  if (state.speed < -maxSpeedMps * 0.25) {
    state.speed = -maxSpeedMps * 0.25
  }

  // Steering & Drift Physics
  const handbrake = inputs.handbrake
  const effectiveGrip = handbrake ? terrainGrip * 0.32 : terrainGrip

  // Steering sensitivity based on speed
  const speedRatio = Math.min(1, Math.abs(state.speed) / 7.0)
  const steerRate = (spec.handling || 1.0) * 2.8
  const targetSteerAngle = inputs.steer * 0.45
  state.steerAngle = THREE.MathUtils.lerp(state.steerAngle, targetSteerAngle, 10 * dt)

  // Yaw rotation rate
  const driftBonus = handbrake ? 1.75 : 1.0
  const yawRate = inputs.steer * steerRate * speedRatio * driftBonus

  if (Math.abs(state.speed) > 0.2) {
    const dir = state.speed >= 0 ? 1 : -1
    state.heading += yawRate * dt * dir
  }

  // Lateral velocity calculation (Drift mechanics)
  // When turning or handbraking, centrifugal force generates lateral sliding
  const centripetalForce = state.speed * yawRate
  state.lateralVelocity += centripetalForce * dt * (handbrake ? 0.9 : 0.45)

  // Lateral tire friction opposes sliding: higher grip recovers faster
  const lateralFrictionRate = effectiveGrip * (handbrake ? 5.5 : 12.0)
  state.lateralVelocity = THREE.MathUtils.lerp(state.lateralVelocity, 0, Math.min(1, lateralFrictionRate * dt))

  // Determine if vehicle is actively drifting (for audio and visual skid cues)
  const absLateral = Math.abs(state.lateralVelocity)
  state.isDrifting = (handbrake && Math.abs(state.speed) > 4.0) || (absLateral > 2.2 && Math.abs(state.speed) > 8.0)
  state.slipAngle = state.speed !== 0 ? Math.atan2(state.lateralVelocity, Math.abs(state.speed)) : 0

  // Position integration: forward + lateral vectors
  const forwardX = Math.sin(state.heading)
  const forwardZ = Math.cos(state.heading)
  const rightX = Math.cos(state.heading)
  const rightZ = -Math.sin(state.heading)

  state.pos.x += (forwardX * state.speed + rightX * state.lateralVelocity) * dt
  state.pos.z += (forwardZ * state.speed + rightZ * state.lateralVelocity) * dt

  // Track height conforming and bump bounce
  const targetY = trackInfo.point.y + 0.45 + (trackInfo.offTrack ? Math.sin(state.time * 24) * 0.05 : 0)
  state.pos.y = THREE.MathUtils.lerp(state.pos.y, targetY, Math.min(1, 10 * dt))

  // Wheel rotation
  state.wheelRot += (state.speed / 0.35) * dt

  // Engine RPM calculation based on speed within current gear
  const gearRatioRange = Math.max(0.1, topSpeedInGear)
  const gearRatioFrac = Math.min(1.05, Math.abs(state.speed) / gearRatioRange)
  state.rpm = 800 + gearRatioFrac * (7000 - 800)
  if (inputs.throttle > 0 && state.gear === 1 && state.speed < 1.0) {
    state.rpm = Math.min(7000, state.rpm + 2200)
  }
  if (isBoosting) {
    state.rpm = Math.min(7200, state.rpm + 400)
  }
  state.rpm = Math.max(800, Math.min(7200, state.rpm))

  // Camera shake (bumpiness + high speed + drift + off-road)
  const offRoadShake = trackInfo.offTrack ? 0.08 : 0
  const driftShake = state.isDrifting ? 0.04 : 0
  const speedShake = Math.abs(state.speed) * 0.0006
  state.shake = THREE.MathUtils.lerp(state.shake, offRoadShake + driftShake + speedShake, 8 * dt)

  // Guard against NaN / Infinity
  if (!Number.isFinite(state.pos.x) || !Number.isFinite(state.pos.y) || !Number.isFinite(state.pos.z)) {
    state.pos.set(0, 0.5, 0)
  }
  if (!Number.isFinite(state.speed)) state.speed = 0
  if (!Number.isFinite(state.heading)) state.heading = 0
  if (!Number.isFinite(state.lateralVelocity)) state.lateralVelocity = 0

  return state
}
