import * as THREE from 'three';

export class TrackData {
  public curve: THREE.CatmullRomCurve3;
  public points: THREE.Vector3[];

  constructor() {
    // A carefully designed rally stage layout
    const rawPoints = [
      new THREE.Vector3(0, 0, 0),               // Start
      new THREE.Vector3(0, 0, -200),            // Long straight
      new THREE.Vector3(100, 0, -300),          // Wide right
      new THREE.Vector3(200, 0, -400),          // Right continue
      new THREE.Vector3(100, 0, -500),          // Sharp Left
      new THREE.Vector3(0, 0, -600),            // Sharp Left (Hairpin 1)
      new THREE.Vector3(100, 0, -700),          // Right exit
      new THREE.Vector3(200, 0, -800),          // S-bend 1
      new THREE.Vector3(100, 0, -900),          // S-bend 2
      new THREE.Vector3(200, 0, -1000),         // Right turn
      new THREE.Vector3(300, 0, -1100),         // Right turn
      new THREE.Vector3(200, 0, -1200),         // Sharp Left (Hairpin 2)
      new THREE.Vector3(100, 0, -1300),         // Left continue
      new THREE.Vector3(0, 0, -1500),           // Final stretch
    ];

    this.points = rawPoints;
    this.curve = new THREE.CatmullRomCurve3(rawPoints, false, 'centripetal');
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

export const trackData = new TrackData();
