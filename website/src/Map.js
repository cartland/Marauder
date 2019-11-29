import React, { Component } from 'react';

import * as firebase from "firebase/app";
import "firebase/firestore";

import { C } from "./config/C.js";
import { V } from './model/Vector2.js';
import { generateRooms } from './config/Rooms.js';
import { generatePeople } from './config/People.js';
import { Random } from './util/Random.js';
import { Path } from './model/Path.js';

// Background
import { BackgroundRenderer } from './render/BackgroundRenderer';

// Footsteps
import FootstepLeft from './assets/footstep-left.svg';
import FootstepRight from './assets/footstep-right.svg';
import { FootstepRenderer } from './render/FootstepRenderer.js';
import { FootstepController } from './controller/FootstepController';

// Person
import { PersonRenderer } from './render/PersonRenderer.js';
import { PersonController } from './controller/PersonController';

import getViewport from './getViewport.js';

class Canvas extends Component {
  state = {
    // not 4k, but is the same size as the base image
    mapWidth: 2560,
    mapHeight: 1440,
  }

  constructor(props) {
    super(props);

    this.rooms = generateRooms();

    this.backgroundRenderer = new BackgroundRenderer();
    this.footstepRenderer = new FootstepRenderer({
      footstepLeft: FootstepLeft,
      footstepRight: FootstepRight
    });
    this.personRenderer = new PersonRenderer();
    this.footstepController = new FootstepController();
    this.personController = new PersonController(this.footstepController);

    firebase.firestore().collection('nfcUpdates')
      .where('timestamp', '>', new Date())
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            let room = change.doc.get('nfcData').nfcReaderLocation;
            let person = change.doc.get('nfcData').nfcLogicalId;
            let timestamp = change.doc.get('timestamp');

            // Check to see if this is a reset request.
            if (person === C.RESET_LOGICAL_ID) {
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
            if (person === C.RESET_LOGICAL_ID) {
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
      let person = people[personKey];
      person.prng = prng;

      person.setPaths([]);
      this.generatePathsForPerson(person, C.INITIAL_PATH_COUNT, prng);
      if (dateFromTimestamp) {
        person.setStartTime(dateFromTimestamp);
      }
    }
  }

  generatePathsForPerson(person, count, prng) {
    for (let round = 0; round < count; round++) {
      let lastPath = person.lastPath();
      let startingLocation = null;
      let room = person.firstRoom;
      if (lastPath) {
        startingLocation = lastPath.endingLocation;
        room = lastPath.room;
      }
      let paths = this.generateRandomPaths(startingLocation, room, prng);
      person.addPaths(paths);
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
      let range = V(this.rooms[room].width, this.rooms[room].height);
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

    let range = V(this.rooms[room].width, this.rooms[room].height);
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
    let doorOptions = Object.keys(this.rooms[room].doors);
    let randomDoorFloat = prng.nextFloat();
    let newDoorIndex = Math.floor(randomDoorFloat * doorOptions.length);
    let newRoom = doorOptions[newDoorIndex];
    let doorLocation = this.rooms[room].doors[newRoom];

    let speed = 560 / 10; // cross the living room in 10 seconds
    let duration = 1000 * this.getDuration(startingLocation, doorLocation, speed);

    // First path to door.
    let pathToDoor = new Path(room, startingLocation, doorLocation, duration, undefined);

    let otherSideDoorLocation = this.rooms[newRoom].doors[room];
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

  addRoomChange = (personKey, newRoom, prng) => {
    let doorLocation = this.rooms[this.people[personKey].room].doors[newRoom];

    let speed = 560 / 10; // cross the living room in 10 seconds

    let startingLocation = this.people[personKey].lastPath().endingLocation;

    let duration = 1000 * this.getDuration(startingLocation, doorLocation, speed);

    let room = this.people[personKey].room

    this.people[personKey].addPaths([
      new Path(room, startingLocation, doorLocation, duration, undefined)
    ]);

    let otherSideDoorLocation = this.rooms[newRoom].doors[this.people[personKey].room];
    if (otherSideDoorLocation === undefined) {
      throw new Error(`room ${newRoom} does not have a door to ${this.people[personKey].room}`)
    }

    this.people[personKey].addPaths([
      this.generateRandomPathInRoom(
        newRoom,
        otherSideDoorLocation,
        prng
      )
    ]);

    this.people[personKey].room = newRoom;
  }

  updatePaths(personKey, currentTime) {
    let person = this.people[personKey];
    if (person.firstPath() == null) {
      console.error(`Person ${personKey} has no paths`);
      let location = V(50, 50);
      let duration = 2 * 1000;
      person.addPaths([
        new Path(person.firstRoom, location, location, duration, undefined)
      ]);
    }

    // case: we are at the start, and need to kick things off
    if (person.firstPath().startedAt === undefined) {
      person.setStartTime(currentTime);
    }
    let elapsed = currentTime - person.firstPath().startedAt;
    while (elapsed > person.firstPath().duration) {
      let poppedPath = person.popPath();
      elapsed -= poppedPath.duration;
      if (person.firstPath() == null) {
        console.log('Warning: No path, created a new one.', person.name, person.paths);
        let prng = person.prng;
        if (!prng) {
          console.log('No PRNG. Using random');
          prng = new Random();
        } else {
          console.log('Using person PRNG to create new paths');
        }
        let paths = this.generateRandomPaths(poppedPath.endingLocation, poppedPath.room, prng);
        person.addPaths(paths);
      }
    }
  }

  wandTapped = (room, personKey, timestamp) => {
    console.log('wandTapped', room, personKey, timestamp);
    let prng = new Random(timestamp.seconds);

    if (!personKey) {
      return;
    }

    let person = this.people[personKey];
    if (!person) {
      return;
    }
    person.prng = prng;

    person.showName = true;
    let hideTime = new Date();
    hideTime.setSeconds(hideTime.getSeconds() + C.SHOW_NAME_DURATION_S);
    person.hideNameTime = hideTime;

    this.movePersonToRoom(person, room, prng);
    this.generatePathsForPerson(person, C.INITIAL_PATH_COUNT, prng);
    let milliseconds = timestamp.seconds * 1000;
    let dateFromTimestamp = new Date(milliseconds);
    person.setStartTime(dateFromTimestamp);
    this.hideNameOrReschedule(personKey);
  }

  /**
   * Hide the person name if the time has passed.
   * If not, then schedule a timeout to try again with the new time.
   */
  hideNameOrReschedule(personKey) {
    let now = new Date();
    let hideTime = this.people[personKey].hideNameTime;
    if (now > hideTime) {
      this.people[personKey].showName = false;
    } else {
      let delayMs = hideTime.getTime() - now.getTime();
      setTimeout(() => {
        this.hideNameOrReschedule(personKey);
      }, delayMs);
    }
  }

  movePersonToRoom(person, room, prng) {
    if (room in this.rooms && "width" in this.rooms[room]) {
      let roomSpawnLocation = this.rooms[room].spawnLocation;
      person.setPaths([
        new Path(room, roomSpawnLocation, roomSpawnLocation, C.STAND_STILL_DURATION_S * 1000, undefined)
      ]);
      person.room = room;
    }
  }

  draw = () => {
    let currentTime = new Date();

    // Updates.
    this.footstepController.updateFootsteps(currentTime);
    Object.values(this.people).forEach(person => {
      this.personController.updatePerson(this.rooms, person, currentTime);
    })
    // Paths.
    if (currentTime.getTime() - this.lastLogicUpdateTime > C.UPDATE_LOGIC_INTERVAL_MS) {
      Object.keys(this.people).map(person => {
        this.updatePaths(person, currentTime);
      })
    }
    this.lastLogicUpdateTime = currentTime.getTime();

    // Drawing.
    let context = this.canvas.current.getContext("2d")
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.font = "60px Roboto";
    // Draw background first.
    this.backgroundRenderer.drawBackground(context, this.image.current);
    // Draw footsteps before people.
    this.footstepRenderer.drawFootsteps(context, this.footstepController.getFootsteps());
    // Draw people after footsteps.
    Object.values(this.people).forEach(person => {
      if (person.showName) {
        this.personRenderer.drawPerson(context, person);
      }
    });
    requestAnimationFrame(this.draw);
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
