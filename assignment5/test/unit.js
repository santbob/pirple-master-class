/*
 * The Main file all unit tests
 *
 */

// Dependencies
const assert = require('assert');
const lib = require('../app/lib');

// Holder for Tests
const unit = {};

unit['lib.getNumberForTheString should return a number'] = function(done) {
  const val = lib.getNumberForTheString('apple');
  assert.equal(typeof(val), 'number');
  done();
};

unit['lib.getNumberForTheString should return 0'] = function(done) {
  const val = lib.getNumberForTheString();
  assert.ok(val === 0);
  done();
};


unit['lib.getNumberForTheString should return right number'] = function(done) {
  const val = lib.getNumberForTheString('apple');
  assert.equal(val, 50);
  done();
};

unit['lib.jumbleString should return a string'] = function(done) {
  const val = lib.jumbleString('apple');
  assert.equal(typeof(val), 'string');
  done();
};

unit['lib.jumbleString should return the undefined'] = function(done) {
  const val = lib.jumbleString();
  assert.ok(val == undefined);
  done();
};

unit['lib.jumbleString should return right jumpled string'] = function(done) {
  const val = lib.jumbleString('apple');
  assert.equal(val, 'dssoh');
  done();
};

unit['lib.jumbleString should return wrong jumbled string for failed test'] = function(done) {
  const val = lib.jumbleString('santhosh');
  assert.equal(val, 'apple');
  done();
};

module.exports = unit;
