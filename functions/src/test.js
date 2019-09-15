'use strict';
var Distribution = require('./Distribution.js').Distribution;
var roundNumber = require('./util.js').roundNumber;
var inference = require('./inference.js');
var assert = require('assert');

var d = new Distribution();

// Test setValue()
var STATE_A = 0;
d.setValue(STATE_A, 0.1);
assert.strictEqual(d.getValue(STATE_A), 0.1, 'Failed to set value in distribution');

// Test addValue()
var STATE_B = 1;
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

