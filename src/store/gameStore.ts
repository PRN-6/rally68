import { create } from 'zustand'

export type Screen = 'menu' | 'carSelect' | 'trackSelect' | 'race' | 'pause' | 'results' | 'settings'

export type CameraMode = 'chase' | 'cockpit'

export interface CarSpec {
  id: string
  name: string
  subtitle: string
  color: string
  accentColor: string
  topSpeed: number // km/h
  accel: number // multiplier
  handling: number // multiplier
  grip: number // tire traction factor
}

export const CARS: CarSpec[] = [
  {
    id: 'rally',
    name: 'BOX RALLY GT',
    subtitle: 'Balanced All-Rounder',
    color: '#d32f2f',
    accentColor: '#ffa000',
    topSpeed: 185,
    accel: 1.0,
    handling: 1.0,
    grip: 1.0,
  },
  {
    id: 'lancer',
    name: 'EVO BLOCK RS',
    subtitle: 'High Speed Specialist',
    color: '#1565c0',
    accentColor: '#ffffff',
    topSpeed: 210,
    accel: 0.92,
    handling: 0.88,
    grip: 0.95,
  },
  {
    id: 'subaru',
    name: 'WRX CUBE SPORT',
    subtitle: 'Agile Grip Master',
    color: '#2e7d32',
    accentColor: '#ffeb3b',
    topSpeed: 175,
    accel: 1.15,
    handling: 1.18,
    grip: 1.1,
  },
]

export interface TrackMetadata {
  id: string
  name: string
  subtitle: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  surface: string
  lengthMeters: number
  goldTime: number // seconds
  silverTime: number
  bronzeTime: number
}

export const TRACKS: TrackMetadata[] = [
  {
    id: 'mountain',
    name: 'MOUNTAIN PASS',
    subtitle: 'High elevation curves & gravel stretches',
    difficulty: 'Medium',
    surface: 'Gravel & Tarmac',
    lengthMeters: 1850,
    goldTime: 42.0,
    silverTime: 48.0,
    bronzeTime: 56.0,
  },
  {
    id: 'forest',
    name: 'FOREST SPRINT',
    subtitle: 'Technical chicanes through dense woodland',
    difficulty: 'Hard',
    surface: 'Dirt & Mud',
    lengthMeters: 1620,
    goldTime: 38.0,
    silverTime: 44.0,
    bronzeTime: 52.0,
  },
  {
    id: 'coastal',
    name: 'COASTAL LOOP',
    subtitle: 'Flowing rhythm with sweeping hairpin turns',
    difficulty: 'Easy',
    surface: 'Asphalt & Sand',
    lengthMeters: 1450,
    goldTime: 34.0,
    silverTime: 40.0,
    bronzeTime: 47.0,
  },
]

export interface PacenoteInfo {
  direction: 'left' | 'right' | 'straight' | 'hairpin-left' | 'hairpin-right'
  severity: number // 1 (sharp) to 6 (gentle)
  text: string
  distance: number // meters
}

export interface GameSettings {
  masterVolume: number // 0 to 1
  engineVolume: number // 0 to 1
  sfxEnabled: boolean
  shadowsEnabled: boolean
  cameraMode: CameraMode
}

const SETTINGS_STORAGE_KEY = 'rally_racing_settings_v1'
const RECORDS_STORAGE_PREFIX = 'rally_racing_best_'

export function loadSettings(): GameSettings {
  const defaults: GameSettings = {
    masterVolume: 0.8,
    engineVolume: 0.7,
    sfxEnabled: true,
    shadowsEnabled: true,
    cameraMode: 'chase',
  }
  if (typeof window === 'undefined') return defaults
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw)
    return {
      masterVolume: typeof parsed.masterVolume === 'number' ? Math.max(0, Math.min(1, parsed.masterVolume)) : defaults.masterVolume,
      engineVolume: typeof parsed.engineVolume === 'number' ? Math.max(0, Math.min(1, parsed.engineVolume)) : defaults.engineVolume,
      sfxEnabled: typeof parsed.sfxEnabled === 'boolean' ? parsed.sfxEnabled : defaults.sfxEnabled,
      shadowsEnabled: typeof parsed.shadowsEnabled === 'boolean' ? parsed.shadowsEnabled : defaults.shadowsEnabled,
      cameraMode: parsed.cameraMode === 'cockpit' ? 'cockpit' : 'chase',
    }
  } catch {
    return defaults
  }
}

export function saveSettings(settings: GameSettings) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch {}
}

export function getStoredBestTime(trackId: string): number | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`${RECORDS_STORAGE_PREFIX}${trackId}`)
    if (!raw) return null
    const val = parseFloat(raw)
    return Number.isFinite(val) && val > 0 ? val : null
  } catch {
    return null
  }
}

export function saveBestTime(trackId: string, time: number): boolean {
  if (typeof window === 'undefined' || !Number.isFinite(time) || time <= 0) return false
  try {
    const prev = getStoredBestTime(trackId)
    if (prev === null || time < prev) {
      localStorage.setItem(`${RECORDS_STORAGE_PREFIX}${trackId}`, time.toFixed(3))
      return true
    }
  } catch {}
  return false
}

export interface RaceData {
  speed: number
  rpm: number
  gear: number
  time: number
  checkpoint: number
  totalCheckpoints: number
  lapProgress: number
  position: number
  boostRemaining: number
  isDrifting: boolean
  pacenote: PacenoteInfo | null
}

interface GameState {
  screen: Screen
  selectedCar: string
  selectedTrack: string
  paused: boolean
  countdown: number // 3, 2, 1, 0 (GO), -1 (racing)
  activeRaceExists: boolean
  settings: GameSettings

  // race telemetry
  speed: number
  rpm: number
  gear: number
  time: number
  checkpoint: number
  totalCheckpoints: number
  lapProgress: number
  position: number
  boostRemaining: number
  isDrifting: boolean
  pacenote: PacenoteInfo | null
  finished: boolean
  finalTime: number

  // actions
  setScreen: (screen: Screen) => void
  selectCar: (id: string) => void
  selectTrack: (id: string) => void
  setPaused: (paused: boolean) => void
  setCountdown: (val: number) => void
  setCameraMode: (mode: CameraMode) => void
  toggleCameraMode: () => void
  updateSettings: (partial: Partial<GameSettings>) => void
  setRace: (data: Partial<RaceData>) => void
  finishRace: (time: number) => void
  resetRace: () => void
  restartRace: () => void
  startNewRace: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'menu',
  selectedCar: 'rally',
  selectedTrack: 'mountain',
  paused: false,
  countdown: 3,
  activeRaceExists: false,
  settings: loadSettings(),

  speed: 0,
  rpm: 800,
  gear: 1,
  time: 0,
  checkpoint: 0,
  totalCheckpoints: 5,
  lapProgress: 0,
  position: 1,
  boostRemaining: 100,
  isDrifting: false,
  pacenote: null,
  finished: false,
  finalTime: 0,

  setScreen: (screen) => set({ screen }),
  selectCar: (id) => set({ selectedCar: id }),
  selectTrack: (id) => set({ selectedTrack: id }),
  setPaused: (paused) => set({ paused }),
  setCountdown: (countdown) => set({ countdown }),

  setCameraMode: (cameraMode) => {
    const nextSettings = { ...get().settings, cameraMode }
    saveSettings(nextSettings)
    set({ settings: nextSettings })
  },

  toggleCameraMode: () => {
    const current = get().settings.cameraMode
    const nextMode: CameraMode = current === 'chase' ? 'cockpit' : 'chase'
    const nextSettings = { ...get().settings, cameraMode: nextMode }
    saveSettings(nextSettings)
    set({ settings: nextSettings })
  },

  updateSettings: (partial) => {
    const nextSettings = { ...get().settings, ...partial }
    saveSettings(nextSettings)
    set({ settings: nextSettings })
  },

  setRace: (data) => set(data),

  finishRace: (finalTime) => {
    const trackId = get().selectedTrack
    saveBestTime(trackId, finalTime)
    set({
      finished: true,
      finalTime,
      screen: 'results',
      activeRaceExists: false,
      paused: false,
    })
  },

  resetRace: () =>
    set({
      speed: 0,
      rpm: 800,
      gear: 1,
      time: 0,
      checkpoint: 0,
      lapProgress: 0,
      finished: false,
      finalTime: 0,
      boostRemaining: 100,
      isDrifting: false,
      pacenote: null,
      countdown: 3,
      paused: false,
      activeRaceExists: false,
    }),

  restartRace: () =>
    set({
      screen: 'race',
      speed: 0,
      rpm: 800,
      gear: 1,
      time: 0,
      checkpoint: 0,
      lapProgress: 0,
      finished: false,
      finalTime: 0,
      boostRemaining: 100,
      isDrifting: false,
      pacenote: null,
      countdown: 3,
      paused: false,
      activeRaceExists: true,
    }),

  startNewRace: () =>
    set({
      screen: 'race',
      speed: 0,
      rpm: 800,
      gear: 1,
      time: 0,
      checkpoint: 0,
      lapProgress: 0,
      finished: false,
      finalTime: 0,
      boostRemaining: 100,
      isDrifting: false,
      pacenote: null,
      countdown: 3,
      paused: false,
      activeRaceExists: true,
    }),
}))
