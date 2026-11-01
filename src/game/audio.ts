// Web Audio Synthesizer for Rally Racing

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let engineGain: GainNode | null = null
let engineOsc1: OscillatorNode | null = null
let engineOsc2: OscillatorNode | null = null
let windGain: GainNode | null = null
let windOsc: OscillatorNode | null = null
let skidGain: GainNode | null = null
let skidOsc: OscillatorNode | null = null

let running = false
let isMuted = false
let sfxEnabled = true
let masterVol = 0.8
let engineVol = 0.7

export function ensureAudio() {
  if (typeof window === 'undefined') return
  if (!ctx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      ctx = new AudioContextClass()
    }
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
}

export function setAudioSettings(settings: {
  masterVolume?: number
  engineVolume?: number
  sfxEnabled?: boolean
}) {
  if (typeof settings.masterVolume === 'number') {
    masterVol = Math.max(0, Math.min(1, settings.masterVolume))
    if (masterGain && ctx && !isMuted) {
      masterGain.gain.setTargetAtTime(masterVol, ctx.currentTime, 0.05)
    }
  }
  if (typeof settings.engineVolume === 'number') {
    engineVol = Math.max(0, Math.min(1, settings.engineVolume))
  }
  if (typeof settings.sfxEnabled === 'boolean') {
    sfxEnabled = settings.sfxEnabled
  }
}

export function startAudio() {
  ensureAudio()
  if (!ctx || running) return
  try {
    running = true

    // Master bus
    masterGain = ctx.createGain()
    masterGain.gain.value = isMuted ? 0 : masterVol
    masterGain.connect(ctx.destination)

    // Engine sound: dual oscillators (sawtooth + triangle) for rich rally roar
    engineGain = ctx.createGain()
    engineGain.gain.value = 0.04 * engineVol
    engineGain.connect(masterGain)

    engineOsc1 = ctx.createOscillator()
    engineOsc1.type = 'sawtooth'
    engineOsc1.frequency.value = 75
    engineOsc1.connect(engineGain)
    engineOsc1.start()

    engineOsc2 = ctx.createOscillator()
    engineOsc2.type = 'triangle'
    engineOsc2.frequency.value = 37.5
    engineOsc2.connect(engineGain)
    engineOsc2.start()

    // Wind rush sound at higher speeds
    windGain = ctx.createGain()
    windGain.gain.value = 0.0
    windGain.connect(masterGain)

    windOsc = ctx.createOscillator()
    windOsc.type = 'sine'
    windOsc.frequency.value = 180
    windOsc.connect(windGain)
    windOsc.start()

    // Skid noise loop node
    skidGain = ctx.createGain()
    skidGain.gain.value = 0.0
    skidGain.connect(masterGain)

    skidOsc = ctx.createOscillator()
    skidOsc.type = 'sawtooth'
    skidOsc.frequency.value = 850
    skidOsc.connect(skidGain)
    skidOsc.start()
  } catch {
    running = false
  }
}

export function stopAudio() {
  running = false
  try { engineOsc1?.stop() } catch {}
  try { engineOsc2?.stop() } catch {}
  try { windOsc?.stop() } catch {}
  try { skidOsc?.stop() } catch {}

  engineOsc1 = null
  engineOsc2 = null
  windOsc = null
  skidOsc = null
  engineGain = null
  windGain = null
  skidGain = null
  masterGain = null
}

export function pauseAudio() {
  isMuted = true
  if (masterGain && ctx) {
    masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.02)
  }
}

export function resumeAudio() {
  isMuted = false
  if (masterGain && ctx) {
    masterGain.gain.setTargetAtTime(masterVol, ctx.currentTime, 0.05)
  }
}

/**
 * Update continuous engine, wind, and tire skid sounds.
 * Note: Throttle is now the TRUE player input throttle (0 to 1), not speed > 1!
 */
export function updateAudio(
  speedKmh: number,
  rpm: number,
  throttle: number,
  isDrifting: boolean = false,
) {
  if (!ctx || !running || isMuted) return

  const now = ctx.currentTime

  // 1. Engine frequency & volume tied to real RPM and true throttle
  if (engineGain && engineOsc1 && engineOsc2) {
    const normRpm = Math.max(0, Math.min(1, (rpm - 800) / (7200 - 800)))
    const baseFreq = 55 + normRpm * 260
    engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.04)
    engineOsc2.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.04)

    const targetEngineVol = (0.025 + throttle * 0.045 + (speedKmh / 250) * 0.02) * engineVol
    engineGain.gain.setTargetAtTime(targetEngineVol, now, 0.04)
  }

  // 2. Wind noise
  if (windGain && windOsc) {
    const windTargetGain = sfxEnabled ? Math.min(0.035, (speedKmh / 200) * 0.035) : 0
    windGain.gain.setTargetAtTime(windTargetGain, now, 0.08)
    windOsc.frequency.setTargetAtTime(140 + speedKmh * 1.5, now, 0.08)
  }

  // 3. Tire skid audio with hysteresis
  if (skidGain && skidOsc) {
    const shouldSkid = sfxEnabled && isDrifting && speedKmh > 12
    const targetSkidVol = shouldSkid ? 0.075 : 0.0
    skidGain.gain.setTargetAtTime(targetSkidVol, now, shouldSkid ? 0.03 : 0.1)
  }
}

/**
 * Play one-shot tire squeal or chirp.
 */
export function playSkid() {
  if (!ctx || isMuted || !sfxEnabled) return
  try {
    ensureAudio()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.14)
    gain.gain.setValueAtTime(0.06 * masterVol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.15)
  } catch {}
}

/**
 * Countdown beep (pitch 440 for 3, 2, 1; pitch 880 for GO!).
 */
export function playCountdownBeep(isGo: boolean = false) {
  if (!ctx || isMuted || !sfxEnabled) return
  try {
    ensureAudio()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    const freq = isGo ? 880 : 440
    const duration = isGo ? 0.4 : 0.18
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(0.12 * masterVol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {}
}

/**
 * Checkpoint chime (musical ascending ping).
 */
export function playCheckpointChime() {
  if (!ctx || isMuted || !sfxEnabled) return
  try {
    ensureAudio()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.08) // A5
    osc.frequency.setValueAtTime(587.33, ctx.currentTime)
    osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.15 * masterVol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.32)
  } catch {}
}

/**
 * Obstacle collision thud impact.
 */
export function playCollisionSound(severity: number = 0.5) {
  if (!ctx || isMuted || !sfxEnabled) return
  try {
    ensureAudio()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(140, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.15)
    const vol = Math.min(0.2, 0.05 + severity * 0.15) * masterVol
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.2)
  } catch {}
}
