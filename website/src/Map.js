import React, { Component } from 'react';

import * as firebase from "firebase/app";
import "firebase/firestore";

import { generateRooms } from './config/Rooms';
import { generatePeople } from './config/People';
import { Random } from './util/Random';

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
import { FirebaseController } from './controller/FirebaseController';
import { PathGenerator } from './generator/PathGenerator';

class Canvas extends Component {
  constructor(props) {
    super(props);
    // Renderers.
    this.backgroundRenderer = new BackgroundRenderer();
    this.footstepRenderer = new FootstepRenderer({
      footstepLeft: FootstepLeft,
      footstepRight: FootstepRight
    });
    this.personRenderer = new PersonRenderer();
    // Controllers.
    this.footstepController = new FootstepController();
    this.roomController = new RoomController(generateRooms());
    this.personController = new PersonController(generatePeople(this.roomController.allRooms()), this.footstepController, this.roomController);
    this.pathGenerator = new PathGenerator(this.roomController);
    this.pathController = new PathController(this.pathGenerator, this.personController, this.roomController);
    this.pathController.initializeAllPaths(this.personController.getPeople(), null, 0);
    this.firebaseController = new FirebaseController(firebase, this.personController, this.roomController, this.pathController);
    this.firebaseController.initialize();
    // Global state.
    this.resetTimestamp = 0;
    this.lastLogicUpdateTime = 0;
    this.state = {
      // not 4k, but is the same size as the base image
      mapWidth: 2560,
      mapHeight: 1440,
    };
    // Canvas.
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

  draw = () => {
    let currentTime = new Date().getTime();

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
