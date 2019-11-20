import {
  GameEvent,
  WandTapEvent,
  getEventsInRange
} from './model/GameEvent'
import { Timeline } from './model/Timeline';

export class Game {
  startTimestampMillis: Number;
  rooms: Array<object>;
  people: Array<object>;
  footprints: Array<object>;
  timeline: Timeline
  constructor(
    startTimestampMillis: Number,
    rooms: Array<object>,
    people: Array<object>,
    timeline: Timeline
  ) {
    this.startTimestampMillis = startTimestampMillis;
    this.rooms = rooms;
    this.people = people;
    this.timeline = timeline;
    this.footprints = [];
  }

  processEventsInRange(events: Array<GameEvent>, beginTimestampMillis: number, endTimestampMillis: number) {
    if (events.length == 0) {
      return;
    }
    let lastEvent: GameEvent = events[0];
    const eventsInRange = getEventsInRange(events, beginTimestampMillis, endTimestampMillis);
    for (let i = 0; i < eventsInRange.length; i++) {
      let currentEvent = events[i];
      this.processEvent(lastEvent, currentEvent);
      lastEvent = currentEvent;
    }
  }

  processEvent(lastEvent: GameEvent, currentEvent: GameEvent) {

  }

  getPeople() {
    return this.people;
  }

  getFootprints() {
    return this.footprints;
  }
}
