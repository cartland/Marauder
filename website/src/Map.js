import React, {Component} from 'react';
import { easeInOutQuad } from 'js-easing-functions';

import * as firebase from "firebase/app";
import "firebase/firestore";

/* global window */
window.easeInOutQuad = easeInOutQuad

let rooms = {
  alberto_room: {
    topLeft: {
      x: 201,
      y: 439,
    },
    height: 285,
    width: 285,
    name: 'Alberto\'s Room',
    doors: {
      kitchen: [285, 62],
    },
  },
  kitchen: {
    topLeft: {
      x: 486,
      y: 439,
    },
    height: 563,
    width: 386,
    name: 'Kitchen',
    doors: {
      living_room: [386, 480],
      alberto_room: [0, 62],
      patio: [327, 563],
    },
  },
  living_room: {
    topLeft: {
      x: 872,
      y: 439,
    },
    height: 563,
    width: 420,
    name: 'Living Room',
    doors: {
      kitchen: [0, 480],
      hallway: [420, 62],
    },
  },
  hallway: {
    topLeft: {
      x: 1292,
      y: 439,
    },
    height: 172,
    width: 992,
    name: 'Hallway',
    doors: {
      living_room: [0, 62],
      cartland_room: [442, 172],
      nick_room: [726, 172],
      stromme_room: [838, 172],
    },
  },
  cartland_room: {
    topLeft: {
      x: 1504,
      y: 611,
    },
    height: 495,
    width: 285,
    name: 'Cartland\'s Room',
    doors: {
      hallway: [230, 0],
    },
  },

  nick_room: {
    topLeft: {
      x: 1789,
      y: 611,
    },
    height: 495,
    width: 285,
    name: 'Nick\'s Room',
    doors: {
      hallway: [229, 0],
    },
  },

  stromme_room: {
    topLeft: {
      x: 2074,
      y: 611,
    },
    height: 391,
    width: 374,
    name: 'Stromme\'s Room',
    doors: {
      hallway: [56, 0],
    },
  },

  patio: {
    topLeft: {
      x: 487,
      y: 1002,
    },
    height: 104,
    width: 1018,
    name: 'Patio',
    doors: {
      kitchen: [327, 0],
    },
  },
}

class Canvas extends React.Component {
  state = {
  }

  constructor(props) {
    super(props);

    firebase.firestore().collection('nfcUpdates')
      .where('timestamp', '>', new Date())
      .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          let room = change.doc.get('nfcData').nfcReaderLocation;
          let person = change.doc.get('nfcData').nfcLogicalId;

          this.wandTapped(room, person);
        }
      });
    });

    this.people = {
      stromme: {
        name: 'Stromme',
        room: 'stromme_room',
        waypoints: [
          this.newStandingStillWaypoint([300, 300], 2*1000, 'stromme_room'),
        ],
      },
      alberto: {
        name: 'Alberto',
        room: 'alberto_room',
        waypoints: [
          this.newStandingStillWaypoint([0, 0], 2*1000, 'alberto_room'),
        ],
      },
      cartland: {
        name: 'Cartland',
        room: 'cartland_room',
        waypoints: [
          this.newStandingStillWaypoint([0, 0], 2*1000, 'cartland_room'),
        ],
      },
      nick: {
        name: 'Nick',
        room: 'nick_room',
        waypoints: [
          this.newStandingStillWaypoint([0, 0], 2*1000, 'nick_room'),
        ],
      },
      the_womping_willow: {
        name: 'The Womping Willow',
        room: 'stromme_room',
        waypoints: [
          this.newStandingStillWaypoint([300, 300], 2*1000, 'stromme_room'),
        ],
      },
      dumbledore: {
        name: 'Dumbledore',
        room: 'patio',
        waypoints: [
          this.newStandingStillWaypoint([50, 50], 2*1000, 'patio'),
        ],
      },

      tal: {
        name: 'Tal',
        room: 'patio',
        waypoints: [
          this.newStandingStillWaypoint([50, 50], 2*1000, 'patio'),
        ],
      },
    }

    let randomRoomChange = () => {
      let peopleKeys = Object.keys(this.people);
      let randomPerson = peopleKeys[Math.floor(Math.random() * peopleKeys.length)];
      let newRoomOptions = Object.keys(rooms[this.people[randomPerson].room].doors);
      let newRoom = newRoomOptions[Math.floor(Math.random() * newRoomOptions.length)];

      this.changeRoom(randomPerson, newRoom);
      setTimeout(randomRoomChange, 10*1000);
    };

    setTimeout(randomRoomChange, 2000);

    this.canvas = React.createRef();
    this.image = React.createRef();
  }

  handleOnLoadImage = (e) => {
    this.draw()
  }

  newRandomLocationWaypoint = (startingLocation, roomId) => {
    let endingX = Math.random() * (rooms[roomId].width - 30) + 15;
    let endingY = Math.random() * (rooms[roomId].height - 30) + 15;

    let distance = Math.sqrt(Math.pow(startingLocation[0]-endingX, 2) +
                             Math.pow(startingLocation[1]-endingY, 2));

    let maxSpeed = 560 / 10; // cross the living room in 10 seconds
    let minSpeed = 560 / 30; // cross the living room in 20 seconds

    let speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
    let duration = distance / speed;
    console.log(`speed: ${speed}, distance: ${distance}, duration: ${duration}`)


    // convert from seconds to ms
    duration *= 1000;

    return this.newWaypointToLocation(
      startingLocation,
      [endingX, endingY],
      duration,
      roomId
    )
  }

  newWaypointToLocation(startingLocation, endingLocation, duration, room) {
    return {
      startingLocation: startingLocation,
      endingLocation: endingLocation,
      duration: duration,
      startedAt: undefined,
      room: room,
    }
  }

  newStandingStillWaypoint(location, duration, room) {
    return {
      startingLocation: location,
      endingLocation: location,
      duration: duration,
      startedAt: undefined,
      room: room,
    }
  }

  nextWaypoint = (startingLocation, room) => {
    let choice = Math.floor(Math.random() * 10);

    if (choice < 4) {
      return this.newStandingStillWaypoint(startingLocation, 1000*(5*Math.random()+2), room);
    } else {
      return this.newRandomLocationWaypoint(startingLocation, room);
    }
  }

  getDuration = (location1, location2, speed) => {
    let distance = Math.sqrt(Math.pow(location1[0]-location2[0], 2) +
                             Math.pow(location1[1]-location2[0], 2));

    return distance / speed;
  }

  changeRoom = (person, newRoom) => {
    console.log(`changeRoom: moving ${person} to ${newRoom}`);
    let doorLocation = rooms[this.people[person].room].doors[newRoom];

    let speed = 560 / 10; // cross the living room in 10 seconds

    let startingLocation = this.people[person].waypoints[this.people[person].waypoints.length-1].endingLocation;

    let duration = 1000 * this.getDuration(startingLocation, doorLocation, speed);

    this.people[person].waypoints.push(
      this.newWaypointToLocation(
        startingLocation,
        doorLocation,
        duration,
        this.people[person].room
      )
    )

    let otherSideDoorLocation = rooms[newRoom].doors[this.people[person].room];
    if (otherSideDoorLocation === undefined) {
      throw new Error(`room ${newRoom} does not have a door to ${this.people[person].room}`)
    }

    this.people[person].waypoints.push(
      this.newRandomLocationWaypoint(
        otherSideDoorLocation,
        newRoom
      )
    )

    this.people[person].room = newRoom;
  }

  updateWaypoints = person => {
    let personState = this.people[person];
    if (personState.waypoints.length === 0) {
      console.error(`Person ${person} has no waypoints`);
      return;
    }

    // case: we are at the start, and need to kick things off
    if (personState.waypoints[0].startedAt === undefined) {
      personState.waypoints[0].startedAt = new Date();
    } else { // case: we are ongoing
      let elapsed = new Date() - personState.waypoints[0].startedAt;
      while (elapsed > personState.waypoints[0].duration) {

        // if there are future waypoints, we move on to those
        if (personState.waypoints.length > 1) {
          personState.waypoints[1].startedAt =
            new Date(personState.waypoints[0].startedAt.getTime() + personState.waypoints[0].duration);

          elapsed -= personState.waypoints[0].duration;
          personState.waypoints.shift();
          console.log('moving to waypoint', personState.waypoints[0]);
        } else { // otherwise we randomly create them
          let newWaypoint = this.nextWaypoint(personState.waypoints[0].endingLocation, personState.room);
          personState.waypoints.push(newWaypoint);
          console.log('added waypoint', newWaypoint);
        }
      }
    }

    return this.people[person].waypoints[0];
  }

  wandTapped = (room, person) => {
    console.log('wandTapped', room, person);

    if (!person) {
      return;
    }

    this.people[person].showName = true;

    setTimeout(() => {
      this.people[person].showName = false;
    }, 5*1000);
  }

  draw = () => {
    // console.log(this.canvas, this.image)

    let context = this.canvas.current.getContext("2d")
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.drawImage(this.image.current, 0, 0);
    context.font = "40px Courier";
    context.fillText("Make Your Mischief", 210, 75);

    Object.keys(this.people).map(person => {
      let currentWaypoint = this.updateWaypoints(person);
      let startingLocation = currentWaypoint.startingLocation;
      let endingLocation = currentWaypoint.endingLocation;
      let duration = currentWaypoint.duration;
      let currentTime = new Date();
      let elapsed = currentTime - currentWaypoint.startedAt;
      let X = 0;
      let Y = 1;
      let centerOfMassLocation = this.easeLocation(elapsed,
        startingLocation,
        endingLocation,
        duration);

      let roomDetails = rooms[currentWaypoint.room];

      context.save()
      context.translate(roomDetails.topLeft.x, roomDetails.topLeft.y);
      this.drawPerson(context, centerOfMassLocation);
      if (this.people[person].showName === true) {
        context.fillText(this.people[person].name, centerOfMassLocation[X] + 10, centerOfMassLocation[X] + 35);
      }

      // Draw steps from startingLocation to centerOfMassLocation.

      // Length of a single step in pixels.
      let stepDistance = 50;
      // Time it takes for a step to fade in milliseconds.
      let stepTime = 5000;
      // Distance traveled since the starting location.
      let centerOfMassDistance = this.vectorDistance(startingLocation, centerOfMassLocation);
      // Number of steps since the starting location
      let stepCount = Math.floor(centerOfMassDistance / stepDistance);
      // Length and direction of a single step.
      let unitStepVector = this.scaleVector(
        this.normalizeVector([endingLocation[X] - startingLocation[X], endingLocation[Y] - startingLocation[Y]]),
        stepDistance
      );
      // For each step since the starting location, draw it.
      for (let step = 0; step <= stepCount; step++) {
        let stepVector = this.addVector(
          startingLocation,
          this.scaleVector(unitStepVector, step)
        );
        // Average speed that the person is traveling, pixels / millisecond.
        let speed = this.vectorDistance(startingLocation, endingLocation) / duration;
        // Distance of person from this old step, pixels.
        let distanceFromStep = this.vectorDistance(stepVector, centerOfMassLocation);
        // Approximate time elapsed since this step happened, milliseconds.
        let timeSinceStep = distanceFromStep / speed;
        // Opacity is 1.0 if no time has passed fades to 0.0 if stepTime has passed.
        let opacity = Math.max(0, stepTime - timeSinceStep) / stepTime; // 0-1.0
        this.drawFoot(context, stepVector, step, unitStepVector, opacity);
      }
      context.restore()
    })

    requestAnimationFrame(this.draw);
  }

  /**
   * Draw a person at coordinate X and Y.
   */
  drawPerson = (context, centerOfMassLocation) => {
    let X = 0;
    let Y = 1;
    let personX = centerOfMassLocation[X];
    let personY = centerOfMassLocation[Y];
    context.beginPath();
    context.arc(personX, personY, 10, 0, 2*Math.PI, true);
    context.fill();
  }

  /**
   * Draw a foot near stepX, stepY.
   * If step is even, step to the right.
   * unitStepVector is the length and direction of a single step.
   * Opacity allows the step to fade.
   */
  drawFoot = (context, stepVector, step, unitStepVector, opacity) => {
    let X = 0;
    let Y = 1;
    let leftOrthoVector = [unitStepVector[Y], -unitStepVector[X]];
    let rightOrthoVector = this.scaleVector(leftOrthoVector, -1);
    let sideVector = leftOrthoVector;
    if (step % 2 == 0) {
      sideVector = rightOrthoVector;
    }
    sideVector = this.scaleVector(sideVector, 0.25); // Move footprint to the side 1/4 of a step.
    context.beginPath();
    context.fillStyle = "rgba(0, 0, 0, " + opacity + ")";
    context.arc(stepVector[X] + sideVector[X], stepVector[Y] + sideVector[Y], 10, 0, 2*Math.PI, true);
    context.fill();
  }

  /**
   * Compute the location [x, y] based on a start, end, and easing function.
   */
  easeLocation = (elapsed, startingLocation, endingLocation, duration) => {
    let loc = [];
    for (let index = 0; index < startingLocation.length; index++) {
      loc.push(easeInOutQuad(
        elapsed,
        startingLocation[index],
        endingLocation[index] - startingLocation[index],
        duration));
    }
    return loc;
  }

  /**
   * Compute the distance between two points.
   */
  vectorDistance = (a, b) => {
    let X = 0;
    let Y = 1;
    return Math.hypot(
      b[X] - a[X],
      b[Y] - a[Y]
    );
  }

  /**
   * Return a new vector of length 1.
   */
  normalizeVector = (vector) => {
    let X = 0;
    let Y = 1;
    let vectorSize = Math.hypot(vector[X], vector[Y]);
    return [
      vector[X] / vectorSize,
      vector[Y] / vectorSize
    ];
  }

  /**
   * Return a new vector scaled by a factor.
   */
  scaleVector = (vector, factor) => {
    let X = 0;
    let Y = 1;
    return [
      vector[X] * factor,
      vector[Y] * factor
    ];
  }

  /**
   * Return a new vector that is the sum of the input vectors.
   */
  addVector = (a, b) => {
    let X = 0;
    let Y = 1;
    return [
      a[X] + b[X],
      a[Y] + b[Y]
    ];
  }

  /*

  algorithm for animating inside a room

  1. set waypoints
  2. animate to those waypoints

  */

  render() {
    return(
      <div>
        <canvas ref={this.canvas} style={{width: 640, height: 360}} width={2560} height={1440} />
        <img onLoad={this.handleOnLoadImage} ref={this.image} src={process.env.PUBLIC_URL + '/129OctaviaTopDownView.png'} className="hidden" />
      </div>
    )
  }
}

export default Canvas
