
import { V } from './Vector2.js';

export function generateRooms() {
  let rooms = {
    alberto_room: {
      topLeft: V(
        201,
        439,
      ),
      height: 285,
      width: 285,
      spawnLocation: V(150, 50),
      name: 'Alberto\'s Room',
      doors: {
        kitchen: V(285, 62),
      },
    },
    kitchen: {
      topLeft: V(
        486,
        439,
      ),
      height: 563,
      width: 386,
      spawnLocation: V(190, 50),
      name: 'Kitchen',
      doors: {
        living_room: V(386, 480),
        alberto_room: V(0, 62),
        patio: V(327, 563),
      },
    },
    living_room: {
      topLeft: V(
        872,
        439,
      ),
      height: 563,
      width: 420,
      spawnLocation: V(210, 50),
      name: 'Living Room',
      doors: {
        kitchen: V(0, 480),
        hallway: V(420, 62),
      },
    },
    hallway: {
      topLeft: V(
        1292,
        439,
      ),
      height: 172,
      width: 992,
      spawnLocation: V(200, 50),
      name: 'Hallway',
      doors: {
        living_room: V(0, 62),
        cartland_room: V(442, 172),
        nick_room: V(726, 172),
        stromme_room: V(838, 172),
      },
    },
    cartland_room: {
      topLeft: V(
        1504,
        611,
      ),
      height: 495,
      width: 285,
      spawnLocation: V(150, 50),
      name: 'Cartland\'s Room',
      doors: {
        hallway: V(230, 0),
      },
    },
    nick_room: {
      topLeft: V(
        1789,
        611,
      ),
      height: 495,
      width: 285,
      spawnLocation: V(150, 50),
      name: 'Nick\'s Room',
      doors: {
        hallway: V(229, 0),
      },
    },
    stromme_room: {
      topLeft: V(
        2074,
        611,
      ),
      height: 391,
      width: 374,
      spawnLocation: V(190, 50),
      name: 'Stromme\'s Room',
      doors: {
        hallway: V(56, 0),
      },
    },
    patio: {
      topLeft: V(
        487,
        1002,
      ),
      height: 104,
      width: 1018,
      spawnLocation: V(500, 50),
      name: 'Patio',
      doors: {
        kitchen: V(327, 0),
      },
    },
  };
  return rooms;
}

