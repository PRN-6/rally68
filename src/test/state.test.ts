import { describe, it, expect, beforeEach } from 'vitest'
import {
  useGameStore,
  loadSettings,
  saveSettings,
  saveBestTime,
  getStoredBestTime,
} from '../store/gameStore'
import { TOTAL_CHECKPOINTS } from '../game/Track'

describe('Game State & Race Progression Store', () => {
  beforeEach(() => {
    localStorage.clear()
    useGameStore.getState().resetRace()
    useGameStore.getState().setScreen('menu')
  })

  it('initializes with default state values', () => {
    const s = useGameStore.getState()
    expect(s.screen).toBe('menu')
    expect(s.selectedCar).toBe('rally')
    expect(s.selectedTrack).toBe('mountain')
    expect(s.paused).toBe(false)
    expect(s.finished).toBe(false)
    expect(s.speed).toBe(0)
    expect(s.gear).toBe(1)
    expect(s.totalCheckpoints).toBe(TOTAL_CHECKPOINTS)
  })

  it('handles car and track selection', () => {
    const store = useGameStore.getState()
    store.selectCar('lancer')
    expect(useGameStore.getState().selectedCar).toBe('lancer')

    store.selectTrack('forest')
    expect(useGameStore.getState().selectedTrack).toBe('forest')
  })

  it('manages pause and resume cleanly', () => {
    const store = useGameStore.getState()
    store.setPaused(true)
    expect(useGameStore.getState().paused).toBe(true)

    store.setPaused(false)
    expect(useGameStore.getState().paused).toBe(false)
  })

  it('handles race restart without losing configuration', () => {
    const store = useGameStore.getState()
    store.selectCar('subaru')
    store.selectTrack('coastal')
    store.setRace({ speed: 120, time: 24.5, checkpoint: 3 })

    store.restartRace()
    const current = useGameStore.getState()
    expect(current.screen).toBe('race')
    expect(current.selectedCar).toBe('subaru')
    expect(current.selectedTrack).toBe('coastal')
    expect(current.speed).toBe(0)
    expect(current.time).toBe(0)
    expect(current.checkpoint).toBe(0)
    expect(current.countdown).toBe(3)
    expect(current.finished).toBe(false)
    expect(current.activeRaceExists).toBe(true)
  })

  it('handles race completion and records best time', () => {
    const store = useGameStore.getState()
    store.selectTrack('mountain')
    store.finishRace(44.25)

    const state = useGameStore.getState()
    expect(state.finished).toBe(true)
    expect(state.finalTime).toBe(44.25)
    expect(state.screen).toBe('results')

    // Stored in localStorage
    const saved = getStoredBestTime('mountain')
    expect(saved).toBe(44.25)

    // Slower time does not overwrite faster time
    saveBestTime('mountain', 50.1)
    expect(getStoredBestTime('mountain')).toBe(44.25)

    // Faster time overwrites slower time
    saveBestTime('mountain', 41.8)
    expect(getStoredBestTime('mountain')).toBe(41.8)
  })

  it('persists and validates user settings', () => {
    const newSettings = {
      masterVolume: 0.5,
      engineVolume: 0.4,
      sfxEnabled: false,
      shadowsEnabled: false,
      cameraMode: 'cockpit' as const,
    }
    saveSettings(newSettings)
    const loaded = loadSettings()
    expect(loaded.masterVolume).toBe(0.5)
    expect(loaded.engineVolume).toBe(0.4)
    expect(loaded.sfxEnabled).toBe(false)
    expect(loaded.shadowsEnabled).toBe(false)
    expect(loaded.cameraMode).toBe('cockpit')

    // Invalid values fallback safely
    localStorage.setItem(
      'rally_racing_settings_v1',
      JSON.stringify({ masterVolume: 'bad-data', sfxEnabled: null }),
    )
    const fallback = loadSettings()
    expect(fallback.masterVolume).toBe(0.8) // default fallback
    expect(fallback.sfxEnabled).toBe(true)
  })
})
