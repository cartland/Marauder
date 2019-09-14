'use strict';
var Distribution = require('./Distribution.js').Distribution;
var roundNumber = require('./util.js').roundNumber;
var assert = require('assert');

var d = new Distribution();

// Test setValue()
var zero = 0;
d.setValue(zero, 0.1);
assert.strictEqual(d.getValue(zero), 0.1, 'Failed to set value in distribution');

// Test addValue()
var one = 1;
d.addValue(one, 0.1);
d.addValue(one, 0.3);
assert.strictEqual(d.getValue(one), 0.4, 'Failed to add value to distribution');

// Test calculateSum()
assert.strictEqual(d.calculateSum(), 0.5, 'Distribution sum does not match');

// Test normalize()
d.normalize();
assert.strictEqual(d.calculateSum(), 1.0, 'Normalized distribution should add up to 1');
assert.strictEqual(d.getValue(zero), 0.2, 'Distribution value does not match');
assert.strictEqual(d.getValue(one), 0.8, 'Distribution value does not match');

// Test scale()
d.scale(2.0);
assert.strictEqual(d.calculateSum(), 2.0, 'Sum should be scaled');
assert.strictEqual(d.getValue(zero), 0.4, 'Distribution value did not scale');
assert.strictEqual(d.getValue(one), 1.6, 'Distribution value did not scale');

// Test multiply()
var x = new Distribution();
x.setValue(zero, 0.5);
x.setValue(one, 0.25);
d.multiply(x);
assert.strictEqual(d.getValue(zero), 0.2, 'Value does not match after multiply');
assert.strictEqual(d.getValue(one), 0.4, 'Value does not match after multiply');
var multiplySum = d.calculateSum();
var roundedNum = roundNumber(multiplySum, 8);
assert.strictEqual(roundedNum, 0.6, 'Sum does not match after multiply');

