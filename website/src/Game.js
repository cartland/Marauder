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
