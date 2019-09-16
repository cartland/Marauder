'use strict';

const GROUND_TRUTH = require('./ground_truth.js').GROUND_TRUTH;
var inference = require('./inference.js');
var util = require('./util.js');
const createFlatDistribution = require('./Distribution.js').createFlatDistribution;
var createNoiseDistribution = require('./Distribution.js').createNoiseDistribution;

function extractLocations(data) {
  var set = new Set();
  for (var i = 0; i < data.length; i++) {
    set.add(data[i]['phoneLocation']);
    set.add(data[i]['tileLocation']);
  }
  return Array.from(set.values());
}

function timestamp_sorter(a, b) {
  var date_a = Date.parse(a['timestamp']);
  var date_b = Date.parse(b['timestamp']);
  return date_a - date_b;
}

// Copy data.
var data = GROUND_TRUTH.slice(0);

// Extract all states from location data.
var states = extractLocations(GROUND_TRUTH);
console.log('STATES');
console.log(states);

// For each phone, record the number of measurements.
for (var i = 0; i < states.length; i++) {
  var state = states[i];
  var data_for_state = data.filter(function (x) {
    return x['phoneLocation'] == state;
  });
  console.log(state);
  console.log(data_for_state.length);
}

// Create apriori predictions for all states.
var phoneLocationPredictions = createFlatDistribution(states);
console.log('INITIAL PREDICTIONS');
console.log(phoneLocationPredictions.prettyPrint());

// Sort data.
data.sort(timestamp_sorter);

// For each datum, update the prediction.
var neighborhood = new Map();
neighborhood.set('living_room', [ 'living_room', 'kitchen', 'patio', 'hallway' ]);
neighborhood.set('kitchen', [ 'living_room', 'kitchen', 'patio']);
neighborhood.set('patio', [ 'living_room', 'kitchen', 'patio']);
neighborhood.set('nick_bedroom', [ 'nick_bedroom', 'stromme_bedroom', 'hallway' ]);
neighborhood.set('stromme_bedroom', [ 'nick_bedroom', 'stromme_bedroom', 'hallway' ]);
neighborhood.set('hallway', [ 'living_room', 'nick_bedroom', 'stromme_bedroom', 'hallway' ]);
console.log('NEIGHBORHOOD');
console.log(neighborhood);
var rssiNeighborhoodObserver = new inference.RssiNeighborhoodObserver(neighborhood);

// Begin inference based on data.
var totalGuesses = 0;
var totalCorrect = 0;
var confusionMatrix = new inference.ConfusionMatrix();
console.log();
console.log('BEGIN INFERENCE');
var lastDataUpdateMillis = -1;
var lastTimeUpdateMillis = -1;
for (var i = 0; i < data.length; i++) {
  var datum = data[i];

  var currentTimeMillis = Date.parse(datum['timestamp']);
  var date = new Date(currentTimeMillis);
  console.log(date.toISOString());

  // Time update tracking
  if (lastTimeUpdateMillis == -1) {
    console.log('First time update!');
    lastTimeUpdateMillis = currentTimeMillis;
  } else {
    var timePassedMillis = currentTimeMillis - lastTimeUpdateMillis;
    var numberOfUpdates = Math.floor(timePassedMillis / 1000); // One time update required per second.
    console.log('TIME INFERENCE: Performing updates for ' + numberOfUpdates.toString() + ' seconds');
    lastTimeUpdateMillis += numberOfUpdates * 1000;

    var predictor = new inference.OneSecondPredictor(states);
    var timeInference = phoneLocationPredictions.copy();
    for (var timeCtr = 1; timeCtr <= numberOfUpdates; timeCtr++) {
      timeInference = inference.calculateTimeUpdate(timeInference, predictor);
      if (timeCtr % 60 == 0) {
        console.log('TIME UPDATE: ' + timeCtr + ' (' + Math.floor(timeCtr / 60).toString() + ' min) of ' + numberOfUpdates + ' seconds have passed');
        console.log(timeInference.prettyPrint());
      }
    }
    console.log('TIME INFERENCE: Completed updates for ' + numberOfUpdates.toString() + ' seconds');
    console.log();
    phoneLocationPredictions = timeInference;
  }

  // Data update tracking
  if (lastDataUpdateMillis == -1) {
    console.log('First data update!');
    lastDataUpdateMillis = currentTimeMillis;
  } else {
    var timePassedMillis = currentTimeMillis - lastDataUpdateMillis;
    lastDataUpdateMillis = currentTimeMillis;
  }

  // Observation update
  var phoneLocation = datum['phoneLocation'];
  var rssiMeasurement = datum['rssiMeasurement'];
  console.log('OBSERVATION: ' + phoneLocation + ': ' + rssiMeasurement);
  var observation = rssiNeighborhoodObserver.observe(phoneLocation, rssiMeasurement);
  var alpha = 0.9; // Observation learning rate.
  var noise = 0.1; // Observation noise.
  var observationInference = inference.calculateObservationUpdate(phoneLocationPredictions, observation, alpha);
  observationInference = observationInference.add(createNoiseDistribution(states).scale(noise)).normalize();
  phoneLocationPredictions = observationInference

  console.log(phoneLocationPredictions.prettyPrint());
  console.log();
  var actualLocation = datum['tileLocation'];
  var guess = inference.makePrediction(phoneLocationPredictions);
  var correct = (actualLocation == guess);
  if (correct) {
    totalCorrect++;
  }
  totalGuesses++;
  confusionMatrix.insert(guess, actualLocation);

  console.log('INFERENCE: ' + (correct ? 'CORRECT' : 'WRONG') + ' - actual: ' + actualLocation + ', guess: ' + guess);
  console.log();
}
console.log('TOTAL GUESSES:' + totalGuesses);
console.log('TOTAL CORRECT:' + totalCorrect + ' (' + util.roundNumber(100 * totalCorrect / totalGuesses, 2) + '%)');
var confusion = confusionMatrix.prettyPrint();
console.log(confusion);
