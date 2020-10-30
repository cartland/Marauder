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
import { Room } from '../model/Room';

export class Path {
  constructor(room, startingLocation, endingLocation, duration, startedAt) {
    if (!room) {
      throw new Error(`room ${room} does not exist`);
    }
    if (!(room instanceof Room)) {
      console.log(room);
      throw new Error('Unexpected type: Expected Room');
    }
    this._room = room;
    this.startingLocation = startingLocation;
    this.endingLocation = endingLocation;
    this.duration = duration;
    this.startedAt = startedAt;
  }

  getRoom = () => {
    return this._room;
  }

  setRoom = (room) => {
    if (!(room instanceof Room)) {
      throw new Error('Unexpected type: Expected Room');
    }
    this._room = room;
  }
}
