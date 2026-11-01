import '@testing-library/jest-dom'

// Mock Web Audio API for tests
class AudioNodeMock {
  connect() { return this }
  disconnect() {}
}

class AudioParamMock {
  value = 0
  setTargetAtTime() {}
  setValueAtTime() {}
  linearRampToValueAtTime() {}
  exponentialRampToValueAtTime() {}
}

class GainNodeMock extends AudioNodeMock {
  gain = new AudioParamMock()
}

class OscillatorNodeMock extends AudioNodeMock {
  frequency = new AudioParamMock()
  type = 'sine'
  start() {}
  stop() {}
}

class AudioContextMock {
  state = 'running'
  currentTime = 0
  destination = new AudioNodeMock()
  createGain() { return new GainNodeMock() }
  createOscillator() { return new OscillatorNodeMock() }
  resume() { this.state = 'running'; return Promise.resolve() }
  suspend() { this.state = 'suspended'; return Promise.resolve() }
  close() { this.state = 'closed'; return Promise.resolve() }
}

if (typeof window !== 'undefined') {
  (window as any).AudioContext = AudioContextMock
  ;(window as any).webkitAudioContext = AudioContextMock
}

