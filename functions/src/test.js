'use strict';
var Distribution = require('./Distribution.js').Distribution;
var roundNumber = require('./util.js').roundNumber;
var inference = require('./inference.js');
var assert = require('assert');

var STATE_A = 0;
var STATE_B = 1;
var d = new Distribution();

// Test setValue()
d.setValue(STATE_A, 0.1);
assert.strictEqual(d.getValue(STATE_A), 0.1, 'Failed to set value in distribution');

// Test addValue()
d.addValue(STATE_B, 0.1);
d.addValue(STATE_B, 0.3);
assert.strictEqual(d.getValue(STATE_B), 0.4, 'Failed to add value to distribution');

// Test copy()
var copy = d.copy();
assert.strictEqual(copy.getValue(STATE_A), 0.1, 'Failed to set value in distribution');
assert.strictEqual(copy.getValue(STATE_B), 0.4, 'Failed to add value to distribution');

// Test calculateSum()
assert.strictEqual(d.calculateSum(), 0.5, 'Distribution sum does not match');

// Test normalize()
d.normalize();
assert.strictEqual(d.calculateSum(), 1.0, 'Normalized distribution should add up to 1');
assert.strictEqual(d.getValue(STATE_A), 0.2, 'Distribution value does not match');
assert.strictEqual(d.getValue(STATE_B), 0.8, 'Distribution value does not match');

// Test scale()
d.scale(2.0);
assert.strictEqual(d.calculateSum(), 2.0, 'Sum should be scaled');
assert.strictEqual(d.getValue(STATE_A), 0.4, 'Distribution value did not scale');
assert.strictEqual(d.getValue(STATE_B), 1.6, 'Distribution value did not scale');

// Test multiply()
var x = new Distribution();
x.setValue(STATE_A, 0.5);
x.setValue(STATE_B, 0.25);
d.multiply(x);
assert.strictEqual(d.getValue(STATE_A), 0.2, 'Value does not match after multiply');
assert.strictEqual(d.getValue(STATE_B), 0.4, 'Value does not match after multiply');
var multiplySum = d.calculateSum();
assert.strictEqual(roundNumber(multiplySum, 8), 0.6, 'Sum does not match after multiply');

// Test add()
var a = new Distribution();
a.setValue(STATE_A, 0.1);
a.setValue(STATE_B, 0.2);
var b = new Distribution();
b.setValue(STATE_A, 0.3);
b.setValue(STATE_B, 0.4);
a.add(b);
assert.strictEqual(roundNumber(a.getValue(STATE_A), 8), 0.4, 'Value does not match after addition');
assert.strictEqual(roundNumber(a.getValue(STATE_B), 8), 0.6, 'Value does not match after addition');

// Test observation update
var observationPrior = new Distribution();
observationPrior.setValue(STATE_A, 1.0);
observationPrior.setValue(STATE_B, 1.0);
var observation = new Distribution();
observation.setValue(STATE_A, 0.2);
observation.setValue(STATE_B, 1.0);
var alpha = 0.5;
var observationInference = inference.calculateObservationUpdate(observationPrior, observation, alpha);
assert.strictEqual(roundNumber(observationInference.getValue(STATE_A), 8), 0.375, 'Value does not match after observation');
assert.strictEqual(roundNumber(observationInference.getValue(STATE_B), 8), 0.625, 'Value does not match after observation');

// Test time prediction update
var predictionPrior = new Distribution();
predictionPrior.setValue(STATE_A, 1.0);
predictionPrior.setValue(STATE_B, 0.1);
var predictor = new inference.ProbablyNotHerePredictor([STATE_A, STATE_B]);
var predictionInference = inference.calculateTimeUpdate(predictionPrior, predictor);
assert.strictEqual(roundNumber(predictionInference.getValue(STATE_A), 8), 0.82727273, 'Value does not match after observation');
assert.strictEqual(roundNumber(predictionInference.getValue(STATE_B), 8), 0.17272727, 'Value does not match after observation');

// Test observation distribution
// RSSI values: [-10, -55, -65, -75, -90]
// Expected input will be negative, where higher values indicate higher probability of being close to the sensor.
var neighborhood = new Map();
neighborhood.set(STATE_A, [STATE_B]);
neighborhood.set(STATE_B, [STATE_A]);
var rssiNeighborhoodObserver = new inference.RssiNeighborhoodObserver(neighborhood);
// -10 RSSI
var observationDistribution = rssiNeighborhoodObserver.observe(STATE_A, -10);
assert.ok(observationDistribution.getValue(STATE_A) > 0.7, '-10 RSSI observation should indicate state A (with high confidence)');
assert.ok(observationDistribution.getValue(STATE_B) < 0.3, '-10 RSSI observation should NOT indicate state B (with high confidence)');
// -55 RSSI
observationDistribution = rssiNeighborhoodObserver.observe(STATE_A, -55);
assert.ok(observationDistribution.getValue(STATE_A) > 0.55, '-55 RSSI observation should indicate state A (with low conficence)');
assert.ok(observationDistribution.getValue(STATE_B) < 0.45, '-55 RSSI observation should NOT indicate state B (with low conficence)');
// -65 RSSI
observationDistribution = rssiNeighborhoodObserver.observe(STATE_A, -65);
assert.ok(observationDistribution.getValue(STATE_A) > 0.35, '-65 RSSI observation can indicate state A (with extremely low conficence)');
assert.ok(observationDistribution.getValue(STATE_B) < 0.65, '-65 RSSI observation can indicate state B (with extremely low conficence)');
// -75 RSSI
observationDistribution = rssiNeighborhoodObserver.observe(STATE_A, -75);
assert.ok(observationDistribution.getValue(STATE_A) < 0.45, '-75 RSSI observation should NOT indicate state A (with low conficence)');
assert.ok(observationDistribution.getValue(STATE_B) > 0.55, '-75 RSSI observation should indicate state B (with low conficence)');
// -90 RSSI
var observationDistribution = rssiNeighborhoodObserver.observe(STATE_A, -90);
assert.ok(observationDistribution.getValue(STATE_A) < 0.3, '-90 RSSI observation should NOT indicate state A (with high conficence)');
assert.ok(observationDistribution.getValue(STATE_B) > 0.7, '-90 RSSI observation should indicate state B (with high conficence)');

