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
const config = require('./lib/config');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');
const routes = require('./lib/routes');

// Instantiating the http server
const httpServer = http.createServer(function(req, resp) {
  unifiedServer(req, resp);
});

// Instantiating the http server
const httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname, '/https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname, '/https/cert.pem'))
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
    const choosenHandler = typeof(routes[trimmedPath]) !== 'undefined'
      ? routes[trimmedPath]
      : handlers.notFound;

    //construct data to be passed to handler
    const data = {
      'path': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    }

    // Route the request to the handler specified in the routes
    choosenHandler(data, function(statusCode, payload) {
      //use sensible defaults for status code and payload if not present
      statusCode = typeof(statusCode) === 'number'
        ? statusCode
        : 200;
      payload = typeof(payload) === 'object'
        ? payload
        : {};

      // Convert the payload to a string
      const payloadString = JSON.stringify(payload);

      // Return the response
      // write the status of the response in the response header
      resp.setHeader('Content-Type', 'application/json');
      resp.writeHead(statusCode);

      //send the response string
      resp.end(payloadString);

    });
  });
};

// init the server
init = function() {
  // Start the http server and have it listen to httpPort config
  httpServer.listen(config.httpPort, function() {
    console.log(`The server is listening in port ${config.httpPort} in ${config.envName} mode`)
  });

  // Start the http server and have it listen to httpPort config
  httpsServer.listen(config.httpsPort, function() {
    console.log(`The server is listening in port ${config.httpsPort} in ${config.envName} mode`)
  });
};

init();
