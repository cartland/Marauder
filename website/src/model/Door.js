export class Door {
  constructor(roomKey, location) {
    this.roomKey = roomKey;
    this.location = location;
  }

  static doorToRoom = (doors, roomKey) => {
    var foundDoor = null;
    doors.forEach(door => {
      if (door.roomKey == roomKey) {
        foundDoor = door;
      }
    });
    return foundDoor;
  }
}
