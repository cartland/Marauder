export class Footstep {
  constructor(location, direction, stepNumber, stepBeginTime, size) {
    this.location = location;
    this.direction = direction;
    this.stepNumber = stepNumber;
    this.stepBeginTime = stepBeginTime;
    this.size = size;
  }

  key() {
    return this.location.x.toPrecision(5) + ","
      + this.location.y.toPrecision(5) + ","
      + this.direction.x.toPrecision(5) + ","
      + this.direction.y.toPrecision(5);
  }
}
