import { V } from '../model/Vector2';
import { Door } from '../model/Door';
import { Path } from '../model/Path';
import { Room } from '../model/Room';

export class PathGenerator {
  constructor(roomController) {
    this.roomController = roomController;
  }

  generateRandomPaths = (startingLocation, room, prng) => {
    if (!(room instanceof Room)) {
      throw new Error('Expected a Room, found ' + room);
    }
    if (!startingLocation) {
      let range = V(room.width, room.height);
      let buffer = 30;
      startingLocation = this.randomLocation(range, buffer, prng);
    }

    let randomChoice = prng.nextFloat();
    if (randomChoice < 0.1) { // Stand still.
      let randomDurationMs = 1000 * (2 * prng.nextFloat() + 1);
      return [new Path(room, startingLocation, startingLocation, randomDurationMs, undefined)];
    } else if (randomChoice < 0.8) { // Move inside room.
      return [this.generateRandomPathInRoom(room, startingLocation, prng)];
    } else {
      return this.generateRandomRoomChange(room, startingLocation, prng);
    }
  }

  randomLocation = (range, buffer, prng) => {
    let randomX = prng.nextFloat();
    let randomY = prng.nextFloat();
    let endingX = randomX * (range.x - (buffer * 2)) + buffer;
    let endingY = randomY * (range.y - (buffer * 2)) + buffer;
    return V(endingX, endingY);
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

  generateRandomRoomChange = (room, startingLocation, prng) => {
    let doorOptions = room.doors;
    let randomDoorFloat = prng.nextFloat();
    let newDoorIndex = Math.floor(randomDoorFloat * doorOptions.length);
    let door = doorOptions[newDoorIndex];
    let doorLocation = door.location;
    let newRoomKey = door.roomKey;
    let newRoom = this.roomController.getRoom(newRoomKey);

    let speed = 560 / 10; // cross the living room in 10 seconds
    let duration = 1000 * this.getDuration(startingLocation, doorLocation, speed);

    // First path to door.
    let pathToDoor = new Path(room, startingLocation, doorLocation, duration, undefined);

    let newRoomDoor = Door.doorToRoom(newRoom.doors, room.roomKey);
    let otherSideDoorLocation = newRoomDoor.location;
    if (otherSideDoorLocation === undefined) {
      throw new Error(`room ${door.roomKey} does not have a door to ${room.roomKey}`)
    }

    // Second path from door in new room.
    let pathFromDoor = this.generateRandomPathInRoom(
      newRoom,
      otherSideDoorLocation,
      prng
    );
    return [pathToDoor, pathFromDoor];
  }

  getDuration = (location1, location2, speed) => {
    let distance = location2.sub(location1).size();
    return distance / speed;
  }
}
