import React, { Component } from 'react';
import { easeInOutQuad } from 'js-easing-functions';

import * as firebase from "firebase/app";
import "firebase/firestore";

import FootstepLeft from './assets/footstep-left.svg';
import FootstepRight from './assets/footstep-right.svg';
import { V } from './model/Vector2.js';
import { generateRooms } from './config/Rooms.js';
import { generatePeople } from './config/People.js';
import { Footstep } from './model/Footstep.js';
import { Random } from './util/Random.js';
import { Path } from './model/Path.js';

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
// Time to stand still after tapping wand.
const STAND_STILL_DURATION_S = 10;
// Time it takes for the name to disappear after wand tap.
const SHOW_NAME_DURATION_S = 40; // Time in seconds
// Person ID to trigger a web page reset.
const RESET_LOGICAL_ID = 'reset';
// Time between logic updates.
const UPDATE_LOGIC_INTERVAL_MS = 5;
// Number of paths to generate per person during initialization.
const INITIAL_PATH_COUNT = 1000;

let rooms = generateRooms();

class Canvas extends Component {
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
            let timestamp = change.doc.get('timestamp');

            // Check to see if this is a reset request.
            if (person === RESET_LOGICAL_ID) {
              window.location.reload();
              return;
            }
            this.wandTapped(room, person, timestamp);
          }
        });
      });

    let yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    let that = this;
    firebase.firestore().collection('nfcUpdates')
      .where('timestamp', '>', yesterday)
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            let person = change.doc.get('nfcData').nfcLogicalId;
            let timestamp = change.doc.get('timestamp');

            // // Check to see if this is a reset request.
            if (person === RESET_LOGICAL_ID) {
              let seconds = timestamp.seconds;
              if (seconds > that.resetTimestamp) {
                console.log('Initialize with seed.', seconds);
                that.resetTimestamp = seconds;
                that.initializePaths(that.people, new Random(timestamp.seconds));
              } else {
                console.log('Ignoring old reset.', seconds);
              }
              return;
            }
          }
        });
      });

    this.footsteps = {};

    this.people = generatePeople();

    this.initializePaths(this.people);
    this.resetTimestamp = 0;

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

  initializePaths(people, prng) {
    if (!prng) {
      console.log('Initializing paths without PRNG, using reset timestamp', this.resetTimestamp);
      prng = new Random(this.resetTimestamp);
    }
    let peopleKeys = Object.keys(people);

    let dateFromTimestamp = null;
    if (this.resetTimestamp) {
      let milliseconds = this.resetTimestamp * 1000;
      dateFromTimestamp = new Date(milliseconds);
      console.log('Initializing start time', dateFromTimestamp);
    }

    for (let personIndex = 0; personIndex < peopleKeys.length; personIndex++) {
      let personKey = peopleKeys[personIndex];
      let personObject = people[personKey];
      personObject.prng = prng;

      personObject.setPaths([]);
      this.generatePathsForPerson(personObject, INITIAL_PATH_COUNT, prng);
      if (dateFromTimestamp) {
        personObject.setStartTime(dateFromTimestamp);
      }
    }
  }

  generatePathsForPerson(personObject, count, prng) {
    for (let round = 0; round < count; round++) {
      let lastPath = personObject.lastPath();
      let startingLocation = null;
      let room = personObject.firstRoom;
      if (lastPath) {
        startingLocation = lastPath.endingLocation;
        room = lastPath.room;
      }
      let paths = this.generateRandomPaths(startingLocation, room, prng);
      personObject.addPaths(paths);
    }
  }

  updateDimensions = () => {
    let viewport = getViewport();
    let aspectRatio = viewport.width / viewport.height;
    let mapAspectRatio = this.state.mapWidth / this.state.mapHeight;

    if (aspectRatio <= mapAspectRatio) {
      this.setState({
        fullScreenStyle: {
          height: '100vh',
          width: `${100 * mapAspectRatio}vh`,
        },
      })
    } else {
      this.setState({
        fullScreenStyle: {
          height: `${100 / mapAspectRatio}vw`,
          width: '100vw',
        },
      })
    }

    setTimeout(() => {
      window.scrollTo(viewport.width / 2, viewport.height / 2);
    }, 500);
  }

  handleOnLoadImage = (e) => {
    this.draw()
  }

  generateRandomPaths(startingLocation, room, prng) {
    let randomChoice = prng.nextFloat();
    let randomDurationMs = 1000 * (2 * prng.nextFloat() + 1);

    if (!startingLocation) {
      let range = V(rooms[room].width, rooms[room].height);
      let buffer = 30;
      startingLocation = this.randomLocation(range, buffer, prng);
    }

    if (randomChoice < 0.1) { // Stand still.
      return [new Path(room, startingLocation, startingLocation, randomDurationMs, undefined)];
    } else if (randomChoice < 0.8) { // Move inside room.
      if (typeof room == "undefined") {
        room = 'living_room';
      }
      return [this.generateRandomPathInRoom(room, startingLocation, prng)];
    } else {
      return this.generateRandomRoomChange(room, startingLocation, prng);
    }
  }

  generateRandomPathInRoom(room, startingLocation, prng) {
    let randomSpeed = prng.nextFloat();

    let range = V(rooms[room].width, rooms[room].height);
    let buffer = 15;
    let endingLocation = this.randomLocation(range, buffer, prng);

    let distance = endingLocation.sub(startingLocation).size();

    let maxSpeed = 560 / 10; // cross the living room in 10 seconds
    let minSpeed = 560 / 30; // cross the living room in 20 seconds

    let speed = randomSpeed * (maxSpeed - minSpeed) + minSpeed;
    let duration = distance / speed;
    duration *= 1000;
    return new Path(room, startingLocation, endingLocation, duration, undefined);
  }

  randomLocation(range, buffer, prng) {
    let randomX = prng.nextFloat();
    let randomY = prng.nextFloat();
    let endingX = randomX * (range.x - (buffer * 2)) + buffer;
    let endingY = randomY * (range.y - (buffer * 2)) + buffer;
    return V(endingX, endingY);
  }

  generateRandomRoomChange(room, startingLocation, prng) {
    let doorOptions = Object.keys(rooms[room].doors);
    let randomDoorFloat = prng.nextFloat();
    let newDoorIndex = Math.floor(randomDoorFloat * doorOptions.length);
    let newRoom = doorOptions[newDoorIndex];
    let doorLocation = rooms[room].doors[newRoom];

    let speed = 560 / 10; // cross the living room in 10 seconds
    let duration = 1000 * this.getDuration(startingLocation, doorLocation, speed);

    // First path to door.
    let pathToDoor = new Path(room, startingLocation, doorLocation, duration, undefined);

    let otherSideDoorLocation = rooms[newRoom].doors[room];
    if (otherSideDoorLocation === undefined) {
      throw new Error(`room ${newRoom} does not have a door to ${room}`)
    }

    // Second path from door in new room.
    let pathFromDoor = this.generateRandomPathInRoom(
      newRoom,
      otherSideDoorLocation,
      prng
    );
    return [pathToDoor, pathFromDoor];
  }

  getDuration = (location1, location2, speed) => {
    let distance = location2.sub(location1).size();
    // let distance = Math.sqrt(Math.pow(location1[0]-location2[0], 2) +
    //                          Math.pow(location1[1]-location2[0], 2));
    return distance / speed;
  }

  addRoomChange = (person, newRoom, prng) => {
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

  updatePaths(person, currentTime) {
    let personObject = this.people[person];
    if (personObject.firstPath() == null) {
      console.error(`Person ${person} has no paths`);
      let location = V(50, 50);
      let duration = 2 * 1000;
      personObject.addPaths([
        new Path(personObject.firstRoom, location, location, duration, undefined)
      ]);
    }

    // case: we are at the start, and need to kick things off
    if (personObject.firstPath().startedAt === undefined) {
      personObject.setStartTime(currentTime);
    }
    let elapsed = currentTime - personObject.firstPath().startedAt;
    while (elapsed > personObject.firstPath().duration) {
      let poppedPath = personObject.popPath();
      elapsed -= poppedPath.duration;
      if (personObject.firstPath() == null) {
        console.log('Warning: No path, created a new one.', personObject.name, personObject.paths);
        let prng = personObject.prng;
        if (!prng) {
          console.log('No PRNG. Using random');
          prng = new Random();
        } else {
          console.log('Using person PRNG to create new paths');
        }
        let paths = this.generateRandomPaths(poppedPath.endingLocation, poppedPath.room, prng);
        personObject.addPaths(paths);
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
    personObject.prng = prng;

    personObject.showName = true;
    let hideTime = new Date();
    hideTime.setSeconds(hideTime.getSeconds() + SHOW_NAME_DURATION_S);
    personObject.hideNameTime = hideTime;

    this.movePersonToRoom(personObject, room, prng);
    this.generatePathsForPerson(personObject, INITIAL_PATH_COUNT, prng);
    let milliseconds = timestamp.seconds * 1000;
    let dateFromTimestamp = new Date(milliseconds);
    personObject.setStartTime(dateFromTimestamp);
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
        new Path(room, roomSpawnLocation, roomSpawnLocation, STAND_STILL_DURATION_S * 1000, undefined)
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

    this.drawFootsteps(context);

    Object.keys(this.people).map(person => {
      this.drawPerson(person, context, currentTime);
    })

    if (currentTime.getTime() - this.lastLogicUpdateTime > UPDATE_LOGIC_INTERVAL_MS) {
      Object.keys(this.people).map(person => {
        this.updatePaths(person, currentTime);
      })
    }

    this.lastLogicUpdateTime = currentTime.getTime();
    requestAnimationFrame(this.draw);
  }

  drawPerson(person, context, currentTime) {
    let currentPath = this.people[person].firstPath();
    if (!currentPath) {
      return;
    }
    let startingLocation = currentPath.startingLocation;
    let endingLocation = currentPath.endingLocation;
    let vector = endingLocation.sub(startingLocation);
    let duration = currentPath.duration;
    let elapsed = currentTime - currentPath.startedAt;
    // If startedAt or elapsed is undefined, then we use the startingLocation.
    let centerOfMassLocation = startingLocation;
    if (elapsed) {
      centerOfMassLocation = V(
        easeInOutQuad(elapsed, startingLocation.x, vector.x, duration),
        easeInOutQuad(elapsed, startingLocation.y, vector.y, duration)
      );
    }
    let roomDetails = rooms[currentPath.room];

    context.save()
    context.translate(roomDetails.topLeft.x, roomDetails.topLeft.y);
    let personObject = this.people[person];
    let footstepSize = 12;
    if (personObject.showName === true) {
      footstepSize = 24;
      if (personObject.image) {
        this.drawNameTag(context, personObject.image, centerOfMassLocation);
      } else {
        context.fillText(this.people[person].name, centerOfMassLocation.x + 10, centerOfMassLocation.y + 35);
      }
    }
    this.createFootsteps(context, centerOfMassLocation, startingLocation, endingLocation, roomDetails, currentTime, duration, footstepSize);
    context.restore();
  }

  drawNameTag = (context, image, centerOfMassLocation) => {
    let imageWidth = image.width ? image.width : 0;
    let imageHeight = image.height ? image.height : 0;
    context.save()
    context.translate(centerOfMassLocation.x - imageWidth / 2, centerOfMassLocation.y - imageHeight / 2);
    context.drawImage(image, 0, 0);
    context.restore()
  }

  createFootsteps(context, centerOfMassLocation, startingLocation, endingLocation, roomDetails, currentTime, duration, footstepSize) {
    // Direction of a single step.
    let footstepDirection = endingLocation.sub(startingLocation).normalize();
    if (footstepDirection == null) {
      // Do not create footsteps when standing still.
      return;
    }
    // Distance traveled since the starting location.
    let centerOfMassDistance = centerOfMassLocation.sub(startingLocation).size();
    let scaledStepVector = footstepDirection.scale(STEP_DISTANCE);

    let totalDistance = endingLocation.sub(startingLocation).size();
    let speed = totalDistance / duration;

    // Number of steps since the starting location.
    let stepCount = Math.floor(centerOfMassDistance / STEP_DISTANCE);
    // For each step since the starting location, draw it.
    for (let stepNumber = 0; stepNumber <= stepCount; stepNumber++) {
      let stepLocation = startingLocation.add(scaledStepVector.scale(stepNumber));
      let distanceSinceStep = centerOfMassLocation.sub(stepLocation).size();
      let timeSinceStep = duration * distanceSinceStep / totalDistance;

      if (timeSinceStep >= STEP_FADE_DURATION) {
        continue;
      }
      let stepBeginTime = currentTime - timeSinceStep;

      // Global coordinates.
      let globalStepLocation = stepLocation.add(V(roomDetails.topLeft.x, roomDetails.topLeft.y));

      let leftFootstepLocation = globalStepLocation.add(scaledStepVector.orthogonalLeft().scale(STEP_WIDTH_FACTOR));
      let rightFootstepLocation = globalStepLocation.add(scaledStepVector.orthogonalRight().scale(STEP_WIDTH_FACTOR));

      if (stepNumber % 2 === 0) {
        this.createFootstep(rightFootstepLocation, footstepDirection, stepNumber, stepBeginTime, footstepSize);
      }
      if (stepNumber % 2 === 1) {
        this.createFootstep(leftFootstepLocation, footstepDirection, stepNumber, stepBeginTime, footstepSize);
      }
    }
  }

  createFootstep(footstepLocation, footstepDirection, stepNumber, stepBeginTime, size) {
    let footstep = new Footstep(footstepLocation, footstepDirection, stepNumber, stepBeginTime, size);
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
    if (footstep.stepNumber % 2 === 0) {
      img = footstepRightImg;
    }
    let stepLocation = footstep.location;
    let footstepDirection = footstep.direction;
    context.save()
    context.translate(stepLocation.x, stepLocation.y);
    context.rotate(Math.atan2(footstepDirection.y, footstepDirection.x) + 90 * Math.PI / 180)
    context.globalAlpha = opacity;
    context.drawImage(img, 0, 0, footstep.size, footstep.size * img.height / img.width);
    context.restore()
  }

  render() {
    return (
      <div style={this.state.fullScreenStyle}>
        <canvas ref={this.canvas} style={this.state.fullScreenStyle} width={this.state.mapWidth} height={this.state.mapHeight} />
        <img onLoad={this.handleOnLoadImage} ref={this.image} src={process.env.PUBLIC_URL + '/129OctaviaTopDownView.png'} className="hidden" alt="Map View of Octavia House" />
      </div>
    )
  }
}

export default Canvas
