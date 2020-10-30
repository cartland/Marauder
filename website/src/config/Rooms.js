import { V } from '../model/Vector2';
import { Door } from '../model/Door';
import { Room } from '../model/Room';

export function generateRooms() {
  let topGuideline = 510;
  let bedroomTopGuideline = 814;
  let kitchenLeftGuideline = 510;
  let kitchenBottomGuideline = 1062;

  let broomKitchenDoor = V(494, 570);
  let kitchenLivingRoomDoor = V(922, 570);
  let kitchenPatioDoor = V(826, 1080);
  let livingRoomHallwayDoor = V(1390, 710);
  let hallwaySnitchRoomDoor = V(1738, 800);
  let hallwayPortraitRoomDoor = V(1950, 800);
  let hallwayWillowRoomDoor = V(2100, 800);

  let broomTopLeft = V(276, topGuideline);
  let broomBottomRight = V(480, 766);
  let broomVector = broomBottomRight.sub(broomTopLeft);
  let broomSpawnLocation = V(broomVector.x / 2, 50);
  let broomRoom = new Room(
    'broom_room',
    broomTopLeft,
    broomVector,
    broomSpawnLocation,
    'Broom\'s Room',
    [
      new Door('kitchen', broomKitchenDoor.sub(broomTopLeft))
    ],
  );

  let kitchenTopLeft = V(kitchenLeftGuideline, topGuideline);
  let kitchenBottomRight = V(908, kitchenBottomGuideline);
  let kitchenVector = kitchenBottomRight.sub(kitchenTopLeft);
  let kitchenSpawnLocation = V(kitchenVector.x / 2, 50);
  let kitchen = new Room(
    'kitchen',
    kitchenTopLeft,
    kitchenVector,
    kitchenSpawnLocation,
    'Kitchen',
    [
      new Door('living_room', kitchenLivingRoomDoor.sub(kitchenTopLeft)),
      new Door('broom_room', broomKitchenDoor.sub(kitchenTopLeft)),
      new Door('patio', kitchenPatioDoor.sub(kitchenTopLeft)),
    ],
  );

  let livingRoomTopLeft = V(938, topGuideline);
  let livingRoomBottomRight = V(1378, 1064);
  let livingRoomVector = livingRoomBottomRight.sub(livingRoomTopLeft);
  let livingSpawnLocation = V(livingRoomVector.x / 2, 50);
  let livingRoom = new Room(
    'living_room',
    livingRoomTopLeft,
    livingRoomVector,
    livingSpawnLocation,
    'Living Room',
    [
      new Door('kitchen', kitchenLivingRoomDoor.sub(livingRoomTopLeft)),
      new Door('hallway', livingRoomHallwayDoor.sub(livingRoomTopLeft)),
    ],
  );

  let hallwayTopLeft = V(1408, 642);
  let hallwayBottomRight = V(2284, 784);
  let hallwayVector = hallwayBottomRight.sub(hallwayTopLeft);
  let hallwaySpawnLocation = V(hallwayVector.x / 4, 50);
  let hallway = new Room(
    'hallway',
    hallwayTopLeft,
    hallwayVector,
    hallwaySpawnLocation,
    'Hallway',
    [
      new Door('living_room', livingRoomHallwayDoor.sub(hallwayTopLeft)),
      new Door('snitch_room', hallwaySnitchRoomDoor.sub(hallwayTopLeft)),
      new Door('portrait_room', hallwayPortraitRoomDoor.sub(hallwayTopLeft)),
      new Door('willow_room', hallwayWillowRoomDoor.sub(hallwayTopLeft)),
    ],
  );

  let snitchTopLeft = V(1606, bedroomTopGuideline);
  let snitchBottomRight = V(1798, 1300);
  let snitchVector = snitchBottomRight.sub(snitchTopLeft);
  let snitchSpawnLocation = V(snitchVector.x / 2, 50);
  let snitchRoom = new Room(
    'snitch_room',
    snitchTopLeft,
    snitchVector,
    snitchSpawnLocation,
    'Snitch\'s Room',
    [
      new Door('hallway', hallwaySnitchRoomDoor.sub(snitchTopLeft)),
    ],
  );

  let portraitTopLeft = V(1828, bedroomTopGuideline);
  let portraitBottomRight = V(2024, 1300);
  let portraitVector = portraitBottomRight.sub(portraitTopLeft);
  let portraitSpawnLocation = V(portraitVector.x / 2, 50);
  let portraitRoom = new Room(
    'portrait_room',
    portraitTopLeft,
    portraitVector,
    portraitSpawnLocation,
    'Portrait\'s Room',
    [
      new Door('hallway', hallwayPortraitRoomDoor.sub(portraitTopLeft)),
    ],
  );

  let willowTopLeft = V(2052, bedroomTopGuideline);
  let willowBottomRight = V(2284, 1110);
  let willowVector = willowBottomRight.sub(willowTopLeft);
  let willowSpawnLocation = V(willowVector.x / 2, 50);
  let willowRoom = new Room(
    'willow_room',
    willowTopLeft,
    willowVector,
    willowSpawnLocation,
    'Willow\'s Room',
    [
      new Door('hallway', hallwayWillowRoomDoor.sub(willowTopLeft)),
    ],
  );

  let patioTopLeft = V(kitchenLeftGuideline, 1094);
  let patioBottomRight = V(1574, 1300);
  let patioVector = patioBottomRight.sub(patioTopLeft);
  let patioSpawnLocation = V(patioVector.x / 2, 50);
  let patio = new Room(
    'patio',
    patioTopLeft,
    patioVector,
    patioSpawnLocation,
    'Patio',
    [
      new Door('kitchen', kitchenPatioDoor.sub(patioTopLeft)),
    ],
  );

  let rooms = {
    broom_room: broomRoom,
    kitchen: kitchen,
    living_room: livingRoom,
    hallway: hallway,
    snitch_room: snitchRoom,
    portrait_room: portraitRoom,
    willow_room: willowRoom,
    patio: patio,
  };
  console.log(rooms);
  return rooms;
}
