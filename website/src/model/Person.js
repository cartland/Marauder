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
    this.lastStartTime = null;
    this.lastPopCount = 0;
    this.showName = false;
    if (this.currentPath() == null) {
      this.firstRoom = firstRoom;
    } else {
      this.firstRoom = this.currentPath().room;
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

  currentPath = () => {
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
      let first = this.currentPath();
      if (first.startedAt) {
        this.setStartTime(this.currentPath().startedAt);
      }
    }
  }

  popPath =() => {
    let returnValue = this.currentPath();
    this.paths.shift();
    this.lastPopCount = this.lastPopCount + 1;
    return returnValue;
  }

  setPaths = (paths) => {
    this.paths = paths;
    if (this.paths.length > 0) {
      this.lastRoom = this.lastPath().room;
    }
  }

  setStartTime = (startTime) => {
    this.lastStartTime = startTime;
    this.lastPopCount = 0;
    let startedAt = startTime;
    for (let i = 0; i < this.paths.length; i++) {
      let path = this.paths[i];
      path.startedAt = startedAt;
      startedAt = startedAt + path.duration;
    }
  }
}
