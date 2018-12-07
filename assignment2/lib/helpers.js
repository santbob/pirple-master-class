/*
 * Helpers module for various tasks
 *
 */

//Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');

var helpers = {};

// Hashes a given string using sha256 and crypto module
helpers.hash = function(str) {
  if (typeof(str) == 'string' && str.trim().length > 0) {
    return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
  } else {
    return false;
  }
}

// parse a JSON string to an object
helpers.parseJsonToObject = function(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
}

helpers.createRandomString = function(strLength) {
  strLength = typeof(strLength) == 'number' && strLength > 0
    ? strLength
    : false;

  if (strLength) {
    //define all possible characters
    const possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let str = '';
    for (i = 1; i <= strLength; i++) {
      // Get a random charactert from the possibleCharacters string
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      // Append this character to the string
      str += randomCharacter;
    }
    return str;
  } else {
    return false
  }
}

module.exports = helpers;
