/*
 * Primary files for defining all the routes
 *
 */

// Dependencies
const handlers = require('./handlers');

// Defint the routes object
const routes = {
  'users': handlers.users,
  'tokens': handlers.tokens,
  'menu': handlers.menu,
  'cart': handlers.cart
};

// export the routes module
module.exports = routes;
