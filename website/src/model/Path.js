import { Room } from '../model/Room';

export class Path {
  constructor(room, startingLocation, endingLocation, duration, startedAt) {
    if (!room) {
      throw new Error(`room ${room} does not exist`);
    }
    if (!(room instanceof Room)) {
      console.log(room);
      throw new Error('Unexpected type: Expected Room');
    }
    this._room = room;
    this.startingLocation = startingLocation;
    this.endingLocation = endingLocation;
    this.duration = duration;
    this.startedAt = startedAt;
  }

  getRoom = () => {
    return this._room;
  }

  setRoom = (room) => {
    if (!(room instanceof Room)) {
      throw new Error('Unexpected type: Expected Room');
    }
    this._room = room;
  }
}
