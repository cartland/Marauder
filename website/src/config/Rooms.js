import { V } from '../model/Vector2';
import { Door } from '../model/Door';
import { Room } from '../model/Room';

export function generateRooms() {
  let topGuideline = 510;
  let bedroomTopGuideline = 814;
  let kitchenLeftGuideline = 510;
  let kitchenBottomGuideline = 1062;

  let albertoKitchenDoor = V(494, 570);
  let kitchenLivingRoomDoor = V(922, 570);
  let kitchenPatioDoor = V(826, 1080);
  let livingRoomHallwayDoor = V(1390, 710);
  let hallwayCartlandRoomDoor = V(1738, 800);
  let hallwayNickRoomDoor = V(1950, 800);
  let hallwayStrommeRoomDoor = V(2100, 800);

  let albertoTopLeft = V(276, topGuideline);
  let albertoBottomRight = V(480, 766);
  let albertoVector = albertoBottomRight.sub(albertoTopLeft);
  let albertoSpawnLocation = V(albertoVector.x / 2, 50);
  let albertoRoom = new Room(
    'alberto_room',
    albertoTopLeft,
    albertoVector,
    albertoSpawnLocation,
    'Alberto\'s Room',
    [
      new Door('kitchen', albertoKitchenDoor.sub(albertoTopLeft))
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
      new Door('alberto_room', albertoKitchenDoor.sub(kitchenTopLeft)),
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
      new Door('cartland_room', hallwayCartlandRoomDoor.sub(hallwayTopLeft)),
      new Door('nick_room', hallwayNickRoomDoor.sub(hallwayTopLeft)),
      new Door('stromme_room', hallwayStrommeRoomDoor.sub(hallwayTopLeft)),
    ],
  );

  let cartlandTopLeft = V(1606, bedroomTopGuideline);
  let cartlandBottomRight = V(1798, 1300);
  let cartlandVector = cartlandBottomRight.sub(cartlandTopLeft);
  let cartlandSpawnLocation = V(cartlandVector.x / 2, 50);
  let cartlandRoom = new Room(
    'cartland_room',
    cartlandTopLeft,
    cartlandVector,
    cartlandSpawnLocation,
    'Cartland\'s Room',
    [
      new Door('hallway', hallwayCartlandRoomDoor.sub(cartlandTopLeft)),
    ],
  );

  let nickTopLeft = V(1828, bedroomTopGuideline);
  let nickBottomRight = V(2024, 1300);
  let nickVector = nickBottomRight.sub(nickTopLeft);
  let nickSpawnLocation = V(nickVector.x / 2, 50);
  let nickRoom = new Room(
    'nick_room',
    nickTopLeft,
    nickVector,
    nickSpawnLocation,
    'Nick\'s Room',
    [
      new Door('hallway', hallwayNickRoomDoor.sub(nickTopLeft)),
    ],
  );

  let strommeTopLeft = V(2052, bedroomTopGuideline);
  let strommeBottomRight = V(2284, 1110);
  let strommeVector = strommeBottomRight.sub(strommeTopLeft);
  let strommeSpawnLocation = V(strommeVector.x / 2, 50);
  let strommeRoom = new Room(
    'stromme_room',
    strommeTopLeft,
    strommeVector,
    strommeSpawnLocation,
    'Stromme\'s Room',
    [
      new Door('hallway', hallwayStrommeRoomDoor.sub(strommeTopLeft)),
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
    alberto_room: albertoRoom,
    kitchen: kitchen,
    living_room: livingRoom,
    hallway: hallway,
    cartland_room: cartlandRoom,
    nick_room: nickRoom,
    stromme_room: strommeRoom,
    patio: patio,
  };
  console.log(rooms);
  return rooms;
}
