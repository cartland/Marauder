export class FootstepRenderer {
  constructor(config) {
    this.footstepLeftImg = new Image();
    this.footstepLeftImg.src = config.footstepLeft;
    this.footstepRightImg = new Image();
    this.footstepRightImg.src = config.footstepRight;
  }

  drawFootsteps = (context, footsteps) => {
    for (const [_, footstep] of Object.entries(footsteps)) {
      this.drawFoot(context, footstep);
    }
  }

  /**
   * Draw a foot near stepX, stepY.
   * footstepDirection is the direction of a single step.
   * Opacity allows the step to fade.
   */
  drawFoot = (context, footstep) => {
    let img = this.footstepLeftImg;
    if (footstep.stepNumber % 2 === 0) {
      img = this.footstepRightImg;
    }
    let stepLocation = footstep.location;
    let footstepDirection = footstep.direction;
    context.save()
    context.translate(stepLocation.x, stepLocation.y);
    context.rotate(Math.atan2(footstepDirection.y, footstepDirection.x) + 90 * Math.PI / 180)
    context.globalAlpha = footstep.opacity;
    context.drawImage(img, 0, 0, footstep.size, footstep.size * img.height / img.width);
    context.restore()
  }
}