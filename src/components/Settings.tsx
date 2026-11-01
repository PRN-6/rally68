import { useGameStore, type GameSettings } from '../store/gameStore'
import { setAudioSettings } from '../game/audio'
import { ArrowLeft, Volume2 } from 'lucide-react'

export default function Settings() {
  const settings = useGameStore((s) => s.settings)
  const updateSettings = useGameStore((s) => s.updateSettings)
  const setScreen = useGameStore((s) => s.setScreen)
  const activeRaceExists = useGameStore((s) => s.activeRaceExists)

  const handleBack = () => {
    if (activeRaceExists) {
      setScreen('race')
    } else {
      setScreen('menu')
    }
  }

  const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    updateSettings({ masterVolume: val })
    setAudioSettings({ masterVolume: val })
  }

  const handleEngineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    updateSettings({ engineVolume: val })
    setAudioSettings({ engineVolume: val })
  }

  const handleSfxToggle = () => {
    const nextVal = !settings.sfxEnabled
    updateSettings({ sfxEnabled: nextVal })
    setAudioSettings({ sfxEnabled: nextVal })
  }

  const handleShadowsToggle = () => {
    updateSettings({ shadowsEnabled: !settings.shadowsEnabled })
  }

  const handleCameraToggle = (mode: GameSettings['cameraMode']) => {
    updateSettings({ cameraMode: mode })
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header */}
      <div className="flex justify-between items-center max-w-2xl mx-auto w-full">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">SETTINGS</h2>
          <p className="text-sm text-neutral-400 mt-1">Audio levels, graphic preferences & controls</p>
        </div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold border border-white/10 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> BACK
        </button>
      </div>

      {/* Settings Form Container */}
      <div className="max-w-2xl mx-auto w-full bg-neutral-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-8 flex flex-col gap-6 my-4 shadow-2xl">
        {/* Audio Section */}
        <div>
          <h3 className="text-xs font-mono font-bold tracking-widest text-orange-400 uppercase mb-4">
            Audio Configuration
          </h3>

          {/* Master Volume */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between text-sm font-semibold">
              <span className="flex items-center gap-2 text-neutral-300">
                <Volume2 className="w-4 h-4 text-orange-400" /> Master Volume
              </span>
              <span className="font-mono text-white">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={handleMasterChange}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Engine Volume */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between text-sm font-semibold">
              <span className="flex items-center gap-2 text-neutral-300">
                <Volume2 className="w-4 h-4 text-amber-400" /> Engine Sound
              </span>
              <span className="font-mono text-white">{Math.round(settings.engineVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.engineVolume}
              onChange={handleEngineChange}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Sound Effects Toggle */}
          <div className="flex justify-between items-center py-2 border-t border-white/5">
            <div>
              <div className="text-sm font-semibold text-neutral-200">Sound Effects (SFX)</div>
              <div className="text-xs text-neutral-400">Tire skid squeal, impact thuds, and countdown beeps</div>
            </div>
            <button
              onClick={handleSfxToggle}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                settings.sfxEnabled ? 'bg-orange-600 justify-end' : 'bg-neutral-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>
        </div>

        {/* Graphics Section */}
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-xs font-mono font-bold tracking-widest text-orange-400 uppercase mb-4">
            Visual & Camera Settings
          </h3>

          {/* Dynamic Shadows Toggle */}
          <div className="flex justify-between items-center py-2">
            <div>
              <div className="text-sm font-semibold text-neutral-200">Dynamic Shadows</div>
              <div className="text-xs text-neutral-400">High-resolution shadow map (disable for maximum FPS)</div>
            </div>
            <button
              onClick={handleShadowsToggle}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                settings.shadowsEnabled ? 'bg-emerald-600 justify-end' : 'bg-neutral-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>

          {/* Default Camera View Mode */}
          <div className="flex justify-between items-center py-3 border-t border-white/5">
            <div>
              <div className="text-sm font-semibold text-neutral-200">Default Camera View</div>
              <div className="text-xs text-neutral-400">Toggle anytime in-game with key 'C'</div>
            </div>
            <div className="flex items-center gap-1.5 bg-neutral-800 p-1 rounded-xl">
              <button
                onClick={() => handleCameraToggle('chase')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  settings.cameraMode === 'chase' ? 'bg-orange-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                CHASE
              </button>
              <button
                onClick={() => handleCameraToggle('cockpit')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  settings.cameraMode === 'cockpit' ? 'bg-orange-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                COCKPIT
              </button>
            </div>
          </div>
        </div>

        {/* Controls Reference Card */}
        <div className="border-t border-white/10 pt-4">
          <h3 className="text-xs font-mono font-bold tracking-widest text-orange-400 uppercase mb-3">
            Keyboard Controls Map
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
            <div className="bg-neutral-800/60 p-2 rounded-lg border border-white/5">
              <span className="text-orange-400 font-bold">W / Up</span> : Accelerate
            </div>
            <div className="bg-neutral-800/60 p-2 rounded-lg border border-white/5">
              <span className="text-orange-400 font-bold">S / Down</span> : Brake / Rev
            </div>
            <div className="bg-neutral-800/60 p-2 rounded-lg border border-white/5">
              <span className="text-orange-400 font-bold">A / D</span> : Steer
            </div>
            <div className="bg-neutral-800/60 p-2 rounded-lg border border-white/5">
              <span className="text-orange-400 font-bold">Space</span> : Handbrake
            </div>
            <div className="bg-neutral-800/60 p-2 rounded-lg border border-white/5">
              <span className="text-orange-400 font-bold">Q / E</span> : Gear - / +
            </div>
            <div className="bg-neutral-800/60 p-2 rounded-lg border border-white/5">
              <span className="text-orange-400 font-bold">Shift</span> : Nitro Boost
            </div>
            <div className="bg-neutral-800/60 p-2 rounded-lg border border-white/5">
              <span className="text-orange-400 font-bold">C</span> : Toggle Cam
            </div>
            <div className="bg-neutral-800/60 p-2 rounded-lg border border-white/5">
              <span className="text-orange-400 font-bold">R</span> : Reset Car
            </div>
            <div className="bg-neutral-800/60 p-2 rounded-lg border border-white/5">
              <span className="text-orange-400 font-bold">Esc</span> : Pause
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="max-w-2xl mx-auto w-full flex justify-end">
        <button
          onClick={handleBack}
          className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-6 py-2.5 rounded-xl border border-white/10 transition-all active:scale-95"
        >
          DONE
        </button>
      </div>
    </div>
  )
}
