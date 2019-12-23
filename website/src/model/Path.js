export class Path {
  constructor(room, startingLocation, endingLocation, duration, startedAt) {
    if (!room) {
      throw new Error(`room ${room} does not exist`);
    }
    if (typeof room === 'string') {
      throw new Error('Room must not be a string');
    }
    this.room = room;
    this.startingLocation = startingLocation;
    this.endingLocation = endingLocation;
    this.duration = duration;
    this.startedAt = startedAt;
  }

  getRoom = () => {
    return this.room;
  }

  setRoom = (room) => {
    if (typeof room === 'string') {
      throw new Error('Room must not be a string');
    }
    this.room = room;
  }
}
