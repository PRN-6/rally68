import { useMemo } from 'react'
import { useGameStore } from '../store/gameStore'
import { getTrackCache } from '../game/Track'
import {
  Flame,
  Camera,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react'

function fmtTime(t: number) {
  const m = Math.floor(t / 60).toString().padStart(2, '0')
  const s = (t % 60).toFixed(2).padStart(5, '0')
  return `${m}:${s}`
}

function Minimap() {
  const selectedTrack = useGameStore((s) => s.selectedTrack)
  const lapProgress = useGameStore((s) => s.lapProgress)

  const { pathData, playerPos, playerAngle, viewBox } = useMemo(() => {
    const cache = getTrackCache(selectedTrack)
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

    const padding = 20
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

    // Compute player marker position on minimap
    const u = Math.max(0, Math.min(0.999, (lapProgress || 0) / 100))
    const sampleIdx = Math.floor(u * pts.length)
    const currSample = pts[sampleIdx]
    const px = currSample.point.x - minX + padding
    const py = currSample.point.z - minZ + padding
    const pAngle = Math.atan2(currSample.tangent.x, currSample.tangent.z) * (180 / Math.PI)

    return {
      pathData: d,
      playerPos: { x: px, y: py },
      playerAngle: pAngle,
      viewBox: `0 0 ${width} ${height}`,
    }
  }, [selectedTrack, lapProgress])

  return (
    <div className="relative w-28 h-28 sm:w-36 sm:h-36 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 p-2 overflow-hidden shadow-lg">
      <svg className="w-full h-full" viewBox={viewBox}>
        {/* Track circuit path */}
        <path
          d={pathData}
          fill="none"
          stroke="#444"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={pathData}
          fill="none"
          stroke="#ff8f00"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
        {/* Player position marker */}
        <g transform={`translate(${playerPos.x}, ${playerPos.y}) rotate(${playerAngle})`}>
          <polygon points="0,-7 5,6 -5,6" fill="#00e676" stroke="#ffffff" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  )
}

function PacenoteBanner() {
  const pacenote = useGameStore((s) => s.pacenote)
  if (!pacenote) return null

  const isHairpin = pacenote.direction.includes('hairpin')
  const isRight = pacenote.direction.includes('right')

  return (
    <div className="animate-bounce flex items-center gap-3 bg-black/85 backdrop-blur-md px-5 py-2.5 rounded-full border-2 border-amber-500 shadow-xl">
      <div
        className={`flex items-center justify-center w-9 h-9 rounded-full ${
          isHairpin ? 'bg-red-600 text-white' : 'bg-amber-500 text-black'
        }`}
      >
        {isRight ? (
          isHairpin ? <RotateCcw className="w-6 h-6 transform rotate-90" /> : <ChevronRight className="w-7 h-7" />
        ) : (
          isHairpin ? <RotateCcw className="w-6 h-6 transform -rotate-90" /> : <ChevronLeft className="w-7 h-7" />
        )}
      </div>
      <div>
        <div className="text-sm font-black tracking-wider text-amber-400 uppercase">
          {pacenote.text}
        </div>
        <div className="text-xs text-neutral-300 font-mono">
          in {pacenote.distance}m
        </div>
      </div>
    </div>
  )
}

export default function HUD() {
  const speed = useGameStore((s) => s.speed)
  const rpm = useGameStore((s) => s.rpm)
  const gear = useGameStore((s) => s.gear)
  const time = useGameStore((s) => s.time)
  const cp = useGameStore((s) => s.checkpoint)
  const total = useGameStore((s) => s.totalCheckpoints)
  const prog = useGameStore((s) => s.lapProgress)
  const boost = useGameStore((s) => s.boostRemaining)
  const isDrifting = useGameStore((s) => s.isDrifting)
  const countdown = useGameStore((s) => s.countdown)
  const cameraMode = useGameStore((s) => s.settings.cameraMode)
  const toggleCameraMode = useGameStore((s) => s.toggleCameraMode)

  const normRpm = Math.max(0, Math.min(1, (rpm - 800) / (7200 - 800)))
  const isRedline = rpm >= 6400

  return (
    <div className="pointer-events-none absolute inset-0 text-white font-sans select-none overflow-hidden flex flex-col justify-between p-3 sm:p-5">
      {/* Top Header Row */}
      <div className="flex justify-between items-start gap-4">
        {/* Speedometer & Tachometer Cluster */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-3 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg">
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
              {Math.round(speed)}
            </div>
            <div className="text-xs font-bold text-neutral-400">KM/H</div>

            {/* Gear Indicator */}
            <div className="ml-3 px-2.5 py-1 rounded-md bg-neutral-800 border border-neutral-700 text-xl font-black font-mono text-emerald-400">
              {gear === 0 ? 'N' : gear < 0 ? 'R' : gear}
            </div>
          </div>

          {/* RPM Bar */}
          <div className="w-48 sm:w-60 bg-black/70 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-lg">
            <div className="flex justify-between text-[10px] font-mono text-neutral-400 mb-1">
              <span>RPM</span>
              <span className={isRedline ? 'text-red-400 font-bold' : ''}>
                {Math.round(rpm)}
              </span>
            </div>
            <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-75 ${
                  isRedline ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500'
                }`}
                style={{ width: `${normRpm * 100}%` }}
              />
            </div>
          </div>

          {/* Nitro Boost Bar */}
          <div className="w-48 sm:w-60 bg-black/70 backdrop-blur-md p-1.5 px-2.5 rounded-xl border border-white/10 flex items-center gap-2">
            <Flame className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-100"
                style={{ width: `${boost}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-400">{boost}%</span>
          </div>

          {/* Drift Status Banner */}
          {isDrifting && (
            <div className="animate-pulse bg-gradient-to-r from-orange-600 to-amber-500 px-3 py-1 rounded-lg text-xs font-black tracking-widest text-black text-center shadow-md">
              DRIFT!
            </div>
          )}
        </div>

        {/* Center Pacenote Cue */}
        <div className="flex-1 flex justify-center">
          <PacenoteBanner />
        </div>

        {/* Top Right: Lap Time & Race Progress */}
        <div className="flex flex-col items-end gap-2">
          <div className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-right shadow-lg">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-400">
              {fmtTime(time)}
            </div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase">Race Time</div>
          </div>

          {/* Minimap */}
          <Minimap />
        </div>
      </div>

      {/* Start Countdown Overlay (3, 2, 1, GO!) */}
      {countdown >= 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`font-black tracking-widest transform transition-transform animate-scale ${
              countdown === 0
                ? 'text-7xl sm:text-9xl text-emerald-400 drop-shadow-[0_0_35px_rgba(52,211,153,0.8)]'
                : 'text-8xl sm:text-9xl text-orange-500 drop-shadow-[0_0_35px_rgba(249,115,22,0.8)]'
            }`}
          >
            {countdown === 0 ? 'GO!' : countdown}
          </div>
        </div>
      )}

      {/* Bottom Footer Row */}
      <div className="flex justify-between items-end gap-4">
        {/* Checkpoint & Lap Progress */}
        <div className="bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-4 text-xs font-mono shadow-lg">
          <div>
            <span className="text-neutral-400">CP </span>
            <span className="font-bold text-white">{cp}</span>
            <span className="text-neutral-500">/{total}</span>
          </div>
          <div className="h-4 w-px bg-neutral-700" />
          <div>
            <span className="text-neutral-400">PROG </span>
            <span className="font-bold text-emerald-400">{prog}%</span>
          </div>
        </div>

        {/* Interactive Camera Toggle Pill (pointer-events allowed) */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={toggleCameraMode}
            className="flex items-center gap-1.5 bg-black/70 hover:bg-neutral-800 text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 shadow-md"
            title="Toggle Camera (C)"
          >
            <Camera className="w-3.5 h-3.5 text-orange-400" />
            <span className="uppercase text-[11px]">{cameraMode}</span>
          </button>
        </div>

        {/* Desktop Controls Reference */}
        <div className="hidden md:flex bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs text-neutral-300 font-mono gap-3 shadow-lg">
          <span><b className="text-white">W/S</b> Drive</span>
          <span><b className="text-white">A/D</b> Steer</span>
          <span><b className="text-white">SPACE</b> Handbrake</span>
          <span><b className="text-white">Q/E</b> Shift</span>
          <span><b className="text-white">SHIFT</b> Boost</span>
          <span><b className="text-white">C</b> Cam</span>
          <span><b className="text-white">ESC</b> Pause</span>
        </div>
      </div>
    </div>
  )
}
