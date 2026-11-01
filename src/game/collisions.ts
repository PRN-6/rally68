import type { VehiclePhysicsState } from './physics'

export interface ObstacleCollider {
  x: number
  z: number
  radius: number
  elasticity: number // 0 (dead stop) to 1 (full bounce)
  slowdown: number // Speed multiplier on impact (e.g. 0.6)
}

export interface ObstacleGrid {
  grid: Map<string, ObstacleCollider[]>
  cellSize: number
}

const COLLISION_CELL_SIZE = 15

let _activeObstacleGrid: ObstacleGrid | null = null

export function getActiveObstacleGrid(): ObstacleGrid | null {
  return _activeObstacleGrid
}

export function setActiveObstacleGrid(grid: ObstacleGrid | null) {
  _activeObstacleGrid = grid
}

export function createObstacleGrid(obstacles: ObstacleCollider[]): ObstacleGrid {
  const grid = new Map<string, ObstacleCollider[]>()
  for (const obs of obstacles) {
    const cx = Math.floor(obs.x / COLLISION_CELL_SIZE)
    const cz = Math.floor(obs.z / COLLISION_CELL_SIZE)

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const key = `${cx + dx},${cz + dz}`
        let list = grid.get(key)
        if (!list) {
          list = []
          grid.set(key, list)
        }
        list.push(obs)
      }
    }
  }
  return { grid, cellSize: COLLISION_CELL_SIZE }
}

const CAR_COLLISION_RADIUS = 1.1

/**
 * Checks vehicle position against roadside obstacle colliders and applies stable push-back.
 */
export function resolveVehicleCollisions(
  state: VehiclePhysicsState,
  obstacleGrid: ObstacleGrid | null,
  onImpact?: (severity: number) => void,
): boolean {
  if (!obstacleGrid) return false

  const cx = Math.floor(state.pos.x / obstacleGrid.cellSize)
  const cz = Math.floor(state.pos.z / obstacleGrid.cellSize)
  const key = `${cx},${cz}`
  const candidates = obstacleGrid.grid.get(key)
  if (!candidates || candidates.length === 0) return false

  let collided = false

  for (let i = 0; i < candidates.length; i++) {
    const obs = candidates[i]
    const dx = state.pos.x - obs.x
    const dz = state.pos.z - obs.z
    const distSq = dx * dx + dz * dz
    const minDist = CAR_COLLISION_RADIUS + obs.radius

    if (distSq < minDist * minDist) {
      collided = true
      const dist = Math.sqrt(distSq) || 0.001
      const nx = dx / dist
      const nz = dz / dist
      const overlap = minDist - dist

      // Push back vehicle along contact normal
      state.pos.x += nx * overlap * 1.05
      state.pos.z += nz * overlap * 1.05

      // Momentum loss & deflection
      const forwardX = Math.sin(state.heading)
      const forwardZ = Math.cos(state.heading)
      const dot = forwardX * nx + forwardZ * nz

      // If moving toward obstacle, absorb speed
      if (state.speed * dot < 0) {
        state.speed *= obs.slowdown
        state.lateralVelocity *= 0.5
        state.shake = Math.min(0.5, state.shake + 0.25)
        if (onImpact) {
          onImpact(Math.abs(state.speed) / 20)
        }
      }
    }
  }

  return collided
}
