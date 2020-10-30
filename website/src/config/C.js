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