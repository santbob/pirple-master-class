/*
 * Main Server file
 *
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const cluster = require('cluster');
const os = require('os');

// Setting up local config
const config = {
  httpPort: 3000,
  httpsPort: 3001
};

// setup handlers
const handlers = {
  'hello': function(callback) {
    callback(200, {'message': 'Vanakam Ulagam!'});
  },
  'notFound': function(callback) {
    callback(404);
  }
}

// setup routers
const router = {
  'hello': handlers.hello,
  'notFound': handlers.notFound
}

// Unified server function for both http and https servers
const unifiedServer = function(req, resp) {

  //get the url and parse it
  const parsedUrl = url.parse(req.url, true);

  //get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  //choose the handler the request should go to, if not found use the not found handler
  const choosenHandler = typeof(router[trimmedPath]) !== 'undefined'
    ? router[trimmedPath]
    : handlers.notFound;

  // Route the request to the handler specified in the router
  choosenHandler(function(status, payload) {
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
}

initServer = function() {
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
}

// on the master cluster, just fork the cluster, othercase is when you start the server
if (cluster.isMaster) {
  // Fork the process
  os.cpus().forEach((cpu) => cluster.fork());
} else {
  //start the server
  initServer();
}
