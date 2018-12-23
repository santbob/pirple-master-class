/*
 * Primary files for defining all the routes
 *
 */

// Dependencies
const handlers = require('./handlers');
const htmlHandlers = require('./htmlHandlers');
// Defint the routes object
const routes = {
  'api/users': handlers.users,
  'api/tokens': handlers.tokens,
  'api/menu': handlers.menu,
  'api/cart': handlers.cart,
  'api/order': handlers.order,
  '': htmlHandlers.index,
  'account/create': htmlHandlers.accountCreate,
  'account/edit': htmlHandlers.accountEdit,
  'account/deleted': htmlHandlers.accountDeleted,
  'session/create': htmlHandlers.sessionCreate,
  'session/deleted': htmlHandlers.sessionDeleted,
  'cart': htmlHandlers.cart,
  'orders': htmlHandlers.orders,
  'favicon': htmlHandlers.favicon,
  'public': htmlHandlers.public
};

// export the routes module
module.exports = routes;
