import React, {Component} from 'react';
import { easeInOutQuad } from 'js-easing-functions';

import * as firebase from "firebase/app";
import "firebase/firestore";

import FootstepLeft from './assets/footstep-left.svg';
import FootstepRight from './assets/footstep-right.svg';
import { V } from './Vector2.js';
import { generateRooms } from './Room.js';
import { generatePeople} from './People.js';
import { Random } from './Random.js';
import { Path } from './Path.js';

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
const UPDATE_LOGIC_INTERVAL_MS = 10;

let rooms = generateRooms();

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

class Canvas extends React.Component { state = {
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
          let timestamp = change.doc.get('timestamp');

          // Check to see if this is a reset request.
          if (person == RESET_LOGICAL_ID) {
            window.location.reload();
            return;
          }
          this.wandTapped(room, person, timestamp);
        }
      });
    });

    this.footsteps = {};

    this.people = generatePeople();

    this.generatePaths(this.people);

    this.canvas = React.createRef();
    this.image = React.createRef();
    this.lastLogicUpdateTime = 0;
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  generatePaths(people) {
    let prng = new Random();
    let peopleKeys = Object.keys(people);

    // for (let personIndex = 0; personIndex < peopleKeys.size; personIndex++) {
    //   let personKey = peopleKeys[personIndex];
    //   let personObject = people[personKey];
    //   let personKeyRoom = 'patio';

    //   let newRoomOptions = Object.keys(personKeyRoom.doors);
    //   let randomRoomFloat = prng.nextFloat();
    //   let newRoom = newRoomOptions[Math.floor(randomRoomFloat * newRoomOptions.length)];
    //   this.addRoomChange(personKey, newRoom, prng);
    // }
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

  generateRandomPaths(startingLocation, room, prng) {
    let randomChoice = prng.nextFloat();
    let randomDuration = 1000 * (5 * prng.nextFloat() + 2);

    if (randomChoice < 0.4) { // Stand still.
      return [new Path(room, startingLocation, startingLocation, randomDuration, undefined)];
    } else if (randomChoice < 0.9) { // Move inside room.
      if (typeof room == "undefined") {
        room = 'living_room';
      }
      return [this.generateRandomPathInRoom(room, startingLocation, prng)];
    } else {
      // TODO: Change room.
      return [this.generateRandomPathInRoom(room, startingLocation, prng)];
    }
  }

  generateRandomPathInRoom(room, startingLocation, prng) {
    console.log(room);
    let randomX = prng.nextFloat();
    let randomY = prng.nextFloat();
    let randomSpeed = prng.nextFloat();

    let endingX = randomX * (rooms[room].width - 30) + 15;
    let endingY = randomY * (rooms[room].height - 30) + 15;

    let endingLocation = V(endingX, endingY);
    let distance = endingLocation.sub(startingLocation).size();

    let maxSpeed = 560 / 10; // cross the living room in 10 seconds
    let minSpeed = 560 / 30; // cross the living room in 20 seconds

    let speed = randomSpeed * (maxSpeed - minSpeed) + minSpeed;
    let duration = distance / speed;
    duration *= 1000;
    return new Path(room, startingLocation, endingLocation, duration, undefined);
  }

  getDuration = (location1, location2, speed) => {
    let distance = location2.sub(location1).size();
    // let distance = Math.sqrt(Math.pow(location1[0]-location2[0], 2) +
    //                          Math.pow(location1[1]-location2[0], 2));
    return distance / speed;
  }

  addRoomChange = (person, newRoom, prng) => {
    console.log(`addRoomChange: moving ${person} to ${newRoom}`);
    let doorLocation = rooms[this.people[person].room].doors[newRoom];

    let speed = 560 / 10; // cross the living room in 10 seconds

    let startingLocation = this.people[person].lastPath().endingLocation;

    let duration = 1000 * this.getDuration(startingLocation, doorLocation, speed);

    let room = this.people[person].room

    this.people[person].addPaths([
      new Path(room, startingLocation, doorLocation, duration, undefined)
    ]);

    let otherSideDoorLocation = rooms[newRoom].doors[this.people[person].room];
    if (otherSideDoorLocation === undefined) {
      throw new Error(`room ${newRoom} does not have a door to ${this.people[person].room}`)
    }

    this.people[person].addPaths([
      this.generateRandomPathInRoom(
        newRoom,
        otherSideDoorLocation,
        prng
      )
    ]);

    this.people[person].room = newRoom;
  }

  getWaypoint(person) {
    return this.people[person].firstPath();
  }

  updateWaypoints(person, currentTime, prng) {
    let personState = this.people[person];
    if (personState.firstPath() == null) {
      console.error(`Person ${person} has no paths`);
      let location = V(50, 50);
      let duration = 2*1000;
      personState.addPaths([
        new Path(personState.firstRoom, location, location, duration, undefined)
      ]);
    }

    // case: we are at the start, and need to kick things off
    if (personState.firstPath().startedAt === undefined) {
      personState.setStartTime(currentTime);
    }
    let elapsed = currentTime - personState.firstPath().startedAt;
    while (elapsed > personState.firstPath().duration) {
      let poppedPath = personState.popPath();
      elapsed -= poppedPath.duration;
      if (personState.firstPath() == null) {
        let paths = this.generateRandomPaths(poppedPath.endingLocation, poppedPath.room, prng);
        personState.addPaths(paths);
      }
    }
  }

  wandTapped = (room, person, timestamp) => {
    console.log('wandTapped', room, person, timestamp);
    let prng = new Random(timestamp.seconds);

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

    let currentRoom = personObject.firstPath().room;
    if (personObject.firstPath().room != room) {
      console.log(person + " needs to move from " + currentRoom + " to " + room);
      this.movePersonToRoom(personObject, room, prng);
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

  movePersonToRoom(person, room, prng) {
    if (room in rooms && "width" in rooms[room]) {
      let roomSpawnLocation = rooms[room].spawnLocation;
      person.setPaths([
        this.generateRandomPathInRoom(room, roomSpawnLocation, prng)
      ]);
      person.room = room;
    }
  }

  draw = () => {
    let currentTime = new Date();
    let context = this.canvas.current.getContext("2d")
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.drawImage(this.image.current, 0, 0);
    context.font = "60px Roboto";
    Object.keys(this.people).map(person => {
      this.drawPerson(person, context, currentTime);
    })

    if (currentTime.getTime() - this.lastLogicUpdateTime > UPDATE_LOGIC_INTERVAL_MS) {
      Object.keys(this.people).map(person => {
        let currentWaypoint = this.updateWaypoints(person, currentTime, new Random());
      })
    }

    context.save();
    this.drawFootsteps(context);
    context.restore();

    this.lastLogicUpdateTime = currentTime.getTime();
    requestAnimationFrame(this.draw);
  }

  drawPerson(person, context, currentTime) {
    let currentWaypoint = this.getWaypoint(person);
    if (!currentWaypoint) {
      return;
    }
    let startingLocation = currentWaypoint.startingLocation;
    let endingLocation = currentWaypoint.endingLocation;
    let duration = currentWaypoint.duration;
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
    if (this.people[person].showName === true) {
      context.fillText(this.people[person].name, centerOfMassLocation.x + 10, centerOfMassLocation.y + 35);
    }
    this.createFootsteps(context, centerOfMassLocation, startingLocation, endingLocation, roomDetails, currentTime);
    context.restore();
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

  1. set paths
  2. animate to those paths

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
