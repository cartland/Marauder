
export class Person {
  constructor(name, paths, firstRoom) {
    this.name = name;
    this.paths = paths;
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

  firstPath() {
    if (this.paths.length === 0) {
      return null;
    }
    return this.paths[0];
  }

  lastPath() {
    if (this.paths.length === 0) {
      return null;
    }
    return this.paths[this.paths.length - 1];
  }

  addPaths(paths) {
    this.paths.push(...paths);
    this.lastRoom = this.lastPath().room;
    if (this.paths.length > 0) {
      let first = this.firstPath();
      if (first.startedAt) {
        this.setStartTime(this.firstPath().startedAt);
      }
    }
  }

  popPath() {
    let returnValue = this.firstPath();
    this.paths.shift();
    return returnValue;
  }

  setPaths(paths) {
    this.paths = paths;
    if (this.paths.length > 0) {
      this.lastRoom = this.lastPath().room;
    }
  }

  setStartTime(startTime) {
    this.firstPath().startedAt = startTime;
  }
}

export function generatePeople() {
  return {
    stromme: new Person(
      'The Womping Willow',
      [],
      'stromme_room'
    ),
    alberto: new Person(
      'Nimbus 2000',
      [],
      'alberto_room'
    ),
    cartland: new Person(
      'Golden Snitch',
      [],
      'cartland_room'
    ),
    nick: new Person(
      'Moving Portrait',
      [],
      'nick_room'
    ),
    tal: new Person(
      'Dobby',
      [],
      'kitchen'
    ),
    harry: new Person(
      'Harry Potter',
      [],
      'hallway'
    ),
    dumbledore: new Person(
      'Dumbledore',
      [],
      'living_room'
    ),
    ghost: new Person(
      'Ghost',
      [],
      'patio'
    ),
  };
}

