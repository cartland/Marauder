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
    let currentPath = person.currentPath();
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
    person.hideNameTime = new Date().getTime() + C.SHOW_NAME_DURATION_MS;
    this.hideNameOrReschedule(person);
  }

  /**
   * Hide the person name if the time has passed.
   * If not, then schedule a timeout to try again with the new time.
   */
  hideNameOrReschedule = (person) => {
    let now = new Date().getTime();
    let hideTime = person.hideNameTime;
    if (now > hideTime) {
      person.showName = false;
    } else {
      let delayMs = hideTime - now;
      setTimeout(() => {
        this.hideNameOrReschedule(person);
      }, delayMs);
    }
  }
}
