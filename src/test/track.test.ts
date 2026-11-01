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
})

