import React, {Component} from 'react';
import { easeInOutQuad } from 'js-easing-functions';

/* global window */
window.easeInOutQuad = easeInOutQuad


let rooms = {
  kitchen: {
    topLeft: {
      x: 486,
      y: 439,
    },
    height: 563,
    width: 386,
    name: 'Kitchen',
  },
  living_room: {
    topLeft: {
      x: 872,
      y: 439,
    },
    height: 563,
    width: 420,
    name: 'Living Room',
  },
}

class Canvas extends React.Component {
  state = {
  }

  constructor(props) {
    super(props);

    this.people = {
      stromme: {
        name: 'Stromme',
        room: 'living_room',
        waypoints: [
          {
            startingLocation: [0, 0],
            endingLocation: [300, 300],
            duration: 4 * 1000,
            startedAt: undefined,
          },
          {
            startingLocation: [300, 300],
            endingLocation: [300, 300],
            duration: 2 * 1000,
            startedAt: undefined,
          },
          {
            startingLocation: [300, 300],
            endingLocation: [420, 563],
            duration: 1 * 1000,
            startedAt: undefined,
          },
        ],
      },
    }

    this.canvas = React.createRef();
    this.image = React.createRef();
  }

  handleOnLoadImage = (e) => {
    this.draw()
  }

  createNewWaypoint = (person) => {
    if (person.waypoints.length === 0) {
      throw new Error(`person ${person.name} has no waypoints`);
    }

    let maxSpeed = 560 / 4; // cross the living room in 4 seconds
    let minSpeed = 560 / 20; // cross the living room in 20 seconds

    let lastWaypoint = person.waypoints[person.waypoints.length-1];


    let newWaypoint = {
    }
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
        console.log('elapsed > personState.waypoints[0].duration');

        // if there are future waypoints, we move on to those
        if (personState.waypoints.length > 1) {
          console.log('personState.waypoints.length > 1');
          personState.waypoints[1].startedAt =
            new Date(personState.waypoints[0].startedAt.getTime() + personState.waypoints[0].duration);

          console.log('personState.waypoints[1].startedAt', personState.waypoints[1].startedAt);
          console.log('currentTime', new Date());
          console.log('oldElapsed', elapsed);

          elapsed -= personState.waypoints[0].duration;
          console.log('newElapsed', elapsed);

          personState.waypoints.shift();
        } else { // otherwise we randomly create them
          personState.waypoints.push({
            startingLocation: personState.waypoints[0].endingLocation,
            endingLocation: personState.waypoints[0].endingLocation,
            duration: 5 * 1000,
            startedAt: undefined,
          })
          console.log('newWaypoints', personState.waypoints)
        }
      }
    }

    return this.people[person].waypoints[0];
  }

  draw = () => {
    // console.log(this.canvas, this.image)

    let context = this.canvas.current.getContext("2d")
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.drawImage(this.image.current, 0, 0);
    context.font = "40px Courier";
    context.fillText("Make Your Mischief", 210, 75);

    Object.keys(this.people).map(person => {
      context.save()
      let roomDetails = rooms[this.people[person].room];

      context.translate(roomDetails.topLeft.x, roomDetails.topLeft.y);

      let currentWaypoint = this.updateWaypoints(person);
      let elapsed = new Date() - currentWaypoint.startedAt;

      let personX = easeInOutQuad(
        elapsed,
        currentWaypoint.startingLocation[0],
        currentWaypoint.endingLocation[0]-currentWaypoint.startingLocation[0],
        currentWaypoint.duration);

      let personY = easeInOutQuad(
        elapsed,
        currentWaypoint.startingLocation[1],
        currentWaypoint.endingLocation[1]-currentWaypoint.startingLocation[1],
        currentWaypoint.duration);

      context.beginPath();
      context.arc(personX, personY, 10, 0, 2*Math.PI, true);
      context.fill();
      context.fillText(person, personX+10, personY+35);
      context.restore()
    })

    requestAnimationFrame(this.draw);
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
