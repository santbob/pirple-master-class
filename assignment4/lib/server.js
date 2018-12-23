/*
 * Server related tasks
 *
*/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const path = require('path');
const fs = require('fs');
const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');
const routes = require('./routes');

// instantiate the server
const server = {};

// Instantiating the http server
const httpServer = http.createServer(function(req, resp) {
  unifiedServer(req, resp);
});

// Instantiating the http server
const httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname, '../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname, '../https/cert.pem'))
};
const httpsServer = https.createServer(httpsServerOptions, function(req, resp) {
  unifiedServer(req, resp);
});

const unifiedServer = function(req, resp) {
  //get the url and parse it
  const parsedUrl = url.parse(req.url, true);

  //get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  //get the querystring as an object
  const queryStringObject = parsedUrl.query;

  //get the HTTP method
  const method = req.method.toLowerCase();

  //get the headers
  const headers = req.headers;

  //get the payload, if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  req.on('data', function(data) {
    buffer += decoder.write(data);
  });

  req.on('end', function() {
    buffer += decoder.end();

    //choose the handler the request should go to, if not found use the not found handler
    let chosenHandler = typeof(routes[trimmedPath]) !== 'undefined'
      ? routes[trimmedPath]
      : handlers.notFound;

    // If the request is within the public directory use to the public handler instead
    chosenHandler = trimmedPath.indexOf('public/') > -1
      ? routes['public']
      : chosenHandler;

    //construct data to be passed to handler
    const data = {
      'path': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    }

    // Route the request to the handler specified in the routes
    chosenHandler(data, function(statusCode, payload, contentType) {

      //determine the type of response, default is json
      contentType = typeof(contentType) == 'string'
        ? contentType
        : 'json';

      //use sensible defaults for status code and payload if not present
      statusCode = typeof(statusCode) === 'number'
        ? statusCode
        : 200;

      // set the content-type of the response
      resp.setHeader('Content-Type', getResponseContentType(contentType));
      resp.writeHead(statusCode);
      //end the response by passing the repsonse string
      resp.end(getPayloadString(contentType, payload));
    });
  });
};

// Returns the right contentType to set in the response based on the internal resolved contenttype
const getResponseContentType = function(internalContentType) {
  switch (internalContentType) {
    case 'json':
      return 'application/json';
    case 'html':
      return 'text/html';
    case 'favicon':
      return 'image/x-icon';
    case 'css':
      return 'text/css';
    case 'jpg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    default:
      return 'text/plain'
  }
}

// returns the rightly converted payloadstring based on the contentType that is resolved internally
const getPayloadString = function(internalContentType, payload) {
  switch (internalContentType) {
    case 'json':
      payload = typeof(payload) === 'object'
        ? payload
        : {};
      return JSON.stringify(payload);
    case 'html':
      return typeof(payload) === 'string'
        ? payload
        : "";
    default:
      return typeof(payload) !== 'undefined'
        ? payload
        : '';
  }
}

// init the server
server.init = function() {
  // Start the http server and have it listen to httpPort config
  httpServer.listen(config.httpPort, function() {
    console.log(`The server is listening in port ${config.httpPort} in ${config.envName} mode`)
  });

  // Start the http server and have it listen to httpPort config
  httpsServer.listen(config.httpsPort, function() {
    console.log(`The server is listening in port ${config.httpsPort} in ${config.envName} mode`)
  });
};

//export the module
module.exports = server;
