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
    stromme: new Person(
      'The Womping Willow',
      WompingWillowImg,
      [],
      rooms['stromme_room']
    ),
    alberto: new Person(
      'Nimbus 2000',
      Nimbus2000Img,
      [],
      rooms['alberto_room']
    ),
    cartland: new Person(
      'Golden Snitch',
      GoldenSnitchImg,
      [],
      rooms['cartland_room']
    ),
    nick: new Person(
      'Moving Portrait',
      MovingPortraitImg,
      [],
      rooms['nick_room']
    ),
    tal: new Person(
      'Dobby',
      DobbyImg,
      [],
      rooms['kitchen']
    ),
    harry: new Person(
      'Harry Potter',
      HarryPotterImg,
      [],
      rooms['hallway']
    ),
    dumbledore: new Person(
      'Dumbledore',
      DumbledoreImg,
      [],
      rooms['living_room']
    ),
    scabbers: new Person(
      'Scabbers',
      ScabbersImg,
      [],
      rooms['hallway']
    ),
    student: new Person(
      'Gryffindor Student',
      null,
      [],
      rooms['hallway']
    ),
  };
  for (let count = 0; count < 3; count++) {
    people['ghost' + count] = new Person(
      'Ghost',
      null,
      [],
      rooms['living_room']
    )
  }
  return people;
}
