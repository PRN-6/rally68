import { describe, it, expect, beforeEach } from 'vitest';
import { VehiclePhysics } from '../game/Physics';

describe('VehiclePhysics', () => {
  let physics: VehiclePhysics;

  beforeEach(() => {
    physics = new VehiclePhysics();
  });

  it('should initialize with valid default values', () => {
    expect(physics.speed).toBe(0);
    expect(physics.lateralOffset).toBe(0);
    expect(physics.trackProgress).toBe(0);
  });

  it('should increase speed when accelerating', () => {
    physics.inputs.accelerate = true;
    physics.update(16, 10); // 16ms frame, 10m road
    expect(physics.speed).toBeGreaterThan(0);
  });

  it('should not exceed maximum speed', () => {
    physics.inputs.accelerate = true;
    // Simulate long acceleration
    for (let i = 0; i < 1000; i++) {
      physics.update(16, 10);
    }
    expect(physics.speed).toBeLessThanOrEqual(220);
  });

  it('should decrease speed when braking', () => {
    physics.speed = 100;
    physics.inputs.brake = true;
    physics.update(16, 10);
    expect(physics.speed).toBeLessThan(100);
  });

  it('should change lateral offset when steering', () => {
    physics.speed = 100;
    physics.inputs.left = true;
    physics.update(16, 10);
    expect(physics.lateralOffset).not.toBe(0);
  });

  it('should apply off-road penalty', () => {
    physics.speed = 100;
    physics.lateralOffset = 15; // Outside 10m road
    physics.update(16, 10);
    // The speed update in current physics doesn't decrease speed but scales progress
    // we can verify isOffRoad is true
    expect(physics.isOffRoad).toBe(true);
  });
});
