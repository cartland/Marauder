/**
 * Copyright 2019 Chris Cartland and Andrew Stromme. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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