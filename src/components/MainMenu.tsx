import { useGameStore } from '../store/gameStore'
import { startAudio } from '../game/audio'
import { Play, Car, MapPin, Settings as SettingsIcon, RotateCcw } from 'lucide-react'

export default function MainMenu() {
  const setScreen = useGameStore((s) => s.setScreen)
  const activeRaceExists = useGameStore((s) => s.activeRaceExists)
  const setPaused = useGameStore((s) => s.setPaused)

  const handleStart = () => {
    startAudio()
    setScreen('carSelect')
  }

  const handleResume = () => {
    startAudio()
    setPaused(false)
    setScreen('race')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Decorative Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Title */}
      <div className="text-center z-10 mb-8 sm:mb-12">
        <div className="inline-block px-3.5 py-1 mb-3 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold tracking-widest uppercase">
          Low-Poly Arcade Rally Championship
        </div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-500 drop-shadow-sm">
          BOX RALLY GT
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 mt-2 font-medium max-w-md mx-auto">
          Championship rally racing with physics-based drifting, co-driver pacenotes, and technical gravel stages.
        </p>
      </div>

      {/* Main Action Menu */}
      <div className="flex flex-col gap-3.5 w-72 sm:w-80 z-10">
        {activeRaceExists && (
          <button
            onClick={handleResume}
            className="group flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 py-3.5 px-6 rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-emerald-950/40"
          >
            <RotateCcw className="w-5 h-5 transition-transform group-hover:-rotate-45" />
            RESUME RACE
          </button>
        )}

        <button
          onClick={handleStart}
          className="group flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-95 py-3.5 px-6 rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-orange-950/40"
        >
          <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
          START RACE
        </button>

        <button
          onClick={() => setScreen('carSelect')}
          className="flex items-center justify-center gap-3 bg-neutral-800/80 hover:bg-neutral-700/80 active:scale-95 py-3 px-6 rounded-xl font-semibold border border-white/10 transition-all backdrop-blur-sm"
        >
          <Car className="w-5 h-5 text-orange-400" />
          GARAGE / CARS
        </button>

        <button
          onClick={() => setScreen('trackSelect')}
          className="flex items-center justify-center gap-3 bg-neutral-800/80 hover:bg-neutral-700/80 active:scale-95 py-3 px-6 rounded-xl font-semibold border border-white/10 transition-all backdrop-blur-sm"
        >
          <MapPin className="w-5 h-5 text-amber-400" />
          TRACK SELECT
        </button>

        <button
          onClick={() => setScreen('settings')}
          className="flex items-center justify-center gap-3 bg-neutral-800/80 hover:bg-neutral-700/80 active:scale-95 py-3 px-6 rounded-xl font-semibold border border-white/10 transition-all backdrop-blur-sm"
        >
          <SettingsIcon className="w-5 h-5 text-neutral-400" />
          SETTINGS
        </button>
      </div>

      {/* Footer Controls Preview */}
      <div className="mt-12 text-center text-xs text-neutral-500 font-mono z-10">
        Desktop: W/S Drive · A/D Steer · Space Drift · Q/E Shift · Shift Boost · C Camera
      </div>
    </div>
  )
}
