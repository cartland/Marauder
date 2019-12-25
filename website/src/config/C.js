export const C = {
  // Length of a single step in pixels.
  STEP_DISTANCE: 50,
  // Left and right feet are offset by a factor of the STEP_DISTANCE.
  STEP_WIDTH_FACTOR: 0.25,
  // Time it takes for a step to fade in milliseconds.
  STEP_FADE_DURATION_MS: 7 * 1000, // 7 seconds.
  // Time to stand still after tapping wand.
  STAND_STILL_DURATION_MS: 10 * 1000,
  // Time it takes for the name to disappear after wand tap.
  SHOW_NAME_DURATION_MS: 40 * 1000, // Time in seconds
  // Person ID to trigger a web page reset.
  RESET_LOGICAL_ID: 'reset',
  // Time between logic updates.
  UPDATE_LOGIC_INTERVAL_MS: 5,
  // Number of paths to generate per person during initialization.
  INITIAL_PATH_COUNT: 1000
}