import React, {Component} from 'react';

class Canvas extends React.Component {

  constructor(props) {
    super(props);

    this.canvas = React.createRef();
    this.image = React.createRef();
  }

  handleOnLoadImage = (e) => {
    console.log(this.canvas, this.image)
    let ctx = this.canvas.current.getContext("2d")
    ctx.drawImage(e.target, 0, 0);
    ctx.font = "40px Courier";
    ctx.fillText("Hello Map", 210, 75);
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
