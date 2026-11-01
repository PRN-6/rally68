import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import MainMenu from './components/MainMenu'
import CarSelect from './components/CarSelect'
import TrackSelect from './components/TrackSelect'
import Settings from './components/Settings'
import Results from './components/Results'
import World from './game/World'
import HUD from './components/HUD'
import PauseMenu from './components/PauseMenu'
import TouchControls from './components/TouchControls'

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const paused = useGameStore((s) => s.paused)
  const setPaused = useGameStore((s) => s.setPaused)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && screen === 'race') {
        setPaused(!paused)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, paused, setPaused])

  if (screen === 'menu') return <MainMenu />
  if (screen === 'carSelect') return <CarSelect />
  if (screen === 'trackSelect') return <TrackSelect />
  if (screen === 'settings') return <Settings />
  if (screen === 'results') return <Results />

  return (
    <div className="relative w-full h-screen overflow-hidden bg-neutral-950 select-none">
      <World />
      <HUD />
      <TouchControls />
      {paused && <PauseMenu />}
    </div>
  )
}
