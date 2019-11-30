export class PersonRenderer {
  constructor() {
  }

  drawPeople = (context, people) => {
    Object.values(people).forEach(person => {
      if (person.showName) {
        this.drawPerson(context, person);
      }
    });
  }

  drawPerson = (context, person) => {
    context.save();
    context.translate(person.room.topLeft.x, person.room.topLeft.y);
    if (person.image) {
      let image = person.image;
      let location = person.location;
      let imageWidth = image.width ? image.width : 0;
      let imageHeight = image.height ? image.height : 0;
      context.translate(location.x - imageWidth / 2, location.y - imageHeight / 2);
      context.drawImage(image, 0, 0);
    } else {
      let name = person.name;
      let location = person.location;
      context.textAlign = "center";
      context.fillText(name, location.x, location.y);
    }
    context.restore();
  }
}
