/**
 * Copyright 2019 Chris Cartland and Andrew Stromme. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
