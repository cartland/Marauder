'use strict';
var checkTypes = require('./util.js').checkTypes;

/**
 * Distribution of probabilities.
 *
 * The distribution can be normalized to ensure that
 * the probabilities add up to 1.
 */
class Distribution {
  constructor() {
    // Create an empty distribution.
    this._map = new Map();
  }

  /**
   * Copy the distribution.
   *
   * @returns {Distribution} A new Distribution
   */
  copy() {
    var newDistribution = new Distribution();
    newDistribution._map = new Map(this._map);
    return newDistribution;
  }

  /**
   * Get the value for the key.
   *
   * Returns 0.0 if the value does not exist in the distribution.
   *
   * @param {object} key
   * @returns {number}
   */
  getValue(key) {
    if (this.hasKey(key)) {
      return this._map.get(key);
    }
    return 0.0;
  }

  /**
   * Returns true if the key is in the distribution.
   *
   * @returns {boolean}
   */
  hasKey(key) {
    return this._map.has(key);
  }

  /**
   * Calculate the sum of the distribution values.
   *
   * @returns {number}
   */
  calculateSum() {
    return Array.from(this._map.values()).reduce((a, b) => a + b);
  }

  /**
   * Set the value for a key in the distribution.
   *
   * @param {object} key
   * @param {number} value
   * @returns {Distribution} Updated Distribution object
   */
  setValue(key, value) {
    checkTypes( [value], ['number'] );
    this._map.set(key, value);
    return this;
  }

  /**
   * Scale the distribution by a multiplier.
   *
   * @param {number} multiplier
   * @returns {Distribution} Updated Distribution object
   */
  scale(multiplier) {
    for (const [key, value] of this._map.entries()) {
      var normalizedValue = multiplier * value;
      this._map.set(key, normalizedValue);
    }
    return this;
  }

  /**
   * Add the value for the key in a distribution.
   *
   * If the key is not already in the distribution, set the value.
   *
   * @param {object} key
   * @param {number} value
   * @returns {Distribution} Updated Distribution object
   */
  addValue(key, value) {
    checkTypes( [value], ['number'] );
    if (!this.hasKey(key)) {
      this.setValue(key, value);
      return this;
    }
    var oldValue = this.getValue(key);
    var newValue = oldValue + value;
    this.setValue(key, newValue);
    return this;
  }

  /**
   * Normalize the distribution.
   *
   * If the sum of the distribution is 0, throw an error.
   *
   * @returns {Distribution} Updated Distribution object
   */
  normalize() {
    var sum = this.calculateSum();
    if (sum == 0) {
      throw new Error('Cannot normalize distribution with zero sum');
    }
    var multiplier = 1.0 / sum;
    this.scale(multiplier);
    return this;
  }

  /**
   * Add the distribution from the values in another distribution.
   *
   * The distribution keys from both will be used and the
   * distribution will be updated.
   *
   * @param {Distribution} x
   * @returns {Distribution} Updated Distribution object
   */
  add(x) {
    const keys = x._map.keys();
    for (let key of keys) {
      const sum = this.getValue(key) + x.getValue(key);
      this.setValue(key, sum);
    }
    return this;
  }

  /**
   * Multiply the distribution by the values in another distribution.
   *
   * The distribution keys from {this} will be used and the
   * distributions will be updated.
   *
   * @param {Distribution} x
   * @returns {Distribution} Updated Distribution object
   */
  multiply(x) {
    const keys = this._map.keys();
    for (let key of keys) {
      const product = this.getValue(key) * x.getValue(key);
      this.setValue(key, product);
    }
    return this;
  }

}

module.exports = {
  Distribution: Distribution
}
