import React, { Component } from 'react';

import * as firebase from "firebase/app";
import "firebase/firestore";

import { C } from "./config/C";
import { V } from './model/Vector2';
import { generateRooms } from './config/Rooms';
import { generatePeople } from './config/People';
import { Random } from './util/Random';

// Model.
import { Path } from './model/Path';
import { Door } from './model/Door';

// Background
import { BackgroundRenderer } from './render/BackgroundRenderer';

// Footsteps
import FootstepLeft from './assets/footstep-left.svg';
import FootstepRight from './assets/footstep-right.svg';
import { FootstepRenderer } from './render/FootstepRenderer';

// Person
import { PersonRenderer } from './render/PersonRenderer';

// Controllers
import { FootstepController } from './controller/FootstepController';
import { PersonController } from './controller/PersonController';
import { PathController } from './controller/PathController';
import { RoomController } from './controller/RoomController';

import getViewport from './getViewport.js';

class Canvas extends Component {
  state = {
    // not 4k, but is the same size as the base image
    mapWidth: 2560,
    mapHeight: 1440,
  }

  constructor(props) {
    super(props);

    this.backgroundRenderer = new BackgroundRenderer();
    this.footstepRenderer = new FootstepRenderer({
      footstepLeft: FootstepLeft,
      footstepRight: FootstepRight
    });
    this.personRenderer = new PersonRenderer();
    this.footstepController = new FootstepController();
    this.roomController = new RoomController(generateRooms());
    let people = generatePeople(this.roomController.allRooms());
    this.personController = new PersonController(people, this.footstepController, this.roomController);
    this.pathController = new PathController(this.personController, this.roomController);

    firebase.firestore().collection('nfcUpdates')
      .where('timestamp', '>', new Date())
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            let roomKey = change.doc.get('nfcData').nfcReaderLocation;
            let personKey = change.doc.get('nfcData').nfcLogicalId;
            let timestamp = change.doc.get('timestamp');

            // Check to see if this is a reset request.
            if (personKey === C.RESET_LOGICAL_ID) {
              window.location.reload();
              return;
            }
            this.wandTapped(
              this.roomController.getRoom(roomKey),
              this.personController.getPerson(personKey),
              timestamp);
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
            let personKey = change.doc.get('nfcData').nfcLogicalId;
            let timestamp = change.doc.get('timestamp');

            // // Check to see if this is a reset request.
            if (personKey === C.RESET_LOGICAL_ID) {
              let seconds = timestamp.seconds;
              if (seconds > that.resetTimestamp) {
                console.log('Initialize with seed.', seconds);
                that.resetTimestamp = seconds;
                let milliseconds = this.resetTimestamp * 1000;
                let dateFromTimestamp = new Date(milliseconds);
                console.log('Initializing start time', dateFromTimestamp);
                let prng = new Random(that.resetTimestamp);
                that.pathController.initializeAllPaths(this.personController.getPeople(), dateFromTimestamp, prng);
              } else {
                console.log('Ignoring old reset.', seconds);
              }
              return;
            }
          }
        });
      });

    let prng = new Random(this.resetTimestamp);
    this.pathController.initializeAllPaths(this.personController.getPeople(), null, prng);
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

  wandTapped = (room, person, timestamp) => {
    if (!room) {
      console.log('Unknown Room for wand tap');
      return;
    }
    if (!person) {
      console.log('Unknown Person for wand tap');
      return;
    }
    console.log('wandTapped', room.roomKey, person.personKey, timestamp);
    person.prng = new Random(timestamp.seconds);

    this.movePerson(room, person, timestamp);
    this.showPerson(person);
  }

  movePerson = (room, person, timestamp) => {
    this.pathController.movePersonToRoom(person, room, person.prng);
    this.pathController.addNRandomPathsToPerson(person, C.INITIAL_PATH_COUNT, person.prng);
    let milliseconds = timestamp.seconds * 1000;
    let dateFromTimestamp = new Date(milliseconds);
    person.setStartTime(dateFromTimestamp);
  }

  showPerson = (person) => {
    person.showName = true;
    let hideTime = new Date();
    hideTime.setSeconds(hideTime.getSeconds() + C.SHOW_NAME_DURATION_S);
    person.hideNameTime = hideTime;
    this.hideNameOrReschedule(person);
  }

  /**
   * Hide the person name if the time has passed.
   * If not, then schedule a timeout to try again with the new time.
   */
  hideNameOrReschedule(person) {
    let now = new Date();
    let hideTime = person.hideNameTime;
    if (now > hideTime) {
      person.showName = false;
    } else {
      let delayMs = hideTime.getTime() - now.getTime();
      setTimeout(() => {
        this.hideNameOrReschedule(person);
      }, delayMs);
    }
  }

  draw = () => {
    let currentTime = new Date();

    // Updates.
    this.footstepController.updateFootsteps(currentTime);
    this.personController.updatePeople(this.personController.getPeople(), currentTime);
    this.pathController.updatePaths(this.personController.getPeople(), currentTime);

    // Drawing.
    let context = this.canvas.current.getContext("2d")
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.font = "60px Roboto";
    // Draw background first.
    this.backgroundRenderer.drawBackground(context, this.image.current);
    // Draw footsteps before people.
    this.footstepRenderer.drawFootsteps(context, this.footstepController.getFootsteps());
    // Draw people after footsteps.
    this.personRenderer.drawPeople(context, this.personController.getPeople());

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
