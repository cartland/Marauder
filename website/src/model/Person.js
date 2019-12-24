import { Room } from '../model/Room';

export class Person {
  constructor(personKey, name, image, paths, firstRoom) {
    if (!(firstRoom instanceof Room)) {
      throw new Error('Unexpected type: Expected Room');
    }
    this.name = name;
    this.image = image;
    this.location = null;
    this.room = null;
    this.paths = paths;
    this.prng = null;
    this.showName = false;
    if (this.firstPath() == null) {
      this.firstRoom = firstRoom;
    } else {
      this.firstRoom = this.firstPath().room;
    }
    if (this.lastPath() == null) {
      this.lastRoom = null;
    } else {
      this.lastRoom = this.lastPath().room;
    }
  }

  getRoom = () => {
    return this.room;
  }

  setRoom = (room) => {
    if (!(room instanceof Room)) {
      throw new Error('Unexpected type: Expected Room');
    }
    this.room = room;
  }

  getFirstRoom = () => {
    return this.firstRoom;
  }

  setFirstRoom = (firstRoom) => {
    if (!(firstRoom instanceof Room)) {
      throw new Error('Unexpected type: Expected Room');
    }
    this.firstRoom = firstRoom;
  }

  firstPath = () => {
    if (this.paths.length === 0) {
      return null;
    }
    return this.paths[0];
  }

  lastPath = () => {
    if (this.paths.length === 0) {
      return null;
    }
    return this.paths[this.paths.length - 1];
  }

  addPaths = (paths) => {
    this.paths.push(...paths);
    this.lastRoom = this.lastPath().room;
    if (this.paths.length > 0) {
      let first = this.firstPath();
      if (first.startedAt) {
        this.setStartTime(this.firstPath().startedAt);
      }
    }
  }

  popPath =() => {
    let returnValue = this.firstPath();
    this.paths.shift();
    return returnValue;
  }

  setPaths = (paths) => {
    this.paths = paths;
    if (this.paths.length > 0) {
      this.lastRoom = this.lastPath().room;
    }
  }

  setStartTime = (startTime) => {
    let startedAt = startTime;
    for (let i = 0; i < this.paths.length; i++) {
      let path = this.paths[i];
      path.startedAt = startedAt;

      let nextTime = new Date(startedAt.getTime());
      nextTime.setMilliseconds(startedAt.getMilliseconds() + path.duration);

      startedAt = nextTime;
    }
  }
}
