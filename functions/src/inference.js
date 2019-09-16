var Distribution = require('./Distribution.js').Distribution;
var checkTypes = require('./util.js').checkTypes;

function calculateObservationUpdate(prior, observation, alpha) {
  // Infer learning amount with alpha percentage.
  var inference = prior.copy();
  inference.multiply(observation);
  inference.scale(alpha);

  // Keep prior (1 - alpha).
  var priorComponent = prior.copy();
  priorComponent.scale(1 - alpha);

  // inference = observation * alpha + prior * (1 - alpha)
  inference.add(priorComponent);
  return inference.normalize();
}

class RssiNeighborhoodObserver {
  constructor(neighborhood) {
    checkTypes( [neighborhood], ['map'] );
    this.neighborhood = neighborhood;
    this.allStates = Array.from(this.neighborhood.keys());
  }

  observe(sensorLocation, rssiValue) {
    const prediction = new Distribution();
    // Zero initial observation for all states.
    for (let state of this.allStates) {
      prediction.setValue(state, 0.0);
    }
    // Use RSSI to predict current location.
    var sensorLocationPrediction;
    if (rssiValue >= -40) {
      sensorLocationPrediction = 0.9;
    } else if (rssiValue >= -60) {
      // -60 to -40 maps to 0.6-0.9
      var inOffset = -60
      var inRange = 20;
      var outOffset = 0.6
      var outRange = 0.3;
      sensorLocationPrediction = (((rssiValue - inOffset) / inRange) * outRange) + outOffset;;
    } else if (rssiValue >= -70) {
      // -70 to -60 maps to 0.4-0.6
      var inOffset = -70
      var inRange = 10;
      var outOffset = 0.4
      var outRange = 0.2;
      sensorLocationPrediction = (((rssiValue - inOffset) / inRange) * outRange) + outOffset;;
    } else if (rssiValue >= -90) {
      // -90 to -70 maps to 0.1-0.4
      var inOffset = -90
      var inRange = 20;
      var outOffset = 0.1
      var outRange = 0.3;
      sensorLocationPrediction = (((rssiValue - inOffset) / inRange) * outRange) + outOffset;;
    } else {
      sensorLocationPrediction = 0.1;
    }
    prediction.setValue(sensorLocation, sensorLocationPrediction);

    var neighbors = this.neighborhood.get(sensorLocation);
    var neighborValue = (1 - sensorLocationPrediction) / neighbors.length;
    for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];
      prediction.addValue(neighbor, neighborValue);
    }
    return prediction.normalize();
  }
}

function calculateTimeUpdate(predictionPrior, predictor) {
  var inference = new Distribution();
  var states = predictor.getAllStates();
  for (let state of states) {
    // Given the current state, what is the a priori distribution of next states?
    var aPrioriTimePrediction = predictor.predict(state);
    // What is the prior probability for the current state?
    var priorValue = predictionPrior.getValue(state);
    // Scale the a priori prediction based on the prior prediction.
    var timePrediction = aPrioriTimePrediction.scale(priorValue);

    // Add the inference from the current state to the total inference.
    inference.add(timePrediction);
  }
  return inference.normalize();
}

function makePrediction(distribution) {
  return distribution.keysSortedByValue()[0];
}

class OneSecondPredictor {
  constructor(states) {
    this.allStates = states;
  }

  getAllStates() {
    return this.allStates;
  }

  predict(origin) {
    const prediction = new Distribution();
    const stayingProbability = 0.99;
    const otherStateValue = (1 - stayingProbability) / this.allStates.length;
    for (let state of this.getAllStates()) {
      if (state == origin) {
        prediction.setValue(state, stayingProbability);
      } else {
        prediction.setValue(state, otherStateValue);
      }
    }
    return prediction.normalize();
  }
}

class ProbablyNotHerePredictor {
  constructor(states) {
    this.allStates = states;
  }

  getAllStates() {
    return this.allStates;
  }

  predict(origin) {
    const prediction = new Distribution();
    for (let state of this.getAllStates()) {
      if (state !== origin) {
        prediction.setValue(state, 0.1);
      } else {
        prediction.setValue(state, 0.9);
      }
    }
    return prediction.normalize();
  }
}

module.exports = {
  calculateObservationUpdate: calculateObservationUpdate,
  calculateTimeUpdate: calculateTimeUpdate,
  makePrediction: makePrediction,
  OneSecondPredictor: OneSecondPredictor,
  ProbablyNotHerePredictor: ProbablyNotHerePredictor,
  RssiNeighborhoodObserver: RssiNeighborhoodObserver
}
