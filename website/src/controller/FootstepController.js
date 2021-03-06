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
import { C } from "../config/C.js";
import { V } from '../model/Vector2.js';
import { Footstep } from '../model/Footstep.js';

export class FootstepController {
  constructor() {
    this.footsteps = {};
  }

  getFootsteps = () => {
    return this.footsteps;
  }

  containsFootstep = (key) => {
    return key in this.footsteps;
  }

  addFootstepToMap = (key, footstep) => {
    this.footsteps[key] = footstep;
  }

  deleteFootstep = (key) => {
    delete this.footsteps[key];
  }

  createFootsteps = (centerOfMassLocation, startingLocation, endingLocation, roomDetails, currentTime, duration, footstepSize) => {
    // Direction of a single step.
    let footstepDirection = endingLocation.sub(startingLocation).normalize();
    if (footstepDirection == null) {
      // Do not create footsteps when standing still.
      return;
    }
    // Distance traveled since the starting location.
    let centerOfMassDistance = centerOfMassLocation.sub(startingLocation).size();
    let scaledStepVector = footstepDirection.scale(C.STEP_DISTANCE);

    let totalDistance = endingLocation.sub(startingLocation).size();
    let speed = totalDistance / duration;

    // Number of steps since the starting location.
    let stepCount = Math.floor(centerOfMassDistance / C.STEP_DISTANCE);
    // For each step since the starting location, draw it.
    for (let stepNumber = 0; stepNumber <= stepCount; stepNumber++) {
      let stepLocation = startingLocation.add(scaledStepVector.scale(stepNumber));
      let distanceSinceStep = centerOfMassLocation.sub(stepLocation).size();
      let timeSinceStep = duration * distanceSinceStep / totalDistance;

      if (timeSinceStep >= C.STEP_FADE_DURATION) {
        continue;
      }
      let stepBeginTime = currentTime - timeSinceStep;

      // Global coordinates.
      let globalStepLocation = stepLocation.add(V(roomDetails.topLeft.x, roomDetails.topLeft.y));

      let leftFootstepLocation = globalStepLocation.add(scaledStepVector.orthogonalLeft().scale(C.STEP_WIDTH_FACTOR));
      let rightFootstepLocation = globalStepLocation.add(scaledStepVector.orthogonalRight().scale(C.STEP_WIDTH_FACTOR));

      if (stepNumber % 2 === 0) {
        this.createFootstep(rightFootstepLocation, footstepDirection, stepNumber, stepBeginTime, footstepSize);
      }
      if (stepNumber % 2 === 1) {
        this.createFootstep(leftFootstepLocation, footstepDirection, stepNumber, stepBeginTime, footstepSize);
      }
    }
  }

  createFootstep = (footstepLocation, footstepDirection, stepNumber, stepBeginTime, size) => {
    let footstep = new Footstep(footstepLocation, footstepDirection, stepNumber, stepBeginTime, size);
    let key = footstep.key();
    if (this.containsFootstep(key)) {
      // Do nothing.
    } else {
      this.addFootstepToMap(key, footstep);
    }
  }

  updateFootsteps = (currentTime) => {
    for (const [key, footstep] of Object.entries(this.footsteps)) {
      // Opacity is 1.0 if no time has passed fades to 0.0 if C.STEP_FADE_DURATION has passed.
      let timeSinceStep = currentTime - footstep.stepBeginTime;
      let opacity = Math.max(0, C.STEP_FADE_DURATION - timeSinceStep) / C.STEP_FADE_DURATION; // 0-1.0
      if (opacity <= 0) {
        this.deleteFootstep(key);
      }
      footstep.opacity = opacity;
    }
  }
}
