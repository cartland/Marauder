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

export class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  scale(factor) {
    return new Vector2(this.x * factor, this.y * factor);
  }

  add(b) {
    return new Vector2(this.x + b.x, this.y + b.y);
  }

  sub(b) {
    return this.add(b.scale(-1.0));
  }

  size() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    if (this.size() === 0) {
      return null;
    }
    return this.scale(1.0 / this.size());
  }

  orthogonalLeft() {
    return new Vector2(this.y, 0.0 - this.x);
  }

  orthogonalRight() {
    return new Vector2(0.0 - this.y, this.x);
  }
}

export function V(x, y) {
  return new Vector2(x, y);
}
