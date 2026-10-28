import * as THREE from 'three';

export class TrackGenerator {
  public curve: THREE.CatmullRomCurve3;
  public points: THREE.Vector3[];
  public checkpoints: number[];

  constructor() {
    // Define a complex, winding rally track starting from the user's current camera position
    const startPos = new THREE.Vector3(12.34, 0, 30.56);
    const rawPoints = [
      startPos,                                // Start point at user's location
      new THREE.Vector3(startPos.x, 0, startPos.z - 100),           // Straight out
      new THREE.Vector3(startPos.x + 100, 0, startPos.z - 200),         // Curve right
      new THREE.Vector3(startPos.x + 200, 0, startPos.z - 300),         // Further right
      new THREE.Vector3(startPos.x + 150, 0, startPos.z - 450),         // Curve back left
      new THREE.Vector3(startPos.x + 50, 0, startPos.z - 550),          // Tight left
      new THREE.Vector3(startPos.x - 100, 0, startPos.z - 650),        // Sweep left
      new THREE.Vector3(startPos.x - 250, 0, startPos.z - 800),        // Long left bend
      new THREE.Vector3(startPos.x - 100, 0, startPos.z - 950),       // Right turn
      new THREE.Vector3(startPos.x + 100, 0, startPos.z - 1100),        // Returning center
      new THREE.Vector3(startPos.x + 200, 0, startPos.z - 1250),        // Right sweep
      new THREE.Vector3(startPos.x + 100, 0, startPos.z - 1400),        // Curve left
      new THREE.Vector3(startPos.x, 0, startPos.z - 1550),          // Center again
      new THREE.Vector3(startPos.x - 150, 0, startPos.z - 1700),       // Final left sweep
      new THREE.Vector3(startPos.x - 150, 0, startPos.z - 1900),       // Final stretch
      new THREE.Vector3(startPos.x - 150, 0, startPos.z - 2100),       // Finish line
    ];

    this.curve = new THREE.CatmullRomCurve3(rawPoints, false, 'centripetal');
    this.points = rawPoints;

    // Create checkpoints at every raw point
    this.checkpoints = rawPoints.map((_, i) => i);
  }

  getPointAt(t: number) {
    return this.curve.getPointAt(t % 1);
  }

  getTangentAt(t: number) {
    return this.curve.getTangentAt(t % 1);
  }

  getNormalAt(t: number) {
    const tangent = this.getTangentAt(t);
    const normal = new THREE.Vector3();
    normal.crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
    return normal;
  }
}

export const trackData = new TrackGenerator();
