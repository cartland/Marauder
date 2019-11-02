
import DobbyName from './assets/dobby_h100.png';
import GoldenSnitchName from './assets/golden_snitch_h100.png';
import HarryPotterName from './assets/harry_potter_h100.png';
import MovingPortraitName from './assets/moving_portrait_h100.png';
import Nimbus2000Name from './assets/nimbus_2000_h100.png';
import WompingWillowName from './assets/womping_willow_h100.png';

let DobbyImg = new Image();
DobbyImg.src = DobbyName;

let GoldenSnitchImg = new Image();
GoldenSnitchImg.src = GoldenSnitchName;

let HarryPotterImg = new Image();
HarryPotterImg.src = HarryPotterName;

let MovingPortraitImg = new Image();
MovingPortraitImg.src = MovingPortraitName;

let Nimbus2000Img = new Image();
Nimbus2000Img.src = Nimbus2000Name;

let WompingWillowImg = new Image();
WompingWillowImg.src = WompingWillowName;

export class Person {
  constructor(name, image, paths, firstRoom) {
    this.name = name;
    this.image = image;
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
      WompingWillowImg,
      [],
      'stromme_room'
    ),
    alberto: new Person(
      'Nimbus 2000',
      Nimbus2000Img,
      [],
      'alberto_room'
    ),
    cartland: new Person(
      'Golden Snitch',
      GoldenSnitchImg,
      [],
      'cartland_room'
    ),
    nick: new Person(
      'Moving Portrait',
      MovingPortraitImg,
      [],
      'nick_room'
    ),
    tal: new Person(
      'Dobby',
      DobbyImg,
      [],
      'kitchen'
    ),
    harry: new Person(
      'Harry Potter',
      HarryPotterImg,
      [],
      'hallway'
    ),
    dumbledore: new Person(
      'Dumbledore',
      null,
      [],
      'living_room'
    ),
    ghost: new Person(
      'Ghost',
      null,
      [],
      'patio'
    ),
  };
}

