import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  createInitialPhysicsState,
  updateVehiclePhysics,
  type VehicleInputs,
} from '../game/physics'
import { resolveVehicleCollisions, createObstacleGrid } from '../game/collisions'
import { CARS } from '../store/gameStore'
import type { NearestTrackResult } from '../game/Track'

function dummyTrackInfo(offTrack: boolean = false): NearestTrackResult {
  return {
    u: 0.1,
    point: new THREE.Vector3(0, 0, 0),
    tangent: new THREE.Vector3(0, 0, 1),
    right: new THREE.Vector3(1, 0, 0),
    width: 7,
    dist: offTrack ? 6 : 1,
    lateral: offTrack ? 5.5 : 1.0,
    offTrack,
  }
}

function emptyInputs(): VehicleInputs {
  return {
    throttle: 0,
    brake: 0,
    steer: 0,
    handbrake: false,
    gearUp: false,
    gearDown: false,
    boost: false,
    reset: false,
  }
}

describe('Vehicle Physics & Collision Engine', () => {
  it('accelerates with throttle input when movement is enabled', () => {
    const state = createInitialPhysicsState()
    const inputs = { ...emptyInputs(), throttle: 1 }
    const spec = CARS[0]
    const track = dummyTrackInfo(false)

    // Step physics forward 10 frames
    for (let i = 0; i < 10; i++) {
      updateVehiclePhysics(state, inputs, spec, track, 0.02, true)
    }

    expect(state.speed).toBeGreaterThan(0.5)
    expect(state.rpm).toBeGreaterThan(800)
    expect(state.pos.z).toBeGreaterThan(0)
  })

  it('prevents movement when canMove is false (during countdown)', () => {
    const state = createInitialPhysicsState()
    const inputs = { ...emptyInputs(), throttle: 1 }
    const spec = CARS[0]
    const track = dummyTrackInfo(false)

    updateVehiclePhysics(state, inputs, spec, track, 0.05, false)

    expect(state.speed).toBe(0)
    expect(state.pos.x).toBe(0)
    expect(state.pos.z).toBe(0)
    // Engine can rev up in place
    expect(state.rpm).toBeGreaterThan(800)
  })

  it('applies braking and engages reverse when stationary', () => {
    const state = createInitialPhysicsState()
    state.speed = 10
    const inputs = { ...emptyInputs(), brake: 1 }
    const spec = CARS[0]
    const track = dummyTrackInfo(false)

    // Brake should reduce speed
    updateVehiclePhysics(state, inputs, spec, track, 0.05, true)
    expect(state.speed).toBeLessThan(10)

    // Stationary reverse test
    state.speed = 0
    updateVehiclePhysics(state, inputs, spec, track, 0.05, true)
    expect(state.speed).toBeLessThan(0)
  })

  it('grip meaningfully influences lateral drift recovery', () => {
    const highGripSpec = { ...CARS[0], grip: 1.5 }
    const lowGripSpec = { ...CARS[0], grip: 0.5 }

    const highGripState = createInitialPhysicsState()
    highGripState.speed = 15
    highGripState.lateralVelocity = 8.0 // Initial slide

    const lowGripState = createInitialPhysicsState()
    lowGripState.speed = 15
    lowGripState.lateralVelocity = 8.0

    const inputs = emptyInputs()
    const track = dummyTrackInfo(false)

    // Step forward 5 frames
    for (let i = 0; i < 5; i++) {
      updateVehiclePhysics(highGripState, inputs, highGripSpec, track, 0.02, true)
      updateVehiclePhysics(lowGripState, inputs, lowGripSpec, track, 0.02, true)
    }

    // High grip car recovers from slide faster than low grip car
    expect(highGripState.lateralVelocity).toBeLessThan(lowGripState.lateralVelocity)
  })

  it('handbrake reduces traction and initiates drift state', () => {
    const state = createInitialPhysicsState()
    state.speed = 14
    const spec = CARS[0]
    const track = dummyTrackInfo(false)
    const inputs = { ...emptyInputs(), steer: 1, handbrake: true }

    updateVehiclePhysics(state, inputs, spec, track, 0.05, true)

    expect(state.isDrifting).toBe(true)
    expect(Math.abs(state.lateralVelocity)).toBeGreaterThan(0)
  })

  it('applies speed and grip penalties when off-road', () => {
    const onTrackState = createInitialPhysicsState()
    const offTrackState = createInitialPhysicsState()
    const spec = CARS[0]
    const inputs = { ...emptyInputs(), throttle: 1 }

    for (let i = 0; i < 15; i++) {
      updateVehiclePhysics(onTrackState, inputs, spec, dummyTrackInfo(false), 0.02, true)
      updateVehiclePhysics(offTrackState, inputs, spec, dummyTrackInfo(true), 0.02, true)
    }

    // On-track vehicle gains significantly more speed than off-track vehicle
    expect(onTrackState.speed).toBeGreaterThan(offTrackState.speed)
  })

  it('resolves roadside obstacle collisions with stable push-back', () => {
    const state = createInitialPhysicsState()
    state.pos.set(5.0, 0.5, 10.0)
    state.speed = 12.0
    state.heading = 0 // Facing +Z

    // Place an obstacle directly in front at (5.0, 11.2)
    const grid = createObstacleGrid([
      { x: 5.0, z: 11.2, radius: 0.8, elasticity: 0.2, slowdown: 0.6 },
    ])

    let impactReported = false
    const collided = resolveVehicleCollisions(state, grid, () => {
      impactReported = true
    })

    expect(collided).toBe(true)
    expect(impactReported).toBe(true)
    // Speed should be reduced by collision
    expect(state.speed).toBeLessThan(12.0)
    // Vehicle pushed back away from obstacle
    expect(state.pos.z).toBeLessThan(11.2)
  })

  it('clamps invalid values and prevents NaN / Infinity in physics state', () => {
    const state = createInitialPhysicsState()
    state.speed = NaN
    state.pos.set(Infinity, -Infinity, NaN)

    updateVehiclePhysics(state, emptyInputs(), CARS[0], dummyTrackInfo(false), 0.02, true)

    expect(Number.isFinite(state.speed)).toBe(true)
    expect(Number.isFinite(state.pos.x)).toBe(true)
    expect(Number.isFinite(state.pos.y)).toBe(true)
    expect(Number.isFinite(state.pos.z)).toBe(true)
  })
})
