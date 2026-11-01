import { useMemo } from 'react'
import { useGameStore, TRACKS, getStoredBestTime } from '../store/gameStore'
import { RotateCcw, MapPin, Home } from 'lucide-react'

function fmt(t: number) {
  if (!Number.isFinite(t) || t <= 0) return '--:--.---'
  const m = Math.floor(t / 60).toString().padStart(2, '0')
  const s = (t % 60).toFixed(3).padStart(6, '0')
  return `${m}:${s}`
}

export default function Results() {
  const finalTime = useGameStore((s) => s.finalTime)
  const selectedTrackId = useGameStore((s) => s.selectedTrack)
  const setScreen = useGameStore((s) => s.setScreen)
  const restartRace = useGameStore((s) => s.restartRace)
  const resetRace = useGameStore((s) => s.resetRace)

  const track = TRACKS.find((t) => t.id === selectedTrackId) ?? TRACKS[0]
  const personalBest = getStoredBestTime(track.id)

  const isNewRecord = personalBest !== null && Math.abs(finalTime - personalBest) < 0.05

  // Determine medal
  const medal = useMemo(() => {
    if (finalTime <= track.goldTime) {
      return { title: 'GOLD MEDAL', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/40', icon: '🥇' }
    }
    if (finalTime <= track.silverTime) {
      return { title: 'SILVER MEDAL', color: 'text-neutral-300', bg: 'bg-neutral-500/20 border-neutral-400/40', icon: '🥈' }
    }
    if (finalTime <= track.bronzeTime) {
      return { title: 'BRONZE MEDAL', color: 'text-amber-600', bg: 'bg-amber-600/20 border-amber-600/40', icon: '🥉' }
    }
    return { title: 'STAGE FINISHED', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40', icon: '🏁' }
  }, [finalTime, track])

  const handleRestart = () => {
    restartRace()
  }

  const handleMenu = () => {
    resetRace()
    setScreen('menu')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white flex flex-col items-center justify-center p-6 relative select-none">
      <div className="bg-neutral-900/80 backdrop-blur-md border border-white/10 p-8 sm:p-10 rounded-2xl flex flex-col items-center gap-6 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Stage Header */}
        <div className="text-center">
          <div className="text-xs font-mono font-bold tracking-widest text-orange-400 uppercase">
            {track.name}
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white mt-1">
            RACE RESULTS
          </h2>
        </div>

        {/* Medal Badge */}
        <div className={`px-5 py-2.5 rounded-2xl border flex items-center gap-3 ${medal.bg}`}>
          <span className="text-3xl">{medal.icon}</span>
          <span className={`text-lg font-black tracking-wider ${medal.color}`}>
            {medal.title}
          </span>
        </div>

        {/* Final Time Display */}
        <div className="text-center bg-black/60 px-6 py-4 rounded-2xl border border-white/10 w-full">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-1">
            Official Stage Time
          </div>
          <div className="text-5xl font-black font-mono tracking-tight text-amber-400">
            {fmt(finalTime)}
          </div>
          {isNewRecord && (
            <div className="mt-2 text-xs font-bold font-mono text-emerald-400 tracking-wider animate-pulse">
              ★ NEW PERSONAL BEST! ★
            </div>
          )}
        </div>

        {/* Comparison Targets */}
        <div className="w-full flex flex-col gap-2 text-xs font-mono bg-neutral-950/60 p-4 rounded-xl border border-white/5">
          <div className="flex justify-between items-center text-neutral-300">
            <span>Personal Best:</span>
            <span className="font-bold text-white">{fmt(personalBest || finalTime)}</span>
          </div>
          <div className="flex justify-between items-center text-yellow-400">
            <span>Gold Target:</span>
            <span>{fmt(track.goldTime)}</span>
          </div>
          <div className="flex justify-between items-center text-neutral-400">
            <span>Silver Target:</span>
            <span>{fmt(track.silverTime)}</span>
          </div>
          <div className="flex justify-between items-center text-amber-600">
            <span>Bronze Target:</span>
            <span>{fmt(track.bronzeTime)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleRestart}
            className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-95 py-3.5 px-6 rounded-xl font-bold text-white shadow-lg shadow-orange-950/40 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> RETRY STAGE
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setScreen('trackSelect')}
              className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 active:scale-95 py-3 px-4 rounded-xl font-semibold text-xs border border-white/10 transition-all"
            >
              <MapPin className="w-4 h-4 text-orange-400" /> CHANGE TRACK
            </button>
            <button
              onClick={handleMenu}
              className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 active:scale-95 py-3 px-4 rounded-xl font-semibold text-xs border border-white/10 transition-all"
            >
              <Home className="w-4 h-4 text-neutral-400" /> MAIN MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
