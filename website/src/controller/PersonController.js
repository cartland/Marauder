import { V } from '../model/Vector2.js';
import { easeInOutQuad } from 'js-easing-functions';

export class PersonController {
  constructor(footstepController) {
    this.footstepController = footstepController;
  }

  updatePerson = (rooms, person, currentTime) => {
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
    let roomDetails = rooms[currentPath.room];
    person.room = roomDetails;
    person.location = centerOfMassLocation;

    let footstepSize = 12;
    if (person.showName === true) {
      footstepSize = 24;
    }
    this.footstepController.createFootsteps(centerOfMassLocation, startingLocation, endingLocation, roomDetails, currentTime, duration, footstepSize);
  }
}
