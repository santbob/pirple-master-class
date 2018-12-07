/*
 * Request handlers
 *
 */
//Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');
const pizzaMenuData = require('./pizzaMenuData');

// Define the handlers
var handlers = {};

handlers.users = function(data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _users[data.method](data, callback);
  } else {
    callback(405);
  }
}

// module private object holding handlers for user calls
const _users = {};

_users.post = function(data, callback) {
  const name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0
    ? data.payload.name.trim()
    : false;
  const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0
    ? data.payload.email.trim()
    : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0
    ? data.payload.password.trim()
    : false;
  const address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 0
    ? data.payload.address.trim()
    : false;

  if (name && email && password && address) {
    //Make sure that user doesnt exist already.
    _data.read('users', email, function(err, data) {
      if (err) {
        var userData = {
          name,
          email,
          address
        };
        userData.hashedPassword = helpers.hash(password);
        if (userData.hashedPassword) {
          _data.create('users', email, userData, function(err) {
            if (!err) {
              callback(200)
            } else {
              console.log(err);
              callback(500, 'Could not create new user');
            }
          })
        } else {
          callback(500, 'Unable to Hash password try again');
        }
      } else {
        callback(500, 'User already exist');
      }
    })
  } else {
    callback(400, {'Error': 'Missing required fields'});
  }
}

// Required data: email
// Optional data: none
_users.get = function(data, callback) {
  var email = typeof(data.queryStringObject.email) == 'string'
    ? data.queryStringObject.email.trim()
    : false;
  var id = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20
    ? data.headers.token.trim()
    : false;
  if (email && id) {
    verifyToken(id, email, function(isTokenValid) {
      if (isTokenValid) {
        _data.read('users', email, function(err, data) {
          if (!err && data) {
            // Remove the hashed password from the user user object before returning it to the requester
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {'Error': 'Invalid token'})
      }
    });
  } else {
    callback(404, {'Error': 'Missing required field'});
  }
}

// Required data: email
// Optional data: name, lastName, password (at least one must be specified)
_users.put = function(data, callback) {
  var email = typeof(data.queryStringObject.email) == 'string'
    ? data.queryStringObject.email.trim()
    : false;
  var id = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20
    ? data.headers.token.trim()
    : false;

  // Check for optional fields
  var name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0
    ? data.payload.name.trim()
    : false;
  // var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0
  //   ? data.payload.email.trim()
  //   : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0
    ? data.payload.password.trim()
    : false;

  if (email && id) {
    if (name || email || password) {
      verifyToken(id, email, function(isTokenValid) {
        if (isTokenValid) {
          _data.read('users', email, function(err, userData) {
            if (!err && userData) {
              if (name) {
                userData.name = name;
              }

              // if (email) {
              //   userData.email = email;
              // }

              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }

              _data.update('users', email, userData, function(err) {
                if (!err) {
                  callback(200);
                } else {
                  callback(500, {'Error': 'Could not update the user.'})
                }
              })
            } else {
              callback(400, {'Error': 'Specified user does not exist.'})
            }
          });
        } else {
          callback(403, {'Error': 'Invalid token'})
        }
      })
    } else {
      callback(400, {'Error': 'Missing fields to update'});
    }
  } else {
    callback(404, {'Error': 'Missing required field'});
  }
}

// Required data: email
// Optional data: none
_users.delete = function(data, callback) {
  var email = typeof(data.queryStringObject.email) == 'string'
    ? data.queryStringObject.email.trim()
    : false;
  var id = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20
    ? data.headers.token.trim()
    : false;

  if (email && id) {
    verifyToken(id, email, function(isTokenValid) {
      if (isTokenValid) {
        _data.read('users', email, function(err, data) {
          if (!err && data) {
            _data.delete('users', email, function(err) {
              if (!err) {
                callback(200);
              } else {
                callback(500, {'Error': 'Could not delete the specified user'});
              }
            });
          } else {
            callback(400, {'Error': 'Could not find the specified user.'});
          }
        });
      } else {
        callback(403, {'Error': 'Invalid token'})
      }
    });
  } else {
    callback(404, {'Error': 'Missing required field'});
  }
}

handlers.tokens = function(data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _tokens[data.method](data, callback);
  } else {
    callback(405);
  }
}

const _tokens = {};

// Required data: email, password
// Optional data: none
_tokens.post = function(data, callback) {
  console.log("payload", data.payload);
  const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0
    ? data.payload.email.trim()
    : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0
    ? data.payload.password.trim()
    : false;

  if (email && password) {
    _data.read('users', email, function(err, userData) {
      if (!err && userData) {
        var hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashedPassword) {
          // create a new token with random name, expiry to 1 hour
          const tokenId = helpers.createRandomString(20);
          const tokenObj = {
            email,
            'id': tokenId,
            'expires': Date.now() + (1000 * 60 * 60)
          }
          _data.create('tokens', tokenId, tokenObj, function(err) {
            if (!err) {
              callback(200, tokenObj);
            } else {
              callback(500, {'Error': 'Could not create a token'})
            }
          })
        } else {
          callback(400, {'Error': 'User email and password combination doesnt match'});
        }
      } else {
        callback(400, {'Error': 'Could not find the specified user'});
      }
    })
  } else {
    callback(404, {'Error': 'Missing required field'});
  }
}

// Required data: id
// Optional data: none
_tokens.get = function(data, callback) {
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length > 0
    ? data.queryStringObject.id.trim()
    : false;
  if (id) {
    _data.read('tokens', id, function(err, tokenData) {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    })
  } else {
    callback(404, {'Error': 'Missing required field'});
  }
}

_tokens.put = function(data, callback) {
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length > 0
    ? data.queryStringObject.id.trim()
    : false;
  var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true
    ? true
    : false;

  if (id && extend) {
    _data.read('tokens', id, function(err, tokenData) {
      if (!err && tokenData) {
        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + (1000 * 60 * 60);

          _data.update('tokens', id, tokenData, function(err) {
            if (!err) {
              callback(200, tokenData);
            } else {
              callback(500, {'Error': 'Could not update the token expiration'});
            }
          })
        } else {
          callback(500, {'Error': 'Token already expired cannot extend'});
        }
      } else {
        callback(404);
      }
    })
  } else {
    callback(404, {'Error': 'Missing required field'});
  }
}

_tokens.delete = function(data, callback) {
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20
    ? data.queryStringObject.id.trim()
    : false;
  if (id) {
    _data.read('tokens', id, function(err, data) {
      if (!err && data) {
        _data.delete('tokens', id, function(err) {
          if (!err) {
            callback(200);
          } else {
            callback(500, {'Error': 'Could not delete the token'});
          }
        });
      } else {
        callback(400, {'Error': 'Could not find the token.'});
      }
    });
  } else {
    callback(404, {'Error': 'Missing required field'});
  }
}

// Verify given token is valid
const verifyToken = function(id, email, callback) {
  _data.read('tokens', id, function(err, tokenData) {
    if (!err && tokenData) {
      console.log('tokenData ', tokenData)
      if (tokenData.expires > Date.now() && tokenData.email == email) {
        console.log('token valid')
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  })
}

handlers.menu = function(data, callback) {
  var id = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20
    ? data.headers.token.trim()
    : false;
  var email = typeof(data.headers.email) == 'string'
    ? data.headers.email.trim()
    : false;
  if (data.method == 'get') {
    if (id && email) {
      verifyToken(id, email, function(isTokenValid) {
        if (isTokenValid) {
          callback(200, pizzaMenuData);
        } else {
          callback(403, {'Error': 'Invalid token'})
        }
      });
    } else {
      callback(404, {'Error': 'Missing required field'});
    }
  } else {
    callback(405);
  }
}

handlers.cart = function(data, callback) {
  var acceptableMethods = ['post', 'get'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    _cart[data.method](data, callback);
  } else {
    callback(405);
  }
}

const _cart = {};

// Required data: email, password
// Optional data: none
_cart.post = function(data, callback) {
  const email = typeof(data.headers.email) == 'string' && data.headers.email.trim().length > 0
    ? data.headers.email.trim()
    : false;
  const id = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20
    ? data.headers.token.trim()
    : false;

  const items = typeof(data.payload.items) == 'array'
    ? data.payload.items
    : false;

  if (id && email) {
    verifyToken(id, email, function(isTokenValid) {
      if (isTokenValid) {
        _data.read('users', email, function(err, data) {
          if (!err && data) {
            data.cart = data.cart || [];
            items.forEach(function(item){
              const itemData = {
                "crust": []
              }
            });
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {'Error': 'Invalid token'})
      }
    });
  } else {
    callback(404, {'Error': 'Missing required field'});
  }
};

handlers.notFound = function(data, callback) {
  callback(404);
}

module.exports = handlers;
