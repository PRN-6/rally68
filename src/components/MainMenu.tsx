import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Play, Settings, Trophy } from 'lucide-react';

export const MainMenu = () => {
  const { setGameState, bestTime } = useGameStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-white"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-8xl font-black italic tracking-tighter text-rally-red mb-2">
          LEFT LEFT LEFT
        </h1>
        <p className="text-xl font-medium tracking-widest uppercase text-gray-400 mb-12">
          One Road. Too Many Turns.
        </p>

        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={() => setGameState('COUNTDOWN')}
            className="group relative px-12 py-4 bg-rally-red hover:bg-rally-orange text-white text-2xl font-bold rounded-sm transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
          >
            <Play fill="currentColor" />
            PLAY
          </button>

          <div className="flex gap-4 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-sm backdrop-blur-sm">
              <Trophy className="text-yellow-500" size={20} />
              <span className="text-sm font-bold">BEST: {bestTime ? bestTime.toFixed(2) : '---'}s</span>
            </div>
            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-sm transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>

        <div className="mt-16 text-sm text-gray-500 uppercase tracking-widest grid grid-cols-2 gap-x-12 gap-y-2 text-left">
          <div className="flex justify-between gap-8">
            <span>WASD / ARROWS</span>
            <span className="text-gray-300">DRIVE</span>
          </div>
          <div className="flex justify-between gap-8">
            <span>SPACE</span>
            <span className="text-gray-300">HANDBRAKE</span>
          </div>
          <div className="flex justify-between gap-8">
            <span>R</span>
            <span className="text-gray-300">RESET</span>
          </div>
          <div className="flex justify-between gap-8">
            <span>ESC</span>
            <span className="text-gray-300">PAUSE</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
