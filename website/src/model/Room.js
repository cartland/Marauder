export class Room {
  constructor(roomKey, topLeft, dimensions, spawnLocation, name, doors) {
    this.roomKey = roomKey;
    this.topLeft = topLeft;
    this.width = dimensions.x;
    this.height = dimensions.y;
    this.spawnLocation = spawnLocation;
    this.name = name;
    this.doors = doors;
  }
}
