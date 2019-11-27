export class GameEvent {
  constructor(timestampMillis, kind) {
    if (!timestampMillis) {
      throw 'GameEvent must have a timestamp, found ' + timestampMillis;
    }
    if (!kind) {
      throw 'GameEvent must have a kind, found ' + kind;
    }
    this.timestampMillis = timestampMillis;
    this.kind = kind;
  }

  toString() {
    return 'Event-' + this.kind + ': ' + this.timestampMillis;
  }
}

export class ResetEvent extends GameEvent {
  constructor(timestampMillis) {
    super(timestampMillis, 'RESET');
  }
}

export class WandTapEvent extends GameEvent {
  constructor(timestampMillis, personIndex, roomIndex) {
    super(timestampMillis, 'WANDTAP');
    this.personIndex = personIndex;
    this.roomIndex = roomIndex;
  }
}

/**
 * Return the events in the range [beginTimestampRange, endTimestampRange].
 *
 * @param {number} beginTimestampMillis Begin range, inclusive.
 * @param {number} endTimestampMillis End range, inclusive.
 */
export function getEventsInRange(events, beginTimestampMillis, endTimestampMillis) {
  let beginIndex = 0;
  for (; beginIndex < events.length; beginIndex++) {
    let event = events[beginIndex];
    if (event.timestampMillis < beginTimestampMillis) {
      continue;
    }
    if (event.timestampMillis > endTimestampMillis) {
      console.log(`getEventsInRange: No events in range`);
      return [];
    }
    console.log(`getEventsInRange: Found first event ${event.toString()}`);
    break;
  }
  const eventsInRange = new Array();
  let endIndex = beginIndex;
  for (; endIndex < events.length; endIndex++) {
    let event = events[endIndex];
    if (event.timestampMillis > endTimestampMillis) {
      break;
    }
    eventsInRange.push(event);
  }
  console.log(`getEventsInRange: beginIndex ${beginIndex} endIndex ${endIndex}`);
  return events;
}
