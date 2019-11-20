import { GameEvent } from './GameEvent'

export class Timeline {
  events: Array<GameEvent>
  constructor(events: Array<GameEvent>) {
    this.events = events;
  }

  addEvent(event: GameEvent) {
    this.events.push(event);
    this.events.sort((a, b) => {
      return a.timestampMillis - b.timestampMillis;
    })
  }
}
