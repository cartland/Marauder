import React, {Component} from 'react';
import { easeInOutQuad } from 'js-easing-functions';

import * as firebase from "firebase/app";
import "firebase/firestore";

import FootstepLeft from './assets/footstep-left.svg';
import FootstepRight from './assets/footstep-right.svg';
import { V } from './Vector2.js';

import getViewport from './getViewport.js';

let footstepLeftImg = new Image();
footstepLeftImg.src = FootstepLeft;

let footstepRightImg = new Image();
footstepRightImg.src = FootstepRight;


/* global window */
window.easeInOutQuad = easeInOutQuad

// Length of a single step in pixels.
const STEP_DISTANCE = 50;
// Left and right feet are offset by a factor of the STEP_DISTANCE.
const STEP_WIDTH_FACTOR = 0.25;
// Time it takes for a step to fade in milliseconds.
const STEP_FADE_DURATION = 7 * 1000; // 7 seconds.
// Time it takes for the name to disappear after wand tap.
const SHOW_NAME_DURATION_S = 30; // Time in seconds
// Person ID to trigger a web page reset.
const RESET_LOGICAL_ID = 'reset';

let rooms = {
  alberto_room: {
    topLeft: V(
      201,
      439,
    ),
    height: 285,
    width: 285,
    spawnLocation: V(150, 50),
    name: 'Alberto\'s Room',
    doors: {
      kitchen: V(285, 62),
    },
  },
  kitchen: {
    topLeft: V(
      486,
      439,
    ),
    height: 563,
    width: 386,
    spawnLocation: V(190, 50),
    name: 'Kitchen',
    doors: {
      living_room: V(386, 480),
      alberto_room: V(0, 62),
      patio: V(327, 563),
    },
  },
  living_room: {
    topLeft: V(
      872,
      439,
    ),
    height: 563,
    width: 420,
    spawnLocation: V(210, 50),
    name: 'Living Room',
    doors: {
      kitchen: V(0, 480),
      hallway: V(420, 62),
    },
  },
  hallway: {
    topLeft: V(
      1292,
      439,
    ),
    height: 172,
    width: 992,
    spawnLocation: V(200, 50),
    name: 'Hallway',
    doors: {
      living_room: V(0, 62),
      cartland_room: V(442, 172),
      nick_room: V(726, 172),
      stromme_room: V(838, 172),
    },
  },
  cartland_room: {
    topLeft: V(
      1504,
      611,
    ),
    height: 495,
    width: 285,
    spawnLocation: V(150, 50),
    name: 'Cartland\'s Room',
    doors: {
      hallway: V(230, 0),
    },
  },

  nick_room: {
    topLeft: V(
      1789,
      611,
    ),
    height: 495,
    width: 285,
    spawnLocation: V(150, 50),
    name: 'Nick\'s Room',
    doors: {
      hallway: V(229, 0),
    },
  },

  stromme_room: {
    topLeft: V(
      2074,
      611,
    ),
    height: 391,
    width: 374,
    spawnLocation: V(190, 50),
    name: 'Stromme\'s Room',
    doors: {
      hallway: V(56, 0),
    },
  },

  patio: {
    topLeft: V(
      487,
      1002,
    ),
    height: 104,
    width: 1018,
    spawnLocation: V(500, 50),
    name: 'Patio',
    doors: {
      kitchen: V(327, 0),
    },
  },
}

class Footstep {

  constructor(location, direction, stepNumber, stepBeginTime) {
    this.location = location;
    this.direction = direction;
    this.stepNumber = stepNumber;
    this.stepBeginTime = stepBeginTime;
  }

  key() {
    return this.location.x.toPrecision(5) + ","
      + this.location.y.toPrecision(5) + ","
      + this.direction.x.toPrecision(5) + ","
      + this.direction.y.toPrecision(5);
  }
}

class Canvas extends React.Component {
  state = {
    // not 4k, but is the same size as the base image
    mapWidth: 2560,
    mapHeight: 1440,
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

          // Check to see if this is a reset request.
          if (person == RESET_LOGICAL_ID) {
            window.location.reload();
            return;
          }
          this.wandTapped(room, person);
        }
      });
    });

    this.footsteps = {};

    this.people = {
      stromme: {
        name: 'Stromme',
        room: 'stromme_room',
        waypoints: [
          this.newStandingStillWaypoint(V(300, 300), 2*1000, 'stromme_room'),
        ],
      },
      alberto: {
        name: 'Alberto',
        room: 'alberto_room',
        waypoints: [
          this.newStandingStillWaypoint(V(0, 0), 2*1000, 'alberto_room'),
        ],
      },
      cartland: {
        name: 'Cartland',
        room: 'cartland_room',
        waypoints: [
          this.newStandingStillWaypoint(V(0, 0), 2*1000, 'cartland_room'),
        ],
      },
      nick: {
        name: 'Nick',
        room: 'nick_room',
        waypoints: [
          this.newStandingStillWaypoint(V(0, 0), 2*1000, 'nick_room'),
        ],
      },
      the_womping_willow: {
        name: 'The Womping Willow',
        room: 'stromme_room',
        waypoints: [
          this.newStandingStillWaypoint(V(300, 300), 2*1000, 'stromme_room'),
        ],
      },
      dumbledore: {
        name: 'Dumbledore',
        room: 'patio',
        waypoints: [
          this.newStandingStillWaypoint(V(50, 50), 2*1000, 'patio'),
        ],
      },

      tal: {
        name: 'Tal',
        room: 'patio',
        waypoints: [
          this.newStandingStillWaypoint(V(50, 50), 2*1000, 'patio'),
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

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions = () => {
    let viewport = getViewport();
    let aspectRatio = viewport.width / viewport.height;
    let mapAspectRatio = this.state.mapWidth / this.state.mapHeight;

    var fullScreenStyle;
    if (aspectRatio <= mapAspectRatio) {
      this.setState({
        fullScreenStyle: {
          height: '100vh',
          width: `${100*mapAspectRatio}vh`,
        },
      })
    } else {
      this.setState({
        fullScreenStyle: {
          height: `${100/mapAspectRatio}vw`,
          width: '100vw',
        },
      })
    }

    setTimeout(() => {
      window.scrollTo(viewport.width/2, viewport.height/2);
    }, 500);
  }

  handleOnLoadImage = (e) => {
    this.draw()
  }

  newRandomLocationWaypoint = (startingLocation, roomId) => {
    let endingX = Math.random() * (rooms[roomId].width - 30) + 15;
    let endingY = Math.random() * (rooms[roomId].height - 30) + 15;

    let ending = V(endingX, endingY);
    let distance = ending.sub(startingLocation).size();
    // let distance = Math.sqrt(Math.pow(startingLocation[0]-endingX, 2) +
    //                          Math.pow(startingLocation[1]-endingY, 2));

    let maxSpeed = 560 / 10; // cross the living room in 10 seconds
    let minSpeed = 560 / 30; // cross the living room in 20 seconds

    let speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
    let duration = distance / speed;
    console.log(`speed: ${speed}, distance: ${distance}, duration: ${duration}`)


    // convert from seconds to ms
    duration *= 1000;

    return this.newWaypointToLocation(
      startingLocation,
      ending,
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
    let distance = location2.sub(location1).size();
    // let distance = Math.sqrt(Math.pow(location1[0]-location2[0], 2) +
    //                          Math.pow(location1[1]-location2[0], 2));
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

    let personObject = this.people[person];
    if (!personObject) {
      return;
    }
    personObject.showName = true;
    let hideTime = new Date();
    hideTime.setSeconds(hideTime.getSeconds() + SHOW_NAME_DURATION_S);
    personObject.hideNameTime = hideTime;

    let currentRoom = personObject.waypoints[0].room;
    if (personObject.waypoints[0].room != room) {
      console.log(person + " needs to move from " + currentRoom + " to " + room);
      this.movePersonToRoom(personObject, room);
    }

    this.hideNameOrReschedule(person);
  }

  /**
   * Hide the person name if the time has passed.
   * If not, then schedule a timeout to try again with the new time.
   */
  hideNameOrReschedule(person) {
    let now = new Date();
    let hideTime = this.people[person].hideNameTime;
    if (now > hideTime) {
      this.people[person].showName = false;
    } else {
      let delayMs = hideTime.getTime() - now.getTime();
      setTimeout(() => {
        this.hideNameOrReschedule(person);
      }, delayMs);
    }
  }

  movePersonToRoom(person, room) {
    if (room in rooms && "width" in rooms[room]) {
      let roomSpawnLocation = rooms[room].spawnLocation;
      person.waypoints = [
        this.newRandomLocationWaypoint(roomSpawnLocation, room)
      ];
      person.room = room;
    }
  }

  draw = () => {
    let context = this.canvas.current.getContext("2d")
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.drawImage(this.image.current, 0, 0);
    context.font = "40px Roboto";

    Object.keys(this.people).map(person => {
      let currentWaypoint = this.updateWaypoints(person);
      let startingLocation = currentWaypoint.startingLocation;
      let endingLocation = currentWaypoint.endingLocation;
      let duration = currentWaypoint.duration;
      let currentTime = new Date();
      let elapsed = currentTime - currentWaypoint.startedAt;
      let centerOfMassLocation = V(
        easeInOutQuad(
          elapsed,
          startingLocation.x,
          endingLocation.x - startingLocation.x,
          duration
        ),
        easeInOutQuad(
          elapsed,
          startingLocation.y,
          endingLocation.y - startingLocation.y,
          duration
        )
      );

      let roomDetails = rooms[currentWaypoint.room];

      context.save()
      context.translate(roomDetails.topLeft.x, roomDetails.topLeft.y);
      this.drawPerson(context, centerOfMassLocation);
      this.drawPerson(context, startingLocation);
      this.drawPerson(context, endingLocation);
      if (this.people[person].showName === true) {
        context.fillText(this.people[person].name, centerOfMassLocation.x + 10, centerOfMassLocation.y + 35);
      }
      this.createFootsteps(context, centerOfMassLocation, startingLocation, endingLocation, roomDetails, currentTime);
      context.restore()
    })

    context.save();
    this.drawFootsteps(context);
    context.restore();

    requestAnimationFrame(this.draw);
  }

  /**
   * Draw a person at coordinate X and Y.
   */
  drawPerson = (context, centerOfMassLocation) => {
    // DO NOTHING. PERSON IS INVISIBLE.
  }

  createFootsteps(context, centerOfMassLocation, startingLocation, endingLocation, roomDetails, currentTime) {
    // Direction of a single step.
    let footstepDirection = endingLocation.sub(startingLocation).normalize();
    if (footstepDirection == null) {
      // Do not create footsteps when standing still.
      return;
    }
    // Distance traveled since the starting location.
    let centerOfMassDistance = centerOfMassLocation.sub(startingLocation).size();
    let scaledStepVector = footstepDirection.scale(STEP_DISTANCE);

    // Number of steps since the starting location.
    let stepCount = Math.floor(centerOfMassDistance / STEP_DISTANCE);
    // For each step since the starting location, draw it.
    for (let stepNumber = 0; stepNumber <= stepCount; stepNumber++) {
      let stepLocation = startingLocation.add(scaledStepVector.scale(stepNumber));
      let stepBeginTime = currentTime;

      // Global coordinates.
      let globalStepLocation = stepLocation.add(V(roomDetails.topLeft.x, roomDetails.topLeft.y));

      let leftFootstepLocation = globalStepLocation.add(scaledStepVector.orthogonalLeft().scale(STEP_WIDTH_FACTOR));
      let rightFootstepLocation = globalStepLocation.add(scaledStepVector.orthogonalRight().scale(STEP_WIDTH_FACTOR));

      if (stepNumber % 2 == 0) {
        this.createFootstep(rightFootstepLocation, footstepDirection, stepNumber, stepBeginTime);
      }
      if (stepNumber % 2 == 1) {
        this.createFootstep(leftFootstepLocation, footstepDirection, stepNumber, stepBeginTime);
      }
    }
  }

  createFootstep(footstepLocation, footstepDirection, stepNumber, stepBeginTime) {
    let footstep = new Footstep(footstepLocation, footstepDirection, stepNumber, stepBeginTime);
    let key = footstep.key();
    if (this.containsFootstep(key)) {
      // Do nothing.
    } else {
      this.addFootstepToMap(key, footstep);
    }
  }

   containsFootstep(key) {
    return key in this.footsteps;
  }

  addFootstepToMap(key, footstep) {
    this.footsteps[key] = footstep;
  }

  deleteFootstep(key) {
    delete this.footsteps[key];
  }

  drawFootsteps(context) {
    let currentTime = new Date();
    for (const [key, footstep] of Object.entries(this.footsteps)) {
      // Opacity is 1.0 if no time has passed fades to 0.0 if STEP_FADE_DURATION has passed.
      let timeSinceStep = currentTime - footstep.stepBeginTime;
      let opacity = Math.max(0, STEP_FADE_DURATION - timeSinceStep) / STEP_FADE_DURATION; // 0-1.0
      if (opacity <= 0) {
        this.deleteFootstep(key);
      }
      this.drawFoot(context, footstep, opacity);
    }
  }

  /**
   * Draw a foot near stepX, stepY.
   * footstepDirection is the direction of a single step.
   * Opacity allows the step to fade.
   */
  drawFoot = (context, footstep, opacity) => {
    let img = footstepLeftImg
    if (footstep.stepNumber % 2 == 0) {
      img = footstepRightImg;
    }
    let stepLocation = footstep.location;
    let footstepDirection = footstep.direction;
    context.save()
    context.translate(stepLocation.x, stepLocation.y);
    context.rotate(Math.atan2(footstepDirection.y, footstepDirection.x) + 90 * Math.PI / 180)
    context.globalAlpha = opacity;
    context.drawImage(img, 0, 0, 12, 12 * img.height / img.width);
    context.restore()
  }

  /*

  algorithm for animating inside a room

  1. set waypoints
  2. animate to those waypoints

  */

  render() {
    return(
      <div style={this.state.fullScreenStyle}>
        <canvas ref={this.canvas} style={this.state.fullScreenStyle} width={this.state.mapWidth} height={this.state.mapHeight} />
        <img onLoad={this.handleOnLoadImage} ref={this.image} src={process.env.PUBLIC_URL + '/129OctaviaTopDownView.png'} className="hidden" />
      </div>
    )
  }
}

export default Canvas
