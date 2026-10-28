import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { MainMenu } from './components/MainMenu';
import { GameHUD } from './components/GameHUD';
import { GameCanvas } from './game/GameCanvas';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const { gameState, setGameState } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (gameState === 'RACING') setGameState('PAUSED');
        else if (gameState === 'PAUSED') setGameState('RACING');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, setGameState]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <GameCanvas />

      <AnimatePresence>
        {gameState === 'MENU' && <MainMenu />}

        {gameState === 'COUNTDOWN' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/40"
          >
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              transition={{ repeat: 3, duration: 0.8, repeatType: 'reverse' }}
              onAnimationComplete={() => setGameState('RACING')}
              className="text-9xl font-black text-white italic"
            >
              GO!
            </motion.h1>
          </motion.div>
        )}

        {gameState === 'RACING' && <GameHUD />}

        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-6xl font-black text-white mb-8 italic">PAUSED</h2>
              <button
                onClick={() => setGameState('RACING')}
                className="px-8 py-3 bg-white text-black font-bold rounded-sm hover:bg-gray-200 transition-colors"
              >
                RESUME
              </button>
            </div>
          </div>
        )}

        {gameState === 'FINISHED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <div className="text-center text-white">
              <h2 className="text-7xl font-black mb-4 italic text-rally-red">FINISH!</h2>
              <button
                onClick={() => {
                  useGameStore.getState().resetRace();
                  setGameState('MENU');
                }}
                className="px-12 py-4 bg-white text-black font-bold text-xl rounded-sm hover:bg-gray-200 transition-all"
              >
                MAIN MENU
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
