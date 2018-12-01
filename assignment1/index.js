/*
 * Main Server file
 *
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');

// Setting up local config
const config = {
  httpPort : 3000,
  httpsPort: 3001
};

// setup handlers
const handlers = {
  'hello': function(req, res) {
    res.end('Vanakam Ulagam!');
  },
  'notFound': function(req, res) {
    res.end('Hi Stranger, you are at a wrong path');
  }
}

// setup routers
const router = {
  'hello': handlers.hello,
  'notFound': handlers.notFound
}

// Unified server function for both http and https servers
const unifiedServer = function(req, res) {
  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
  var chosenHandler = typeof(router[trimmedPath]) !== 'undefined'
    ? router[trimmedPath]
    : handlers.notFound;

  chosenHandler(req, res);
}

// Instantiate the HTTP Server
const httpServer = http.createServer(function(req, res) {
  unifiedServer(req, res);
});
// Start the HTTP server
httpServer.listen(config.httpPort, function() {
  console.log('The HTTP server is running on port ' + config.httpPort);
})

// Instantiate the HTTPS server
var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer(req, res);
});
// Start the HTTPS server
httpsServer.listen(config.httpsPort, function() {
  console.log('The HTTPS server is running on port ' + config.httpsPort);
});
