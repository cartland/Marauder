export class RoomController {
  constructor(rooms) {
    this.rooms = rooms;
  }

  containsRoom = (roomKey) => {
    return roomKey in this.rooms;
  }

  getRoom = (roomKey) => {
    return this.rooms[roomKey];
  }
}
