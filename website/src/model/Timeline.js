export class Timeline {
  constructor(events) {
    this.events = events;
  }

  addEvent = (event) => {
    this.events.push(event);
    this.events.sort((a, b) => {
      return a.timestampMillis - b.timestampMillis;
    });
  }
}
