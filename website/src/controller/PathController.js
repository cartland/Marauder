import { C } from "../config/C";
import { V } from '../model/Vector2';
import { Path } from '../model/Path';
import { Random } from "../util/Random";

export class PathController {
  constructor(footsteps) {
    this.lastLogicUpdateTime = 0;
  }

  updatePaths = (people, currentTime) => {
    if (currentTime.getTime() - this.lastLogicUpdateTime > C.UPDATE_LOGIC_INTERVAL_MS) {
      Object.keys(people).map(personKey => {
        this.updatePathForPerson(people[personKey], currentTime);
      })
    }
    this.lastLogicUpdateTime = currentTime.getTime();
  }

  updatePathForPerson = (person, currentTime) => {
    if (person.firstPath() == null) {
      console.error(`Person ${person.name} has no paths`);
      let location = V(50, 50);
      let duration = 2 * 1000;
      person.addPaths([
        new Path(person.firstRoom, location, location, duration, undefined)
      ]);
    }

    // case: we are at the start, and need to kick things off
    if (person.firstPath().startedAt === undefined) {
      person.setStartTime(currentTime);
    }
    let elapsed = currentTime - person.firstPath().startedAt;
    while (elapsed > person.firstPath().duration) {
      let poppedPath = person.popPath();
      elapsed -= poppedPath.duration;
      if (person.firstPath() == null) {
        console.log('Warning: No path, created a new one.', person.name, person.paths);
        let prng = person.prng;
        if (!prng) {
          console.log('No PRNG. Using random');
          prng = new Random();
        } else {
          console.log('Using person PRNG to create new paths');
        }
        let paths = this.generateRandomPaths(poppedPath.endingLocation, poppedPath.room, prng);
        person.addPaths(paths);
      }
    }
  }
}
