import { C } from "../config/C";
import { V } from '../model/Vector2';
import { Door } from '../model/Door';
import { Path } from '../model/Path';
import { Random } from "../util/Random";

export class PathController {
  constructor(personController, roomController) {
    this.personController = personController;
    this.roomController = roomController;
    this.lastLogicUpdateTime = 0;
  }

  initializeAllPaths = (people, dateFromTimestamp, prng) => {
    if (!prng) {
      throw new Error('Expected random number generator');
    }
    Object.keys(people).map(personKey => {
      let person = people[personKey];
      console.log(person);
      person.prng = prng;
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

  addNRandomPathsToPerson = (person, count, prng) => {
    for (let round = 0; round < count; round++) {
      let lastPath = person.lastPath();
      if (lastPath) {
        let room = lastPath.getRoom();
        let location = lastPath.endingLocation;
        let paths = this.generateRandomPaths(location, room, prng);
        person.addPaths(paths);
      } else {
        let room = person.getFirstRoom();
        let location = room.spawnLocation;
        let paths = this.generateRandomPaths(location, room, prng);
        person.addPaths(paths);
      }
    }
  }

  generateRandomPaths = (startingLocation, room, prng) => {
    let randomChoice = prng.nextFloat();
    let randomDurationMs = 1000 * (2 * prng.nextFloat() + 1);

    if (!startingLocation) {
      let range = V(room.width, room.height);
      let buffer = 30;
      startingLocation = this.randomLocation(range, buffer, prng);
    }

    if (randomChoice < 0.1) { // Stand still.
      return [new Path(room, startingLocation, startingLocation, randomDurationMs, undefined)];
    } else if (randomChoice < 0.8) { // Move inside room.
      return [this.generateRandomPathInRoom(room, startingLocation, prng)];
    } else {
      return this.generateRandomRoomChange(room, startingLocation, prng);
    }
  }

  generateRandomPathInRoom = (room, startingLocation, prng) => {
    let randomSpeed = prng.nextFloat();

    let range = V(room.width, room.height);
    let buffer = 15;
    let endingLocation = this.randomLocation(range, buffer, prng);

    let distance = endingLocation.sub(startingLocation).size();

    let maxSpeed = 560 / 10; // cross the living room in 10 seconds
    let minSpeed = 560 / 30; // cross the living room in 20 seconds

    let speed = randomSpeed * (maxSpeed - minSpeed) + minSpeed;
    let duration = distance / speed;
    duration *= 1000;
    return new Path(room, startingLocation, endingLocation, duration, undefined);
  }

  randomLocation = (range, buffer, prng) => {
    let randomX = prng.nextFloat();
    let randomY = prng.nextFloat();
    let endingX = randomX * (range.x - (buffer * 2)) + buffer;
    let endingY = randomY * (range.y - (buffer * 2)) + buffer;
    return V(endingX, endingY);
  }

  generateRandomRoomChange = (room, startingLocation, prng) => {
    let doorOptions = room.doors;
    let randomDoorFloat = prng.nextFloat();
    let newDoorIndex = Math.floor(randomDoorFloat * doorOptions.length);
    let door = doorOptions[newDoorIndex];
    let doorLocation = door.location;

    let speed = 560 / 10; // cross the living room in 10 seconds
    let duration = 1000 * this.getDuration(startingLocation, doorLocation, speed);

    // First path to door.
    let pathToDoor = new Path(room, startingLocation, doorLocation, duration, undefined);

    let newRoomDoor = Door.doorToRoom(this.roomController.getRoom(door.roomKey).doors, room.roomKey);
    let otherSideDoorLocation = newRoomDoor.location;
    if (otherSideDoorLocation === undefined) {
      throw new Error(`room ${door.roomKey} does not have a door to ${room.roomKey}`)
    }

    // Second path from door in new room.
    let pathFromDoor = this.generateRandomPathInRoom(
      room,
      otherSideDoorLocation,
      prng
    );
    return [pathToDoor, pathFromDoor];
  }

  getDuration = (location1, location2, speed) => {
    let distance = location2.sub(location1).size();
    return distance / speed;
  }

  movePersonToRoom = (person, room, prng) => {
    if ("width" in room) {
      let roomSpawnLocation = room.spawnLocation;
      person.setPaths([
        new Path(room, roomSpawnLocation, roomSpawnLocation, C.STAND_STILL_DURATION_S * 1000, undefined)
      ]);
      person.setRoom(room);
    }
  }
}
