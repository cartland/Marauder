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
          this.newStandingStillWaypoint([0, 0], 2*1000),
        ],
      },
      alberto: {
        name: 'Alberto',
        room: 'kitchen',
        waypoints: [
          this.newStandingStillWaypoint([0, 0], 2*1000),
        ],
      },
      cartland: {
        name: 'Cartland',
        room: 'living_room',
        waypoints: [
          this.newStandingStillWaypoint([0, 0], 2*1000),
        ],
      },
    }

    this.canvas = React.createRef();
    this.image = React.createRef();
  }

  handleOnLoadImage = (e) => {
    this.draw()
  }

  newRandomLocationWaypoint = (startingLocation, roomId) => {
    let endingX = Math.random() * rooms[roomId].width;
    let endingY = Math.random() * rooms[roomId].height;

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
    )
  }

  newWaypointToLocation(startingLocation, endingLocation, duration) {
    return {
      startingLocation: startingLocation,
      endingLocation: endingLocation,
      duration: duration,
      startedAt: undefined,
    }
  }

  newStandingStillWaypoint(location, duration) {
    return {
      startingLocation: location,
      endingLocation: location,
      duration: duration,
      startedAt: undefined,
    }
  }

  nextWaypoint = (startingLocation, room) => {
    if (Math.floor(Math.random() * 2) === 0) {
      return this.newStandingStillWaypoint(startingLocation, 1000*(5*Math.random()+2));
    } else {
      return this.newRandomLocationWaypoint(startingLocation, room);
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
