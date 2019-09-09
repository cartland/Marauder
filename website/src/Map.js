import React, {Component} from 'react';

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
    people: {
      stromme: 'living_room',
      cartland: 'kitchen',
    },
  }

  constructor(props) {
    super(props);

    this.canvas = React.createRef();
    this.image = React.createRef();
  }

  handleOnLoadImage = (e) => {
    this.draw()
  }

  draw = () => {
    console.log(this.canvas, this.image)
    let ctx = this.canvas.current.getContext("2d")
    ctx.drawImage(this.image.current, 0, 0);
    ctx.font = "40px Courier";
    ctx.fillText("Make Your Mischief", 210, 75);


    Object.keys(this.state.people).map(person => {
      let personRoom = this.state.people[person];
      let roomDetails = rooms[personRoom];

      let personX = roomDetails.topLeft.x + roomDetails.width / 4;
      let personY = roomDetails.topLeft.y + roomDetails.height / 4;

      ctx.beginPath();
      ctx.arc(personX, personY, 10, 0, 2*Math.PI, true);
      ctx.fill();
      ctx.fillText(person, personX+10, personY+35);
    })
  }

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
