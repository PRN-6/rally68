import { useMemo } from 'react'
import { useGameStore, TRACKS, getStoredBestTime } from '../store/gameStore'
import { getTrackCache } from '../game/Track'
import { ArrowLeft, Play, Trophy } from 'lucide-react'

function TrackOutline({ trackId }: { trackId: string }) {
  const pathData = useMemo(() => {
    const cache = getTrackCache(trackId)
    const pts = cache.samples

    let minX = Infinity, maxX = -Infinity
    let minZ = Infinity, maxZ = -Infinity

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i].point
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.z < minZ) minZ = p.z
      if (p.z > maxZ) maxZ = p.z
    }

    const padding = 25
    const width = Math.max(10, maxX - minX + padding * 2)
    const height = Math.max(10, maxZ - minZ + padding * 2)

    let d = ''
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i].point
      const x = p.x - minX + padding
      const y = p.z - minZ + padding
      d += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`
    }
    d += ' Z'

    return { d, viewBox: `0 0 ${width} ${height}` }
  }, [trackId])

  return (
    <svg className="w-full h-full" viewBox={pathData.viewBox}>
      <path
        d={pathData.d}
        fill="none"
        stroke="#262626"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={pathData.d}
        fill="none"
        stroke="#f97316"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  )
}

function fmt(t: number) {
  const m = Math.floor(t / 60).toString().padStart(2, '0')
  const s = (t % 60).toFixed(2).padStart(5, '0')
  return `${m}:${s}`
}

export default function TrackSelect() {
  const selectedTrackId = useGameStore((s) => s.selectedTrack)
  const selectTrack = useGameStore((s) => s.selectTrack)
  const setScreen = useGameStore((s) => s.setScreen)
  const startNewRace = useGameStore((s) => s.startNewRace)

  const activeTrack = TRACKS.find((t) => t.id === selectedTrackId) ?? TRACKS[0]
  const bestTime = getStoredBestTime(activeTrack.id)

  const handleStart = () => {
    startNewRace()
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header */}
      <div className="flex justify-between items-center max-w-6xl mx-auto w-full">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">SELECT TRACK</h2>
          <p className="text-sm text-neutral-400 mt-1">Choose your rally stage and weather conditions</p>
        </div>
        <button
          onClick={() => setScreen('carSelect')}
          className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold border border-white/10 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> BACK
        </button>
      </div>

      {/* Main Track Selection Layout */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-4">
        {/* Track Outline Preview */}
        <div className="lg:col-span-7 h-64 sm:h-96 w-full rounded-2xl bg-neutral-900/60 border border-white/10 p-6 flex items-center justify-center relative shadow-2xl overflow-hidden">
          <TrackOutline trackId={activeTrack.id} />

          {/* Track Summary Badge */}
          <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
            <div className="text-xl font-black text-white">{activeTrack.name}</div>
            <div className="text-xs text-orange-400 font-semibold">{activeTrack.subtitle}</div>
            <div className="flex items-center gap-4 mt-2 text-xs text-neutral-300 font-mono">
              <span>{(activeTrack.lengthMeters / 1000).toFixed(2)} KM</span>
              <span>·</span>
              <span>{activeTrack.surface}</span>
            </div>
          </div>
        </div>

        {/* Tracks List & Stage Records */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {TRACKS.map((t) => {
              const isSelected = t.id === selectedTrackId
              return (
                <button
                  key={t.id}
                  onClick={() => selectTrack(t.id)}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-orange-500 bg-orange-950/25 shadow-lg shadow-orange-950/30'
                      : 'border-white/10 bg-neutral-900/60 hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-3.5 h-3.5 rounded-full ${
                        isSelected ? 'bg-orange-500' : 'bg-neutral-600'
                      }`}
                    />
                    <div>
                      <div className="font-bold text-sm text-white">{t.name}</div>
                      <div className="text-xs text-neutral-400">{t.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                        t.difficulty === 'Easy'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : t.difficulty === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {t.difficulty}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      {(t.lengthMeters / 1000).toFixed(2)} km
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Stage Records & Par Times */}
          <div className="bg-neutral-900/70 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col gap-2.5">
            <h4 className="text-xs font-bold font-mono tracking-wider text-neutral-400 uppercase">
              Target Lap Records
            </h4>

            {bestTime !== null && (
              <div className="flex justify-between items-center text-xs font-semibold py-1 border-b border-white/10">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Trophy className="w-4 h-4" /> Personal Best
                </span>
                <span className="font-mono text-white text-sm font-bold">{fmt(bestTime)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-xs py-0.5">
              <span className="text-yellow-400 font-bold">🥇 Gold Medal</span>
              <span className="font-mono text-neutral-300">{fmt(activeTrack.goldTime)}</span>
            </div>
            <div className="flex justify-between items-center text-xs py-0.5">
              <span className="text-neutral-300 font-bold">🥈 Silver Medal</span>
              <span className="font-mono text-neutral-400">{fmt(activeTrack.silverTime)}</span>
            </div>
            <div className="flex justify-between items-center text-xs py-0.5">
              <span className="text-amber-600 font-bold">🥉 Bronze Medal</span>
              <span className="font-mono text-neutral-400">{fmt(activeTrack.bronzeTime)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="flex justify-between items-center max-w-6xl mx-auto w-full pt-4 border-t border-white/10">
        <button
          onClick={() => setScreen('carSelect')}
          className="text-neutral-400 hover:text-white font-semibold text-sm transition-colors"
        >
          Back to Garage
        </button>

        <button
          onClick={handleStart}
          className="flex items-center gap-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-95 py-3.5 px-9 rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-orange-950/40"
        >
          <Play className="w-5 h-5 fill-current" /> START RALLY
        </button>
      </div>
    </div>
  )
}
