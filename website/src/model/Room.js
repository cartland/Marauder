export class Room {
  constructor(topLeft, dimensions, spawnLocation, name, doors) {
    this.topLeft = topLeft;
    this.width = dimensions.x;
    this.height = dimensions.y;
    this.spawnLocation = spawnLocation;
    this.name = name;
    this.doors = doors;
  }
}