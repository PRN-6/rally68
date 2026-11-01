import { useState } from 'react'
import { touchInputs } from '../game/physics'
import { useGameStore } from '../store/gameStore'
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Flame,
  Camera,
  Hand,
} from 'lucide-react'

export default function TouchControls() {
  const [isTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false
    return Boolean(
      'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches),
    )
  })
  const toggleCameraMode = useGameStore((s) => s.toggleCameraMode)

  if (!isTouchDevice) return null

  const handlePointerDown = (
    key: keyof typeof touchInputs,
    value: number | boolean,
  ) => {
    ;(touchInputs as any)[key] = value
  }

  const handlePointerUp = (
    key: keyof typeof touchInputs,
    value: number | boolean,
  ) => {
    ;(touchInputs as any)[key] = value
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex justify-between items-end p-4 sm:p-6 select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Left Steering Cluster: Left & Right */}
      <div className="pointer-events-auto flex items-center gap-3">
        {/* Steer Left */}
        <button
          className="w-16 h-16 rounded-2xl bg-black/60 active:bg-orange-600/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl transition-transform active:scale-90"
          onPointerDown={(e) => {
            e.preventDefault()
            handlePointerDown('steer', 1)
          }}
          onPointerUp={(e) => {
            e.preventDefault()
            handlePointerUp('steer', 0)
          }}
          onPointerCancel={(e) => {
            e.preventDefault()
            handlePointerUp('steer', 0)
          }}
        >
          <ChevronLeft className="w-9 h-9" />
        </button>

        {/* Steer Right */}
        <button
          className="w-16 h-16 rounded-2xl bg-black/60 active:bg-orange-600/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl transition-transform active:scale-90"
          onPointerDown={(e) => {
            e.preventDefault()
            handlePointerDown('steer', -1)
          }}
          onPointerUp={(e) => {
            e.preventDefault()
            handlePointerUp('steer', 0)
          }}
          onPointerCancel={(e) => {
            e.preventDefault()
            handlePointerUp('steer', 0)
          }}
        >
          <ChevronRight className="w-9 h-9" />
        </button>
      </div>

      {/* Right Pedal Cluster: Gas, Brake, Handbrake, Boost */}
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        {/* Top utility row: Boost & Camera */}
        <div className="flex items-center gap-2">
          {/* Nitro Boost */}
          <button
            className="w-12 h-12 rounded-xl bg-cyan-900/60 active:bg-cyan-500/80 backdrop-blur-md border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-lg transition-transform active:scale-90"
            onPointerDown={(e) => {
              e.preventDefault()
              handlePointerDown('boost', true)
            }}
            onPointerUp={(e) => {
              e.preventDefault()
              handlePointerUp('boost', false)
            }}
            onPointerCancel={(e) => {
              e.preventDefault()
              handlePointerUp('boost', false)
            }}
          >
            <Flame className="w-6 h-6" />
          </button>

          {/* Camera View Switch */}
          <button
            className="w-12 h-12 rounded-xl bg-black/60 active:bg-neutral-700/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-neutral-300 shadow-lg transition-transform active:scale-90"
            onClick={(e) => {
              e.preventDefault()
              toggleCameraMode()
            }}
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Lower Main Pedals Row */}
        <div className="flex items-center gap-3">
          {/* Handbrake Button */}
          <button
            className="w-14 h-14 rounded-2xl bg-amber-900/60 active:bg-amber-600/80 backdrop-blur-md border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-xl transition-transform active:scale-90"
            onPointerDown={(e) => {
              e.preventDefault()
              handlePointerDown('handbrake', true)
            }}
            onPointerUp={(e) => {
              e.preventDefault()
              handlePointerUp('handbrake', false)
            }}
            onPointerCancel={(e) => {
              e.preventDefault()
              handlePointerUp('handbrake', false)
            }}
          >
            <Hand className="w-7 h-7" />
          </button>

          {/* Brake / Reverse Pedal */}
          <button
            className="w-16 h-18 rounded-2xl bg-red-950/70 active:bg-red-600/80 backdrop-blur-md border border-red-500/40 flex items-center justify-center text-red-200 shadow-xl transition-transform active:scale-90"
            onPointerDown={(e) => {
              e.preventDefault()
              handlePointerDown('brake', 1)
            }}
            onPointerUp={(e) => {
              e.preventDefault()
              handlePointerUp('brake', 0)
            }}
            onPointerCancel={(e) => {
              e.preventDefault()
              handlePointerUp('brake', 0)
            }}
          >
            <ArrowDown className="w-8 h-8" />
          </button>

          {/* Accelerate / Gas Pedal */}
          <button
            className="w-18 h-22 rounded-2xl bg-emerald-950/70 active:bg-emerald-600/80 backdrop-blur-md border border-emerald-500/40 flex items-center justify-center text-emerald-200 shadow-xl transition-transform active:scale-90"
            onPointerDown={(e) => {
              e.preventDefault()
              handlePointerDown('throttle', 1)
            }}
            onPointerUp={(e) => {
              e.preventDefault()
              handlePointerUp('throttle', 0)
            }}
            onPointerCancel={(e) => {
              e.preventDefault()
              handlePointerUp('throttle', 0)
            }}
          >
            <ArrowUp className="w-10 h-10" />
          </button>
        </div>
      </div>
    </div>
  )
}
