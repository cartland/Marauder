'use strict';

const GROUND_TRUTH = require('./ground_truth.js').GROUND_TRUTH;
var inference = require('./inference.js');
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
console.log(phoneLocationPredictions);

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
var rssiNeighborhoodObserver = new inference.RssiNeighborhoodObserver(neighborhood);

for (var i = 0; i < data.length; i++) {
  var datum = data[i];
  var phoneLocation = datum['phoneLocation'];
  var rssiMeasurement = datum['rssiMeasurement'];
  var observation = rssiNeighborhoodObserver.observe(phoneLocation, rssiMeasurement);
  var alpha = 0.5;
  var observationInference = inference.calculateObservationUpdate(phoneLocationPredictions, observation, alpha);
  observationInference = observationInference.add(createNoiseDistribution(states).scale(0.01)).normalize();
  console.log(phoneLocation + ': ' + rssiMeasurement);
  console.log(observationInference);
  phoneLocationPredictions = observationInference
}
