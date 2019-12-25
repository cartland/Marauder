import { C } from "../config/C";
import { V } from '../model/Vector2';
import { Path } from '../model/Path';
import { Random } from "../util/Random";

export class PathController {
  constructor(pathGenerator, personController, roomController) {
    this.pathGenerator = pathGenerator;
    this.personController = personController;
    this.roomController = roomController;
    this.lastLogicUpdateTime = 0;
  }

  initializeAllPaths = (people, dateFromTimestamp, seed) => {
    if (typeof seed !== 'number') {
      throw new Error('Expected seed to be a number');
    }
    Object.values(people).forEach((person, index) => {
      console.log(person.name);
      const prng = new Random(seed + index);
      person.setPaths([]);
      this.addNRandomPathsToPerson(person, C.INITIAL_PATH_COUNT, prng);
      if (dateFromTimestamp) {
        person.setStartTime(dateFromTimestamp);
      }
    });
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
    if (person.currentPath() == null) {
      console.error(`Person ${person.name} has no paths`);
      let location = V(50, 50);
      let duration = 2 * 1000;
      person.addPaths([
        new Path(person.firstRoom, location, location, duration, undefined)
      ]);
    }

    // case: we are at the start, and need to kick things off
    if (person.currentPath().startedAt === undefined) {
      person.setStartTime(currentTime);
    }
    let elapsed = currentTime - person.currentPath().startedAt;
    while (elapsed > person.currentPath().duration) {
      let poppedPath = person.popPath();
      elapsed -= poppedPath.duration;
      if (person.currentPath() == null) {
        const prng = new Random(person.lastStartTime.seconds + person.lastPopCount);
        let paths = this.pathGenerator.generateRandomPaths(poppedPath.endingLocation, poppedPath.room, prng);
        person.addPaths(paths);
      }
    }
  }

  wandTapped = (room, person, timestamp) => {
    if (!room) {
      console.log('Unknown Room for wand tap');
      return;
    }
    if (!person) {
      console.log('Unknown Person for wand tap');
      return;
    }
    console.log('wandTapped', room.roomKey, person.personKey, timestamp);
    this.movePerson(room, person, timestamp);
    this.personController.showPerson(person);
  }

  movePerson = (room, person, timestamp) => {
    const prng = new Random(timestamp.seconds);
    this.movePersonToRoom(person, room);
    this.addNRandomPathsToPerson(person, C.INITIAL_PATH_COUNT, prng);
    let milliseconds = timestamp.seconds * 1000;
    let dateFromTimestamp = new Date(milliseconds);
    person.setStartTime(dateFromTimestamp);
  }

  movePersonToRoom = (person, room) => {
    if ("width" in room) {
      let roomSpawnLocation = room.spawnLocation;
      person.setPaths([
        new Path(room, roomSpawnLocation, roomSpawnLocation, C.STAND_STILL_DURATION_S * 1000, undefined)
      ]);
      person.setRoom(room);
    }
  }

  addNRandomPathsToPerson = (person, count, prng) => {
    for (let round = 0; round < count; round++) {
      let lastPath = person.lastPath();
      if (lastPath) {
        let room = lastPath.getRoom();
        let location = lastPath.endingLocation;
        let paths = this.pathGenerator.generateRandomPaths(location, room, prng);
        person.addPaths(paths);
      } else {
        let room = person.getFirstRoom();
        let location = room.spawnLocation;
        let paths = this.pathGenerator.generateRandomPaths(location, room, prng);
        person.addPaths(paths);
      }
    }
  }
}
