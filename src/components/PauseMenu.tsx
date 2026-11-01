import { useGameStore } from '../store/gameStore'
import { Play, RotateCcw, Settings, Home } from 'lucide-react'

export default function PauseMenu() {
  const setPaused = useGameStore((s) => s.setPaused)
  const setScreen = useGameStore((s) => s.setScreen)
  const restartRace = useGameStore((s) => s.restartRace)
  const resetRace = useGameStore((s) => s.resetRace)

  const handleResume = () => {
    setPaused(false)
  }

  const handleRestart = () => {
    restartRace()
  }

  const handleSettings = () => {
    setScreen('settings')
  }

  const handleQuit = () => {
    setPaused(false)
    resetRace()
    setScreen('menu')
  }

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6 select-none animate-fadeIn">
      <div className="bg-neutral-900 border border-white/10 p-8 rounded-2xl flex flex-col gap-3.5 w-72 sm:w-80 shadow-2xl">
        <h3 className="text-3xl font-black text-center text-white tracking-wider mb-2">
          PAUSED
        </h3>

        <button
          onClick={handleResume}
          className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-95 py-3 rounded-xl font-bold text-white shadow-lg shadow-orange-950/40 transition-all"
        >
          <Play className="w-4 h-4 fill-current" /> RESUME
        </button>

        <button
          onClick={handleRestart}
          className="flex items-center justify-center gap-2.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 py-3 rounded-xl font-bold text-neutral-200 border border-white/10 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> RESTART STAGE
        </button>

        <button
          onClick={handleSettings}
          className="flex items-center justify-center gap-2.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 py-3 rounded-xl font-bold text-neutral-200 border border-white/10 transition-all"
        >
          <Settings className="w-4 h-4" /> SETTINGS
        </button>

        <button
          onClick={handleQuit}
          className="flex items-center justify-center gap-2.5 bg-neutral-950 hover:bg-red-950/60 active:scale-95 py-3 rounded-xl font-semibold text-neutral-400 hover:text-red-300 border border-white/5 transition-all mt-2"
        >
          <Home className="w-4 h-4" /> QUIT TO MENU
        </button>
      </div>
    </div>
  )
}
