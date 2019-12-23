export class Person {
  constructor(name, image, paths, firstRoom) {
    if (typeof firstRoom === 'string') {
      throw new Error('Room must not be a string');
    }
    this.name = name;
    this.image = image;
    this.location = null;
    this.room = null;
    this.paths = paths;
    this.prng = null;
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
    if (typeof room === 'string') {
      throw new Error('Room must not be a string');
    }
    this.room = room;
  }

  getFirstRoom = () => {
    return this.firstRoom;
  }

  setFirstRoom = (firstRoom) => {
    if (typeof firstRoom === 'string') {
      throw new Error('Room must not be a string');
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
