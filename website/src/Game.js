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
import { getEventsInRange } from './model/GameEvent';

export class Game {
  constructor(startTimestampMillis, rooms, people, timeline) {
    this.startTimestampMillis = startTimestampMillis;
    this.rooms = rooms;
    this.people = people;
    this.timeline = timeline;
    this.footprints = [];
  }

  processEventsInRange(events, beginTimestampMillis, endTimestampMillis) {
    if (events.length == 0) {
      return;
    }
    let lastEvent = events[0];
    const eventsInRange = getEventsInRange(events, beginTimestampMillis, endTimestampMillis);
    for (let i = 0; i < eventsInRange.length; i++) {
      let currentEvent = events[i];
      this.processEvent(lastEvent, currentEvent);
      lastEvent = currentEvent;
    }
  }

  processEvent(lastEvent, currentEvent) {
  }

  getPeople() {
    return this.people;
  }

  getFootprints() {
    return this.footprints;
  }
}
