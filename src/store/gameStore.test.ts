import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';

describe('GameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetRace();
    useGameStore.getState().setGameState('MENU');
  });

  it('should have correct initial state', () => {
    const state = useGameStore.getState();
    expect(state.gameState).toBe('MENU');
    expect(state.currentTime).toBe(0);
    expect(state.currentSpeed).toBe(0);
  });

  it('should update game state', () => {
    useGameStore.getState().setGameState('RACING');
    expect(useGameStore.getState().gameState).toBe('RACING');
  });

  it('should update current speed', () => {
    useGameStore.getState().setCurrentSpeed(120);
    expect(useGameStore.getState().currentSpeed).toBe(120);
  });

  it('should reset race correctly', () => {
    useGameStore.getState().setCurrentSpeed(100);
    useGameStore.getState().setCurrentTime(50);
    useGameStore.getState().resetRace();

    const state = useGameStore.getState();
    expect(state.currentSpeed).toBe(0);
    expect(state.currentTime).toBe(0);
  });
});
