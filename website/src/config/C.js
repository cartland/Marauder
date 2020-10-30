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
export const C = {
  // Length of a single step in pixels.
  STEP_DISTANCE: 50, // 50 pixels.
  // Left and right feet are offset by a factor of the STEP_DISTANCE.
  STEP_WIDTH_FACTOR: 0.25, // 25%.
  // Time it takes for a step to fade in milliseconds.
  STEP_FADE_DURATION: 7 * 1000, // 7 seconds.
  // Time to stand still after tapping wand.
  STAND_STILL_DURATION_S: 10, // 10 seconds.
  // Time it takes for the name to disappear after wand tap.
  SHOW_NAME_DURATION_S: 40, // 40 seconds.
  // Person ID to trigger a web page reset.
  RESET_LOGICAL_ID: 'reset',
  // Time between logic updates.
  UPDATE_LOGIC_INTERVAL_MS: 5, // 5 milliseconds.
  // Number of paths to generate per person during initialization.
  INITIAL_PATH_COUNT: 1000
}