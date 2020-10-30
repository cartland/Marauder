/**
 * Copyright 2019 Chris Cartland and Andrew Stromme. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
