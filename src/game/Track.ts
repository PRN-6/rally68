import * as THREE from 'three'
import type { PacenoteInfo } from '../store/gameStore'

export interface TrackPoint {
  x: number
  y: number
  z: number
  w: number
}

export interface TrackData {
  id: string
  name: string
  points: TrackPoint[]
  checkpointRatios: number[] // e.g. [0.2, 0.4, 0.6, 0.8]
}

export const TRACK_DEFINITIONS: Record<string, TrackData> = {
  mountain: {
    id: 'mountain',
    name: 'MOUNTAIN PASS',
    points: [
      { x: 0, y: 0.5, z: 0, w: 7.0 },
      { x: 40, y: 1.0, z: 30, w: 7.0 },
      { x: 90, y: 3.0, z: 65, w: 7.0 },
      { x: 145, y: 7.5, z: 95, w: 7.0 },
      { x: 205, y: 13.0, z: 120, w: 7.0 },
      { x: 265, y: 20.0, z: 155, w: 7.0 },
      { x: 320, y: 27.0, z: 210, w: 7.0 },
      { x: 355, y: 33.0, z: 275, w: 6.5 },
      { x: 335, y: 36.5, z: 345, w: 6.5 },
      { x: 265, y: 38.0, z: 390, w: 7.0 },
      { x: 185, y: 34.0, z: 410, w: 7.0 },
      { x: 105, y: 28.0, z: 425, w: 7.0 },
      { x: 35, y: 20.0, z: 430, w: 7.0 },
      { x: -35, y: 14.0, z: 415, w: 7.0 },
      { x: -95, y: 9.0, z: 375, w: 7.0 },
      { x: -135, y: 5.5, z: 310, w: 6.5 },
      { x: -150, y: 2.0, z: 240, w: 6.5 },
      { x: -120, y: 0.5, z: 170, w: 7.0 },
      { x: -60, y: -0.5, z: 110, w: 7.0 },
      { x: -15, y: 0.0, z: 50, w: 7.0 },
      { x: 0, y: 0.5, z: 0, w: 7.0 },
    ],
    checkpointRatios: [0.2, 0.4, 0.6, 0.8],
  },
  forest: {
    id: 'forest',
    name: 'FOREST SPRINT',
    points: [
      { x: 0, y: 0.5, z: 0, w: 6.5 },
      { x: 25, y: 0.5, z: 50, w: 6.5 },
      { x: 70, y: 1.5, z: 90, w: 6.0 },
      { x: 130, y: 2.5, z: 85, w: 6.0 },
      { x: 180, y: 4.0, z: 120, w: 6.5 },
      { x: 210, y: 5.0, z: 180, w: 6.0 },
      { x: 185, y: 4.5, z: 250, w: 6.0 },
      { x: 120, y: 3.5, z: 290, w: 6.5 },
      { x: 50, y: 2.0, z: 310, w: 6.0 },
      { x: -20, y: 1.0, z: 275, w: 6.0 },
      { x: -70, y: 1.5, z: 210, w: 6.5 },
      { x: -100, y: 2.0, z: 140, w: 6.0 },
      { x: -75, y: 1.5, z: 70, w: 6.5 },
      { x: -30, y: 0.8, z: 20, w: 6.5 },
      { x: 0, y: 0.5, z: 0, w: 6.5 },
    ],
    checkpointRatios: [0.2, 0.4, 0.6, 0.8],
  },
  coastal: {
    id: 'coastal',
    name: 'COASTAL LOOP',
    points: [
      { x: 0, y: 0.5, z: 0, w: 7.5 },
      { x: 60, y: 0.5, z: 30, w: 7.5 },
      { x: 130, y: 1.0, z: 70, w: 7.5 },
      { x: 180, y: 2.0, z: 140, w: 7.0 },
      { x: 190, y: 2.5, z: 220, w: 7.0 },
      { x: 150, y: 2.0, z: 290, w: 7.5 },
      { x: 80, y: 1.5, z: 330, w: 7.5 },
      { x: -10, y: 1.0, z: 310, w: 7.0 },
      { x: -80, y: 0.8, z: 240, w: 7.0 },
      { x: -110, y: 0.5, z: 150, w: 7.5 },
      { x: -80, y: 0.5, z: 70, w: 7.5 },
      { x: -25, y: 0.5, z: 15, w: 7.5 },
      { x: 0, y: 0.5, z: 0, w: 7.5 },
    ],
    checkpointRatios: [0.2, 0.4, 0.6, 0.8],
  },
}

export const TRACK_POINTS = TRACK_DEFINITIONS.mountain.points
export const CHECKPOINT_INDICES = [3, 7, 11, 15, 19]
export const TOTAL_CHECKPOINTS = 5 // CP 1, 2, 3, 4, 5 (finish)

export interface SampledTrackPoint {
  u: number
  point: THREE.Vector3
  tangent: THREE.Vector3
  right: THREE.Vector3
  width: number
  cumulativeDist: number
  curvature: number // rad / meter (positive = right turn, negative = left turn)
}

export interface NearestTrackResult {
  u: number
  point: THREE.Vector3
  tangent: THREE.Vector3
  right: THREE.Vector3
  width: number
  dist: number
  lateral: number
  offTrack: boolean
}

interface TrackCache {
  curve: THREE.CatmullRomCurve3
  samples: SampledTrackPoint[]
  totalLength: number
  grid: Map<string, number[]>
  cellSize: number
}

const trackCaches = new Map<string, TrackCache>()
const SAMPLE_COUNT = 600
const CELL_SIZE = 25

// Scratch vectors for zero allocation during runtime queries
const _scratchPos = new THREE.Vector3()
const _scratchVec = new THREE.Vector3()
const _scratchSeg = new THREE.Vector3()
const _scratchDiff = new THREE.Vector3()

export function getTrackCurve(trackId: string = 'mountain'): THREE.CatmullRomCurve3 {
  return getTrackCache(trackId).curve
}

export function buildCurve(trackId: string = 'mountain'): THREE.CatmullRomCurve3 {
  const def = TRACK_DEFINITIONS[trackId] ?? TRACK_DEFINITIONS.mountain
  const pts = def.points.map((p) => new THREE.Vector3(p.x, p.y, p.z))
  return new THREE.CatmullRomCurve3(pts, true, 'centripetal', 0.5)
}

export function getTrackCache(trackId: string = 'mountain'): TrackCache {
  const validId = TRACK_DEFINITIONS[trackId] ? trackId : 'mountain'
  const cached = trackCaches.get(validId)
  if (cached) return cached

  const def = TRACK_DEFINITIONS[validId]
  const curve = buildCurve(validId)
  const samples: SampledTrackPoint[] = []
  let totalLength = 0

  const up = new THREE.Vector3(0, 1, 0)

  // 1. First pass: sample positions and tangents
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const u = i / SAMPLE_COUNT
    const point = curve.getPoint(u)
    const tangent = curve.getTangent(u).normalize()
    const right = new THREE.Vector3().crossVectors(up, tangent).normalize()

    // Sample width smoothly from definition
    const pLen = def.points.length - 1
    const idx = Math.min(pLen, Math.floor(u * pLen))
    const width = def.points[idx].w

    if (i > 0) {
      const prev = samples[i - 1].point
      totalLength += prev.distanceTo(point)
    }

    samples.push({
      u,
      point,
      tangent,
      right,
      width,
      cumulativeDist: totalLength,
      curvature: 0,
    })
  }

  // 2. Second pass: compute curvature
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const prev = samples[(i - 1 + SAMPLE_COUNT) % SAMPLE_COUNT]
    const next = samples[(i + 1) % SAMPLE_COUNT]
    const ds = (next.cumulativeDist - prev.cumulativeDist + (next.cumulativeDist < prev.cumulativeDist ? totalLength : 0)) || 1

    const headingPrev = Math.atan2(prev.tangent.x, prev.tangent.z)
    const headingNext = Math.atan2(next.tangent.x, next.tangent.z)
    let dHeading = headingNext - headingPrev
    while (dHeading > Math.PI) dHeading -= Math.PI * 2
    while (dHeading < -Math.PI) dHeading += Math.PI * 2

    samples[i].curvature = dHeading / ds
  }

  // 3. Build 2D spatial grid
  const grid = new Map<string, number[]>()
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const p = samples[i].point
    const cx = Math.floor(p.x / CELL_SIZE)
    const cz = Math.floor(p.z / CELL_SIZE)

    // Add to 3x3 surrounding cells to guarantee boundary overlap
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const key = `${cx + dx},${cz + dz}`
        let cell = grid.get(key)
        if (!cell) {
          cell = []
          grid.set(key, cell)
        }
        cell.push(i)
      }
    }
  }

  const cache: TrackCache = {
    curve,
    samples,
    totalLength,
    grid,
    cellSize: CELL_SIZE,
  }
  trackCaches.set(validId, cache)
  return cache
}

/**
 * High-performance, zero-allocation nearest track query with spatial indexing.
 */
export function getNearestTrackInfo(
  trackId: string,
  pos: THREE.Vector3,
  out?: NearestTrackResult,
): NearestTrackResult {
  const cache = getTrackCache(trackId)
  const samples = cache.samples
  const cx = Math.floor(pos.x / cache.cellSize)
  const cz = Math.floor(pos.z / cache.cellSize)
  const cellKey = `${cx},${cz}`

  const candidateIndices = cache.grid.get(cellKey)
  let bestIdx = 0
  let bestDistSq = Infinity

  if (candidateIndices && candidateIndices.length > 0) {
    for (let i = 0; i < candidateIndices.length; i++) {
      const idx = candidateIndices[i]
      const sp = samples[idx].point
      const dx = sp.x - pos.x
      const dz = sp.z - pos.z
      const dy = sp.y - pos.y
      const dSq = dx * dx + dy * dy + dz * dz
      if (dSq < bestDistSq) {
        bestDistSq = dSq
        bestIdx = idx
      }
    }
  } else {
    // Fallback: coarse step through samples
    for (let i = 0; i < SAMPLE_COUNT; i += 4) {
      const sp = samples[i].point
      const dx = sp.x - pos.x
      const dz = sp.z - pos.z
      const dy = sp.y - pos.y
      const dSq = dx * dx + dy * dy + dz * dz
      if (dSq < bestDistSq) {
        bestDistSq = dSq
        bestIdx = i
      }
    }
    // Refine around coarse match
    const start = (bestIdx - 6 + SAMPLE_COUNT) % SAMPLE_COUNT
    for (let step = 0; step < 13; step++) {
      const idx = (start + step) % SAMPLE_COUNT
      const sp = samples[idx].point
      const dx = sp.x - pos.x
      const dz = sp.z - pos.z
      const dy = sp.y - pos.y
      const dSq = dx * dx + dy * dy + dz * dz
      if (dSq < bestDistSq) {
        bestDistSq = dSq
        bestIdx = idx
      }
    }
  }

  // Linear projection between bestIdx and neighbors for exact sub-sample precision
  const prevIdx = (bestIdx - 1 + SAMPLE_COUNT) % SAMPLE_COUNT
  const nextIdx = (bestIdx + 1) % SAMPLE_COUNT
  const bestSample = samples[bestIdx]
  const prevSample = samples[prevIdx]
  const nextSample = samples[nextIdx]

  // Test segment [prev, best] and [best, next]
  let finalPoint = bestSample.point
  let finalTangent = bestSample.tangent
  let finalRight = bestSample.right
  let finalU = bestSample.u
  let finalWidth = bestSample.width

  // Check [best, next] segment
  _scratchSeg.subVectors(nextSample.point, bestSample.point)
  const segLenSq = _scratchSeg.lengthSq()
  if (segLenSq > 0.0001) {
    _scratchVec.subVectors(pos, bestSample.point)
    const t = Math.max(0, Math.min(1, _scratchVec.dot(_scratchSeg) / segLenSq))
    if (t > 0 && t < 1) {
      _scratchPos.copy(bestSample.point).addScaledVector(_scratchSeg, t)
      const dSq = _scratchPos.distanceToSquared(pos)
      if (dSq < bestDistSq) {
        bestDistSq = dSq
        finalPoint = _scratchPos
        finalU = bestSample.u + t * (1 / SAMPLE_COUNT)
        if (finalU >= 1) finalU -= 1
        finalTangent = bestSample.tangent
        finalRight = bestSample.right
      }
    }
  }

  // Check [prev, best] segment
  _scratchSeg.subVectors(bestSample.point, prevSample.point)
  const prevSegLenSq = _scratchSeg.lengthSq()
  if (prevSegLenSq > 0.0001) {
    _scratchVec.subVectors(pos, prevSample.point)
    const t = Math.max(0, Math.min(1, _scratchVec.dot(_scratchSeg) / prevSegLenSq))
    if (t > 0 && t < 1) {
      _scratchPos.copy(prevSample.point).addScaledVector(_scratchSeg, t)
      const dSq = _scratchPos.distanceToSquared(pos)
      if (dSq < bestDistSq) {
        bestDistSq = dSq
        finalPoint = _scratchPos
        finalU = prevSample.u + t * (1 / SAMPLE_COUNT)
        if (finalU >= 1) finalU -= 1
        finalTangent = prevSample.tangent
        finalRight = prevSample.right
      }
    }
  }

  const dist = Math.sqrt(bestDistSq)
  _scratchDiff.subVectors(pos, finalPoint)
  const lateral = _scratchDiff.dot(finalRight)
  const offTrack = Math.abs(lateral) > finalWidth * 0.5

  if (out) {
    out.u = finalU
    out.point.copy(finalPoint)
    out.tangent.copy(finalTangent)
    out.right.copy(finalRight)
    out.width = finalWidth
    out.dist = dist
    out.lateral = lateral
    out.offTrack = offTrack
    return out
  }

  return {
    u: finalU,
    point: finalPoint.clone(),
    tangent: finalTangent.clone(),
    right: finalRight.clone(),
    width: finalWidth,
    dist,
    lateral,
    offTrack,
  }
}

/**
 * Backward compatibility wrapper for old code calls.
 */
export function nearestTrackInfo(curve: THREE.CatmullRomCurve3, pos: THREE.Vector3) {
  // Finds matching track cache by comparing start point
  let trackId = 'mountain'
  for (const [id, c] of trackCaches.entries()) {
    if (c.curve === curve) {
      trackId = id
      break
    }
  }
  return getNearestTrackInfo(trackId, pos)
}

/**
 * Reference un-optimized implementation used for validation tests.
 */
export function nearestTrackInfoSlow(curve: THREE.CatmullRomCurve3, pos: THREE.Vector3) {
  let bestU = 0
  let bestDist = Infinity
  const N = 400
  for (let i = 0; i <= N; i++) {
    const u = i / N
    const p = curve.getPoint(u)
    const d = p.distanceToSquared(pos)
    if (d < bestDist) {
      bestDist = d
      bestU = u
    }
  }
  for (let j = -3; j <= 3; j++) {
    const u = Math.min(1, Math.max(0, bestU + j / 4000))
    const p = curve.getPoint(u)
    const d = p.distanceToSquared(pos)
    if (d < bestDist) {
      bestDist = d
      bestU = u
    }
  }
  const point = curve.getPoint(bestU)
  const tangent = curve.getTangent(bestU).normalize()
  const pLen = TRACK_POINTS.length - 1
  const idx = Math.min(pLen, Math.floor(bestU * pLen))
  const width = TRACK_POINTS[idx].w
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), tangent).normalize()
  const lateral = pos.clone().sub(point).dot(right)
  const offTrack = Math.abs(lateral) > width * 0.5
  return {
    u: bestU,
    point,
    tangent,
    width,
    offTrack,
    dist: Math.sqrt(bestDist),
    lateral,
    right,
  }
}

/**
 * Analyzes track curvature ahead of the vehicle to generate Co-Driver Pacenotes.
 */
export function getUpcomingPacenote(
  trackId: string,
  currentU: number,
  speedKmh: number,
): PacenoteInfo | null {
  const cache = getTrackCache(trackId)
  const speedMps = Math.max(8, speedKmh / 3.6)
  // Look-ahead distance increases with speed: ~25m at low speed, up to 70m at 200km/h
  const lookaheadDist = Math.min(85, Math.max(22, speedMps * 1.5))
  const lookaheadUDelta = lookaheadDist / cache.totalLength

  const sampleIdx = Math.floor(currentU * SAMPLE_COUNT)
  const lookaheadSteps = Math.max(4, Math.floor(lookaheadUDelta * SAMPLE_COUNT))

  let maxCurvature = 0
  let maxStep = 0

  for (let s = 2; s <= lookaheadSteps; s++) {
    const idx = (sampleIdx + s) % SAMPLE_COUNT
    const k = cache.samples[idx].curvature
    if (Math.abs(k) > Math.abs(maxCurvature)) {
      maxCurvature = k
      maxStep = s
    }
  }

  const absK = Math.abs(maxCurvature)
  // Curvature threshold for a notable turn (rad/meter)
  if (absK < 0.015) {
    return null
  }

  const isRight = maxCurvature > 0
  const distToTurn = Math.round((maxStep / SAMPLE_COUNT) * cache.totalLength)

  let severity = 6
  let direction: PacenoteInfo['direction'] = isRight ? 'right' : 'left'
  let text = ''

  if (absK > 0.08) {
    severity = 1
    direction = isRight ? 'hairpin-right' : 'hairpin-left'
    text = isRight ? 'HAIRPIN RIGHT' : 'HAIRPIN LEFT'
  } else if (absK > 0.05) {
    severity = 2
    text = isRight ? 'SHARP RIGHT (2)' : 'SHARP LEFT (2)'
  } else if (absK > 0.035) {
    severity = 3
    text = isRight ? 'MEDIUM RIGHT (3)' : 'MEDIUM LEFT (3)'
  } else if (absK > 0.025) {
    severity = 4
    text = isRight ? 'EASY RIGHT (4)' : 'EASY LEFT (4)'
  } else {
    severity = 5
    text = isRight ? 'SLIGHT RIGHT (5)' : 'SLIGHT LEFT (5)'
  }

  return {
    direction,
    severity,
    text,
    distance: distToTurn,
  }
}
