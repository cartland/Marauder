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
import { C } from "../config/C";
import { V } from '../model/Vector2.js';
import { easeInOutQuad } from 'js-easing-functions';

export class PersonController {
  constructor(people, footstepController, roomController) {
    this.people = people;
    this.footstepController = footstepController;
    this.roomController = roomController;
  }

  getPeople = () => {
    return this.people;
  }

  getPerson = (personKey) => {
    return this.people[personKey];
  }

  updatePeople = (people, currentTime) => {
    Object.values(people).forEach(person => {
      this.updatePerson(person, currentTime);
    })
  }

  updatePerson = (person, currentTime) => {
    let currentPath = person.firstPath();
    if (!currentPath) {
      return;
    }
    let startingLocation = currentPath.startingLocation;
    let endingLocation = currentPath.endingLocation;
    let vector = endingLocation.sub(startingLocation);
    let duration = currentPath.duration;
    let elapsed = currentTime - currentPath.startedAt;
    // If startedAt or elapsed is undefined, then we use the startingLocation.
    let centerOfMassLocation = startingLocation;
    if (elapsed) {
      centerOfMassLocation = V(
        easeInOutQuad(elapsed, startingLocation.x, vector.x, duration),
        easeInOutQuad(elapsed, startingLocation.y, vector.y, duration)
      );
    }
    let roomDetails = this.roomController.getRoom(currentPath.getRoom().roomKey);
    person.room = roomDetails;
    person.location = centerOfMassLocation;

    let footstepSize = 12;
    if (person.showName === true) {
      footstepSize = 24;
    }
    this.footstepController.createFootsteps(centerOfMassLocation, startingLocation, endingLocation, roomDetails, currentTime, duration, footstepSize);
  }

  showPerson = (person) => {
    person.showName = true;
    let hideTime = new Date();
    hideTime.setSeconds(hideTime.getSeconds() + C.SHOW_NAME_DURATION_S);
    person.hideNameTime = hideTime;
    this.hideNameOrReschedule(person);
  }

  /**
   * Hide the person name if the time has passed.
   * If not, then schedule a timeout to try again with the new time.
   */
  hideNameOrReschedule = (person) => {
    let now = new Date();
    let hideTime = person.hideNameTime;
    if (now > hideTime) {
      person.showName = false;
    } else {
      let delayMs = hideTime.getTime() - now.getTime();
      setTimeout(() => {
        this.hideNameOrReschedule(person);
      }, delayMs);
    }
  }
}
