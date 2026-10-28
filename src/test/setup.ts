import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom/vitest';

// Mock Three.js and R3F since they require WebGL
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      render: vi.fn(),
      dispose: vi.fn(),
      setSize: vi.fn(),
    })),
  };
});

vi.mock('@react-three/fiber', async () => {
  return {
    Canvas: ({ children }: any) => {
      return React.createElement('div', { 'data-testid': 'r3f-canvas' }, children);
    },
    useFrame: () => {},
  };
});

vi.mock('@react-three/drei', async () => {
  return {
    OrbitControls: () => {
      return React.createElement('div', { 'data-testid': 'orbit-controls' });
    },
  };
});
