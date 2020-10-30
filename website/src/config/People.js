import { Person } from '../model/Person.js'

import DobbyName from '../assets/dobby_h200.png';
import DumbledoreName from '../assets/dumbledore_h200.png';
import GoldenSnitchName from '../assets/golden_snitch_h200.png';
import HarryPotterName from '../assets/harry_potter_h200.png';
import MovingPortraitName from '../assets/moving_portrait_h200.png';
import Nimbus2000Name from '../assets/nimbus_2000_h200.png';
import ScabbersName from '../assets/scabbers_h200.png';
import WompingWillowName from '../assets/whomping_willow_h200.png';

let DobbyImg = new Image();
DobbyImg.src = DobbyName;

let DumbledoreImg = new Image();
DumbledoreImg.src = DumbledoreName;

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

let ScabbersImg = new Image();
ScabbersImg.src = ScabbersName;

export function generatePeople(rooms) {
  let people = {
    willow: new Person(
      'willow',
      'The Womping Willow',
      WompingWillowImg,
      [],
      rooms['willow_room']
    ),
    broom: new Person(
      'broom',
      'Nimbus 2000',
      Nimbus2000Img,
      [],
      rooms['broom_room']
    ),
    snitch: new Person(
      'snitch',
      'Golden Snitch',
      GoldenSnitchImg,
      [],
      rooms['snitch_room']
    ),
    portrait: new Person(
      'portrait',
      'Moving Portrait',
      MovingPortraitImg,
      [],
      rooms['portrait_room']
    ),
    dobby: new Person(
      'dobby',
      'Dobby',
      DobbyImg,
      [],
      rooms['kitchen']
    ),
    harry: new Person(
      'harry',
      'Harry Potter',
      HarryPotterImg,
      [],
      rooms['hallway']
    ),
    dumbledore: new Person(
      'dumbledore',
      'Dumbledore',
      DumbledoreImg,
      [],
      rooms['living_room']
    ),
    scabbers: new Person(
      'scabbers',
      'Scabbers',
      ScabbersImg,
      [],
      rooms['hallway']
    ),
    student: new Person(
      'student',
      'Gryffindor Student',
      null,
      [],
      rooms['hallway']
    ),
  };
  for (let count = 0; count < 3; count++) {
    let personKey = 'ghost' + count;
    people[personKey] = new Person(
      personKey,
      'Ghost',
      null,
      [],
      rooms['living_room']
    )
  }
  return people;
}
