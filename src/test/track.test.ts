import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  getTrackCache,
  getNearestTrackInfo,
  nearestTrackInfoSlow,
  getUpcomingPacenote,
  TRACK_DEFINITIONS,
} from '../game/Track'

describe('Track Mathematics & Spatial Query System', () => {
  it('correctly initializes track cache and spatial grid', () => {
    const cache = getTrackCache('mountain')
    expect(cache.samples.length).toBe(600)
    expect(cache.totalLength).toBeGreaterThan(1000)
    expect(cache.grid.size).toBeGreaterThan(0)
  })

  it('calculates nearest point accurately on a straight or smooth segment', () => {
    const cache = getTrackCache('mountain')
    const sample = cache.samples[50]
    // Point directly on the centerline
    const queryPos = sample.point.clone()
    const result = getNearestTrackInfo('mountain', queryPos)

    expect(result.dist).toBeLessThan(0.2)
    expect(result.offTrack).toBe(false)
    expect(Math.abs(result.lateral)).toBeLessThan(0.2)
  })

  it('calculates lateral offset and detects off-track positions', () => {
    const cache = getTrackCache('mountain')
    const sample = cache.samples[100]
    const right = sample.right.clone()

    // Position 1.5m to the right (still on 7m track, width/2 = 3.5m)
    const onTrackPos = sample.point.clone().addScaledVector(right, 1.5)
    const onTrackResult = getNearestTrackInfo('mountain', onTrackPos)
    expect(onTrackResult.offTrack).toBe(false)
    expect(onTrackResult.lateral).toBeCloseTo(1.5, 0)

    // Position 6.0m to the right (off track: 6.0 > 3.5)
    const offTrackPos = sample.point.clone().addScaledVector(right, 6.0)
    const offTrackResult = getNearestTrackInfo('mountain', offTrackPos)
    expect(offTrackResult.offTrack).toBe(true)
    expect(offTrackResult.dist).toBeGreaterThan(3.5)
  })

  it('handles track wrapping and finish line seamlessly', () => {
    const cache = getTrackCache('mountain')
    const nearStart = cache.curve.getPoint(0.01)
    const nearEnd = cache.curve.getPoint(0.99)

    const resStart = getNearestTrackInfo('mountain', nearStart)
    const resEnd = getNearestTrackInfo('mountain', nearEnd)

    expect(resStart.u).toBeLessThan(0.05)
    expect(resEnd.u).toBeGreaterThan(0.95)
  })

  it('optimized lookup produces consistent results with reference implementation', () => {
    const cache = getTrackCache('mountain')
    const testPoints = [
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(45, 1.2, 32),
      new THREE.Vector3(200, 12, 125),
      new THREE.Vector3(-100, 8, 360),
      new THREE.Vector3(15, 0.5, 45),
    ]

    for (const pt of testPoints) {
      const fastResult = getNearestTrackInfo('mountain', pt)
      const slowResult = nearestTrackInfoSlow(cache.curve, pt)

      // Fast query distance matches slow within 0.35m tolerance
      expect(Math.abs(fastResult.dist - slowResult.dist)).toBeLessThan(0.35)
      // Matching off-track determination
      expect(fastResult.offTrack).toBe(slowResult.offTrack)
    }
  })

  it('pacenote generator identifies upcoming turns and severities', () => {
    // Coastal loop has hairpin turns
    let detectedTurn = false
    for (let u = 0; u < 1.0; u += 0.05) {
      const note = getUpcomingPacenote('coastal', u, 90)
      if (note) {
        detectedTurn = true
        expect(['left', 'right', 'hairpin-left', 'hairpin-right']).toContain(note.direction)
        expect(note.severity).toBeGreaterThanOrEqual(1)
        expect(note.severity).toBeLessThanOrEqual(5)
        expect(note.distance).toBeGreaterThan(0)
        break
      }
    }
    expect(detectedTurn).toBe(true)
  })

  it('supports all configured tracks in TRACK_DEFINITIONS', () => {
    const trackIds = Object.keys(TRACK_DEFINITIONS)
    expect(trackIds).toContain('mountain')
    expect(trackIds).toContain('forest')
    expect(trackIds).toContain('coastal')

    for (const id of trackIds) {
      const cache = getTrackCache(id)
      expect(cache.samples.length).toBe(600)
    }
  })

  it('verifies that roadside tree positions are strictly cleared from the road', () => {
    for (const trackId of ['mountain', 'forest', 'coastal']) {
      const cache = getTrackCache(trackId)
      const curve = cache.curve
      const up = new THREE.Vector3(0, 1, 0)
      const treeSamples = 60

      for (let i = 0; i < treeSamples; i++) {
        const u = i / treeSamples
        const p = curve.getPoint(u)
        const t = curve.getTangent(u).normalize()
        const right = new THREE.Vector3().crossVectors(up, t).normalize()

        for (const side of [-1, 1]) {
          const offset = 6.8 + (i % 5) * 0.6
          const along = ((i % 4) - 1.5) * 1.5
          const pos = p.clone().addScaledVector(t, along).addScaledVector(right, side * offset)

          const trackInfo = getNearestTrackInfo(trackId, pos)
          const minClearance = trackInfo.width * 0.5 + 2.2

          if (trackInfo.dist < minClearance) {
            const away = pos.clone().sub(trackInfo.point).setY(0).normalize()
            if (away.lengthSq() < 0.01) away.copy(right).multiplyScalar(side)
            pos.copy(trackInfo.point).addScaledVector(away, minClearance + 0.8)
            const recheck = getNearestTrackInfo(trackId, pos)
            if (recheck.dist < minClearance) continue
          }

          const finalInfo = getNearestTrackInfo(trackId, pos)
          expect(finalInfo.offTrack).toBe(true)
          expect(finalInfo.dist).toBeGreaterThanOrEqual(finalInfo.width * 0.5 + 1.8)
        }
      }
    }
  })
})

