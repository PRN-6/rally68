import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameState = 'MENU' | 'COUNTDOWN' | 'RACING' | 'PAUSED' | 'FINISHED';

interface GameStore {
  gameState: GameState;
  bestTime: number | null;
  currentTime: number;
  currentSpeed: number;
  currentRPM: number;
  currentGear: number;
  currentCheckpoint: number;
  totalCheckpoints: number;

  // State Updates
  setGameState: (state: GameState) => void;
  setCurrentTime: (time: number) => void;
  setCurrentSpeed: (speed: number) => void;
  setCurrentRPM: (rpm: number) => void;
  setCurrentGear: (gear: number) => void;
  setCurrentCheckpoint: (checkpoint: number) => void;
  setTotalCheckpoints: (total: number) => void;
  updateBestTime: (time: number) => void;
  resetRace: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      gameState: 'MENU',
      bestTime: null,
      currentTime: 0,
      currentSpeed: 0,
      currentRPM: 0,
      currentGear: 1,
      currentCheckpoint: 0,
      totalCheckpoints: 0,
      setGameState: (state) => set({ gameState: state }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setCurrentSpeed: (speed) => set({ currentSpeed: speed }),
      setCurrentRPM: (rpm) => set({ currentRPM: rpm }),
      setCurrentGear: (gear) => set({ currentGear: gear }),
      setCurrentCheckpoint: (checkpoint) => set({ currentCheckpoint: checkpoint }),
      setTotalCheckpoints: (total) => set({ totalCheckpoints: total }),
      updateBestTime: (time) => set((state) => {
        if (state.bestTime === null || time < state.bestTime) {
          return { bestTime: time };
        }
        return state;
      }),
      resetRace: () => set({
        currentTime: 0,
        currentSpeed: 0,
        currentRPM: 0,
        currentGear: 1,
        currentCheckpoint: 0,
      }),
    }),
    {
      name: 'left-left-left-storage',
    }
  )
);
