export class RoomController {
  constructor(rooms) {
    this.rooms = rooms;
  }

  containsRoom = (roomKey) => {
    return roomKey in this.rooms;
  }

  getRoom = (roomKey) => {
    if (!this.containsRoom(roomKey)) {
      throw new Error('Canont get room with key: ' + roomKey);
    }
    return this.rooms[roomKey];
  }

  allRooms = () => {
    return this.rooms;
  }
}
