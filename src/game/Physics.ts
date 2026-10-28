export class VehiclePhysics {
  // Constants
  private readonly MAX_SPEED = 220; // km/h
  private readonly ACCELERATION = 0.5;
  private readonly BRAKING = 0.8;
  private readonly FRICTION = 0.1;
  private readonly STEER_SPEED = 0.03;
  private readonly DRIFT_FACTOR = 0.96;
  private readonly OFF_ROAD_PENALTY = 0.6;

  // State
  public speed = 0;
  public lateralOffset = 0;
  public steeringAngle = 0;
  public trackProgress = 0;
  public isDrifting = false;
  public isOffRoad = false;

  // Inputs
  public inputs = {
    accelerate: false,
    brake: false,
    left: false,
    right: false,
    handbrake: false,
  };

  update(deltaTime: number, trackWidth: number) {
    // 1. Longitudinal movement
    if (this.inputs.accelerate) {
      this.speed += this.ACCELERATION;
    } else if (this.inputs.brake) {
      this.speed -= this.BRAKING;
    } else {
      this.speed -= this.FRICTION;
    }

    // Handbrake slows down speed
    if (this.inputs.handbrake) {
      this.speed -= this.BRAKING * 0.5;
    }

    // Clamp speed
    this.speed = Math.max(0, Math.min(this.speed, this.MAX_SPEED));

    // Apply off-road penalty
    const effectiveSpeed = this.isOffRoad ? this.speed * this.OFF_ROAD_PENALTY : this.speed;

    // 2. Lateral movement (Steering)
    const steerEffect = this.STEER_SPEED * (this.speed / 100 + 0.5);
    if (this.inputs.left) {
      this.steeringAngle -= steerEffect;
    } else if (this.inputs.right) {
      this.steeringAngle += steerEffect;
    } else {
      this.steeringAngle *= 0.9; // Return to center
    }

    // Drift logic
    this.isDrifting = this.inputs.handbrake && this.speed > 40;
    const lateralGrip = this.isDrifting ? this.DRIFT_FACTOR : 1.0;

    this.lateralOffset += this.steeringAngle * (this.speed / 50) * lateralGrip;

    // 3. Progress along track
    this.trackProgress += (effectiveSpeed * 0.0001) * deltaTime;

    // Check off-road
    this.isOffRoad = Math.abs(this.lateralOffset) > trackWidth / 2;

    // Boundary bounce (simplified)
    if (Math.abs(this.lateralOffset) > trackWidth * 1.2) {
       this.lateralOffset = Math.sign(this.lateralOffset) * trackWidth * 1.2;
       this.speed *= 0.9; // Hit wall
    }
  }

  reset(checkpointProgress: number, offset: number) {
    this.trackProgress = checkpointProgress;
    this.lateralOffset = offset;
    this.speed = 0;
    this.steeringAngle = 0;
  }
}
