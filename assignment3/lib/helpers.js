/*
 * Helpers module for various tasks
 *
 */

//Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');

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

// format the amount in cents to dollars
helpers.formatMoney = function(amount, currencySymbol) {
  return currencySymbol + (amount / 100);
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

// takes payment from the consumer
helpers.chargeForOrder = function(orderAmount, email, callback) {
  // Validate parameters
  email = typeof(email) == 'string' && email.trim().length > 0
    ? email.trim()
    : false;
  orderAmount = typeof(orderAmount) == 'number' && orderAmount > 0
    ? orderAmount
    : false;

  if (orderAmount && email) {
    // Configure the request payload
    var payload = {
      'amount': orderAmount,
      'currency': 'usd', // could be passed as an argument to this function
      'source': 'tok_visa', // could be passed as an agrument to this function
      'description': `Charge for ${email}`
    };
    var stringPayload = querystring.stringify(payload);

    // Configure the request details
    var requestDetails = {
      'protocol': 'https:',
      'hostname': 'api.stripe.com',
      'method': 'POST',
      'path': '/v1/charges',
      'auth': config.stripe.API_SECRET_KEY,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    var req = https.request(requestDetails, function(res) {
      // Grab the status of the sent request
      var status = res.statusCode;

      var buffer = '';
      // recieve the response for the request
      res.on('data', function(data) {
        buffer += data;
      });

      // Callback successfully if the request went through
      if (status == 200 || status == 201) {
        // listening on the end event of the success state to send the response back to the callback
        res.on('end', function() {
          callback(false, JSON.parse(buffer));
        });
      } else {
        callback('Status code returned was ' + status);
      }

    });

    // Bind to the error event so it doesn't get thrown
    req.on('error', function(e) {
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();

  } else {
    callback('email and amount are mandatory for charging the user');
  }
};

helpers.sendEmail = function(receiverEmail, subject, emailBody, callback) {
  // Validate parameters
  receiverEmail = typeof(receiverEmail) == 'string' && receiverEmail.trim().length > 0
    ? receiverEmail.trim()
    : false;

  subject = typeof(subject) == 'string' && subject.trim().length > 0
    ? subject.trim()
    : false;

  emailBody = typeof(emailBody) == 'string' && emailBody.trim().length > 0
    ? emailBody.trim()
    : false;

  if (receiverEmail && subject && emailBody) {
    // Configure the request payload
    var payload = {
      'from': `postmaster@${config.mailgun.SANDBOX_NAME}.mailgun.org`,
      'to': receiverEmail,
      'subject': subject,
      'html': emailBody
    };
    var stringPayload = querystring.stringify(payload);

    // Configure the request details
    var requestDetails = {
      'protocol': 'https:',
      'hostname': 'api.mailgun.net',
      'method': 'POST',
      'path': `/v3/${config.mailgun.SANDBOX_NAME}.mailgun.org/messages`,
      'auth': config.mailgun.API_SECRET_KEY,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    var req = https.request(requestDetails, function(res) {
      // Grab the status of the sent request
      var status = res.statusCode;

      var buffer = '';
      // recieve the response for the request
      res.on('data', function(data) {
        buffer += data;
      });

      // Callback successfully if the request went through
      if (status == 200 || status == 201) {
        // listening on the end event of the success state to send the response back to the callback
        res.on('end', function() {
          callback(false, JSON.parse(buffer));
        });
      } else {
        callback('Status code returned was ' + status);
      }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error', function(e) {
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();

  } else {
    callback('receiverEmail, subject and emailBody are mandatory to send email');
  }
}

helpers.buildHtmlFromTemplate = function(templateName, data, callback) {
  helpers.getTemplate(templateName, data, function(err, pageContent) {
    if (!err && pageContent) {
      // Add the templateGlobals to the data object, prepending their key name with "global."
      data.pageContent = pageContent;
      for (var keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
          data['global.' + keyName] = config.templateGlobals[keyName]
        }
      }
      helpers.getTemplate('_base', data, callback);
    } else {
      callback(err);
    }
  });
};

helpers.getTemplate = function(templateName, data, callback) {
  templateName = typeof(templateName) == 'string' && templateName.length > 0
    ? templateName
    : false;
  if (templateName) {
    const templateDir = path.join(__dirname, '/../templates/');
    fs.readFile(templateDir + templateName + '.html', 'utf-8', function(err, str) {
      if (!err && str && str.length > 0) {
        callback(false, helpers.interpolate(str, data));
      } else {
        callback('no template found');
      }
    })
  } else {
    callback('A valid template was not specified')
  }
}

helpers.interpolate = function(str, data) {
  str = typeof(str) == 'string' && str.length > 0
    ? str
    : '';
  data = typeof(data) == 'object' && data !== null
    ? data
    : {};

  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for (var key in data) {
    if (data.hasOwnProperty(key) && typeof(data[key] == 'string')) {
      var replace = data[key];
      var find = '{' + key + '}';
      str = str.replace(find, replace);
    }
  }
  return str;
}

helpers.getStaticAsset = function(assetName, callback) {
  assetName = typeof(assetName) == 'string' && assetName.length > 0
    ? assetName
    : false;
  if (assetName) {
    const publicDir = path.join(__dirname, '/../public/');
    fs.readFile(publicDir + assetName, function(err, data) {
      if (!err && data) {
        callback(false, data);
      } else {
        callback('No file could be found');
      }
    });
  } else {
    callback('A valid file name was not specified');
  }
}

module.exports = helpers;
