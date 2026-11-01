import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore, CARS, type CarSpec } from '../store/gameStore'
import { CarModel } from '../game/CarModel'
import { ArrowLeft, ArrowRight, Gauge, Zap, Compass, Shield } from 'lucide-react'

function RotatingPreviewCar({ spec }: { spec: CarSpec }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.8 * dt
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>
      <CarModel spec={spec} />
    </group>
  )
}

export default function CarSelect() {
  const selectedCarId = useGameStore((s) => s.selectedCar)
  const selectCar = useGameStore((s) => s.selectCar)
  const setScreen = useGameStore((s) => s.setScreen)

  const activeCar = CARS.find((c) => c.id === selectedCarId) ?? CARS[0]

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header */}
      <div className="flex justify-between items-center max-w-6xl mx-auto w-full">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">SELECT VEHICLE</h2>
          <p className="text-sm text-neutral-400 mt-1">Choose your rally machine for the championship</p>
        </div>
        <button
          onClick={() => setScreen('menu')}
          className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold border border-white/10 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> BACK
        </button>
      </div>

      {/* Center 3D Showcase & Car Cards */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-4">
        {/* 3D Showcase Canvas */}
        <div className="lg:col-span-7 h-64 sm:h-96 w-full rounded-2xl bg-neutral-900/60 border border-white/10 overflow-hidden relative shadow-2xl flex items-center justify-center">
          <Canvas camera={{ position: [3.8, 2.2, 4.5], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.5} />
            <hemisphereLight args={['#b0d0ff', '#333333', 0.5]} />
            <RotatingPreviewCar spec={activeCar} />
          </Canvas>

          {/* Car Name & Subtitle Badge */}
          <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
            <div className="text-xl font-black text-white">{activeCar.name}</div>
            <div className="text-xs font-semibold text-orange-400">{activeCar.subtitle}</div>
          </div>
        </div>

        {/* Vehicle Selection List & Stat Comparison Bars */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            {CARS.map((car) => {
              const isSelected = car.id === selectedCarId
              return (
                <button
                  key={car.id}
                  onClick={() => selectCar(car.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-orange-500 bg-orange-950/25 shadow-lg shadow-orange-950/30'
                      : 'border-white/10 bg-neutral-900/60 hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full border border-white/30 flex-shrink-0"
                      style={{ backgroundColor: car.color }}
                    />
                    <div>
                      <div className="font-bold text-sm text-white">{car.name}</div>
                      <div className="text-xs text-neutral-400">{car.subtitle}</div>
                    </div>
                  </div>
                  <div className="text-xs font-mono font-bold text-neutral-400">
                    {car.topSpeed} km/h
                  </div>
                </button>
              )
            })}
          </div>

          {/* Detailed Performance Metric Bars */}
          <div className="bg-neutral-900/70 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col gap-3">
            <h4 className="text-xs font-bold font-mono tracking-wider text-neutral-400 uppercase">
              Performance Specs
            </h4>

            {/* Top Speed Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" /> Top Speed
                </span>
                <span className="font-mono text-white">{activeCar.topSpeed} km/h</span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${(activeCar.topSpeed / 220) * 100}%` }}
                />
              </div>
            </div>

            {/* Acceleration Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <Zap className="w-3.5 h-3.5 text-orange-400" /> Acceleration
                </span>
                <span className="font-mono text-white">{(activeCar.accel * 10).toFixed(1)}/10</span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 transition-all duration-300"
                  style={{ width: `${(activeCar.accel / 1.3) * 100}%` }}
                />
              </div>
            </div>

            {/* Handling Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" /> Handling
                </span>
                <span className="font-mono text-white">{(activeCar.handling * 10).toFixed(1)}/10</span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${(activeCar.handling / 1.3) * 100}%` }}
                />
              </div>
            </div>

            {/* Grip Traction Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" /> Tire Grip
                </span>
                <span className="font-mono text-white">{(activeCar.grip * 10).toFixed(1)}/10</span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${(activeCar.grip / 1.25) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="flex justify-between items-center max-w-6xl mx-auto w-full pt-4 border-t border-white/10">
        <button
          onClick={() => setScreen('menu')}
          className="text-neutral-400 hover:text-white font-semibold text-sm transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={() => setScreen('trackSelect')}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-95 py-3 px-8 rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-orange-950/40"
        >
          CONFIRM VEHICLE <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
