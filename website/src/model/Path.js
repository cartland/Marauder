
export class Path {
  constructor(room, startingLocation, endingLocation, duration, startedAt) {
    if (!room) {
      throw new Error(`room ${room} does not exist`);
    }
    this.room = room;
    this.startingLocation = startingLocation;
    this.endingLocation = endingLocation;
    this.duration = duration;
    this.startedAt = startedAt;
  }
}
