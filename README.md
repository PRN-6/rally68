# Box Rally GT 🏎️💨

A high-performance 3D low-poly arcade rally racing game built with **React 19**, **Three.js**, **React Three Fiber (R3F)**, **Zustand**, and **Web Audio API**.

---

## Features

- **Dynamic Arcade Physics**:
  - Realistic lateral tire grip and drift mechanics with handbrake slide initiation.
  - Off-road terrain penalty (reduced traction, increased rolling drag).
  - Nitro boost acceleration with cooldown and visual HUD effects.
  - Obstacle collision detection and push-back response against trees, rocks, fences, and huts.

- **Dual Camera System**:
  - **Chase Camera**: Dynamic 3rd-person camera with speed pull-back, roll tilt, and bump vibration.
  - **Cockpit Camera**: 1st-person interior view with animated steering wheel, analog speed/RPM needles, and reactive digital gear display.
  - Toggle anytime with `C` or the on-screen camera button.

- **High Performance & Optimization**:
  - Decoupled from React 60 FPS re-render loops.
  - `THREE.InstancedMesh` scenery (trees, rocks, fences) for smooth frame rates.
  - Precomputed spatial grid indexing for zero-allocation nearest track queries.

- **Synthesized Web Audio**:
  - Procedural engine sound with dual oscillators tied to true RPM and throttle.
  - Continuous tire skid screech on high-speed drifting and handbrake turns.
  - Checkpoint chimes, countdown beeps, and collision impact sound effects.
  - Audio mute on pause and user gesture autoplay handling.

- **Interactive UI & HUD**:
  - Real-time speedometer (KM/H), RPM bar with redline warning, gear indicator, and boost gauge.
  - Dynamic 2D SVG track minimap with player location and heading arrow.
  - Co-driver pacenote cues (e.g. `HAIRPIN RIGHT`, `SHARP LEFT (2)`, `EASY RIGHT (4)`).
  - 3-2-1-GO countdown sequence.
  - 3D rotating vehicle garage showcase in Car Selection.
  - Multi-track selector with stage statistics and target par times.
  - Persistent settings (master/engine volume, SFX, dynamic shadows).
  - Stage results with personal best persistence in `localStorage` and Gold/Silver/Bronze medals.

- **Cross-Platform Controls**:
  - Desktop keyboard controls (`W/S`, `A/D`, `Space`, `Q/E`, `Shift`, `C`, `Esc`).
  - Mobile & touchscreen virtual controls (D-pad steering, throttle, brake, handbrake, boost, camera toggle).

---

## Desktop Controls

| Key | Action |
| :--- | :--- |
| `W` / `Up Arrow` | Accelerate (Throttle) |
| `S` / `Down Arrow` | Brake / Reverse |
| `A` / `Left Arrow` | Steer Left |
| `D` / `Right Arrow` | Steer Right |
| `Spacebar` | Handbrake (Drift) |
| `Shift` | Nitro Boost |
| `Q` / `E` | Shift Down / Shift Up |
| `C` | Toggle Camera (Chase / Cockpit) |
| `R` | Reset Car onto Track Centerline |
| `Escape` | Pause / Resume |

---

## Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run Oxlint
npm run lint

# Run TypeScript type check
npm run typecheck

# Run Vitest test suite
npm test

# Build production bundle
npm run build
```

