var Distribution = require('./Distribution.js').Distribution;

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
  ProbablyNotHerePredictor: ProbablyNotHerePredictor
}
