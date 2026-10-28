import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MainMenu } from './MainMenu';
import { useGameStore } from '../store/gameStore';
import '@testing-library/jest-dom';

describe('MainMenu', () => {
  it('renders title and play button', () => {
    render(<MainMenu />);
    expect(screen.getByText(/LEFT LEFT LEFT/i)).toBeInTheDocument();
    expect(screen.getByText(/PLAY/i)).toBeInTheDocument();
  });

  it('calls setGameState when play is clicked', () => {
    vi.spyOn(useGameStore.getState(), 'setGameState');
    render(<MainMenu />);

    const playButton = screen.getByText(/PLAY/i);
    fireEvent.click(playButton);

    expect(useGameStore.getState().gameState).toBe('COUNTDOWN');
  });
});
