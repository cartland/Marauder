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
  return inference;
}

module.exports = {
  calculateObservationUpdate: calculateObservationUpdate
}
