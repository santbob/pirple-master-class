/*
 * Handler functions for handling html routes
 *
 */

// Dependencies
const helpers = require('./helpers');
const httpStatuses = require('./httpStatuses');
const pizzaMenuData = require('./pizzaMenuData');
const GET = 'get';
const CONTENT_TYPE_HTML = 'html';

const htmlHandlers = {};

htmlHandlers.index = function(data, callback) {
  if (data.method = GET) {
    const templateData = {
      'head.title': 'PirplePizza - Simple & Best Pizza',
      'head.description': 'We offer the simple and best pizza with high quality and low cost',
      'body.class': 'index'
    };
    helpers.buildHtmlFromTemplate('index', templateData, function(err, str) {
      if (!err && str) {
        callback(httpStatuses.SUCCESS.code, str, CONTENT_TYPE_HTML);
      } else {
        callback(httpStatuses.ERROR_FINDING_DOCUMENT.code, undefined, CONTENT_TYPE_HTML)
      }
    });
  } else {
    callback(httpStatuses.METHOD_NOT_ALLOWED.code, undefined, CONTENT_TYPE_HTML);
  }
};

// Create an User Account
htmlHandlers.accountCreate = function(data, callback) {
  if (data.method = GET) {
    const templateData = {
      'head.title': 'SignUp',
      'head.description': 'Signup is easy and only takes a few seconds.',
      'body.class': 'accountCreate'
    };
    helpers.buildHtmlFromTemplate('accountCreate', templateData, function(err, str) {
      if (!err && str) {
        callback(httpStatuses.SUCCESS.code, str, CONTENT_TYPE_HTML);
      } else {
        callback(httpStatuses.ERROR_FINDING_DOCUMENT.code, undefined, CONTENT_TYPE_HTML)
      }
    });
  } else {
    callback(httpStatuses.METHOD_NOT_ALLOWED.code, undefined, CONTENT_TYPE_HTML);
  }
};

// Edit an User Account
htmlHandlers.accountEdit = function(data, callback) {
  if (data.method = GET) {
    const templateData = {
      'head.title': 'Account Settings',
      'body.class': 'accountEdit'
    };
    helpers.buildHtmlFromTemplate('accountEdit', templateData, function(err, str) {
      if (!err && str) {
        callback(httpStatuses.SUCCESS.code, str, CONTENT_TYPE_HTML);
      } else {
        callback(httpStatuses.ERROR_FINDING_DOCUMENT.code, undefined, CONTENT_TYPE_HTML)
      }
    });
  } else {
    callback(httpStatuses.METHOD_NOT_ALLOWED.code, undefined, CONTENT_TYPE_HTML);
  }
};

// Delete an User Account
htmlHandlers.accountDeleted = function(data, callback) {
  if (data.method = GET) {
    const templateData = {
      'head.title': 'Account Deleted',
      'head.description': 'Your account has been deleted.',
      'body.class': 'accountDeleted'
    };
    helpers.buildHtmlFromTemplate('accountDeleted', templateData, function(err, str) {
      if (!err && str) {
        callback(httpStatuses.SUCCESS.code, str, CONTENT_TYPE_HTML);
      } else {
        callback(httpStatuses.ERROR_FINDING_DOCUMENT.code, undefined, CONTENT_TYPE_HTML)
      }
    });
  } else {
    callback(httpStatuses.METHOD_NOT_ALLOWED.code, undefined, CONTENT_TYPE_HTML);
  }
};

// Create a Session for the User
htmlHandlers.sessionCreate = function(data, callback) {
  if (data.method = GET) {
    const templateData = {
      'head.title': 'SignIn',
      'head.description': 'Login to your account',
      'body.class': 'sessionCreate'
    };
    helpers.buildHtmlFromTemplate('sessionCreate', templateData, function(err, str) {
      if (!err && str) {
        callback(httpStatuses.SUCCESS.code, str, CONTENT_TYPE_HTML);
      } else {
        callback(httpStatuses.ERROR_FINDING_DOCUMENT.code, undefined, CONTENT_TYPE_HTML)
      }
    });
  } else {
    callback(httpStatuses.METHOD_NOT_ALLOWED.code, undefined, CONTENT_TYPE_HTML);
  }
};

// Delete the Session of the User
htmlHandlers.sessionDeleted = function(data, callback) {
  if (data.method = GET) {
    const templateData = {
      'head.title': 'Signed Out',
      'head.description': 'Adios! see you again soon.',
      'body.class': 'sessionDeleted'
    };
    helpers.buildHtmlFromTemplate('sessionDeleted', templateData, function(err, str) {
      if (!err && str) {
        callback(httpStatuses.SUCCESS.code, str, CONTENT_TYPE_HTML);
      } else {
        callback(httpStatuses.ERROR_FINDING_DOCUMENT.code, undefined, CONTENT_TYPE_HTML)
      }
    });
  } else {
    callback(httpStatuses.METHOD_NOT_ALLOWED.code, undefined, CONTENT_TYPE_HTML);
  }
};

htmlHandlers.cart = function(data, callback) {
  callback(null, null, CONTENT_TYPE_HTML);
};

htmlHandlers.pizzaBuilder = function(data, callback) {
  if (data.method = GET) {
    const templateData = {
      'head.title': 'Pizza Builder',
      'head.description': 'Build the pizza and add it to cart',
      'body.class': 'pizzaBuilder'
    };

    helpers.getTemplate('inputs/radio', undefined, function(err, radioBtnHtml) {
      const selections = {};
      //html for size selection
      templateData['selections.sizeHtml'] = pizzaMenuData.selection.sizes.map((size) => {
        return helpers.interpolate(radioBtnHtml, {
          'name': 'size',
          'value': size.name,
          'checked': size.default
            ? 'checked'
            : ''
        });
      }).join('');

      //html for crust selection
      templateData['selections.crustHtml'] = pizzaMenuData.selection.crusts.map((crust) => {
        return helpers.interpolate(radioBtnHtml, {
          'name': 'crust',
          'value': crust.name,
          'checked': crust.price === 0
            ? 'checked'
            : ''
        })
      }).join('');

      //html for meat selection
      templateData['selections.meatHtml'] = pizzaMenuData.selection.meats.map((meat) => {
        return helpers.interpolate(radioBtnHtml, {
          'name': 'meat',
          'value': meat,
          'checked': meat === 'Chicken'
            ? 'checked'
            : ''
        });
      }).join('');

      //html for sauce selection
      templateData['selections.sauceHtml'] = pizzaMenuData.selection.sauces.map((sauce) => {
        return helpers.interpolate(radioBtnHtml, {
          'name': 'sauce',
          'value': sauce,
          'checked': sauce === 'Regular'
            ? 'checked'
            : ''
        });
      }).join('');

      helpers.getTemplate('inputs/checkbox', undefined, function(err, checboxInputHtml) {
        //html for sauce selection
        templateData['selections.toppingsHtml'] = pizzaMenuData.selection.toppings.map((topping) => {
          return helpers.interpolate(checboxInputHtml, {
            'name': 'toppings',
            'value': topping,
            'checked': ''
          });
        }).join('');

        helpers.buildHtmlFromTemplate('pizzaBuilder', templateData, function(err, str) {
          if (!err && str) {
            callback(httpStatuses.SUCCESS.code, str, CONTENT_TYPE_HTML);
          } else {
            callback(httpStatuses.ERROR_FINDING_DOCUMENT.code, undefined, CONTENT_TYPE_HTML)
          }
        });
      });
    });
  } else {
    callback(httpStatuses.METHOD_NOT_ALLOWED.code, undefined, CONTENT_TYPE_HTML);
  }
};

htmlHandlers.orders = function(data, callback) {
  if (data.method = GET) {
    const templateData = {
      'head.title': 'Orders',
      'head.description': 'All your orders are listed here',
      'body.class': 'orders'
    };
    helpers.buildHtmlFromTemplate('orders', templateData, function(err, str) {
      if (!err && str) {
        callback(httpStatuses.SUCCESS.code, str, CONTENT_TYPE_HTML);
      } else {
        callback(httpStatuses.ERROR_FINDING_DOCUMENT.code, undefined, CONTENT_TYPE_HTML)
      }
    });
  } else {
    callback(httpStatuses.METHOD_NOT_ALLOWED.code, undefined, CONTENT_TYPE_HTML);
  }
};

htmlHandlers.favicon = function(data, callback) {
  helpers.getStaticAsset('favicon.ico', function(err, data) {
    if (!err && data) {
      callback(200, data, 'favicon');
    } else {
      callback(httpStatuses.NOT_FOUND.code);
    }
  });
}

htmlHandlers.public = function(data, callback) {
  if (data.method = GET) {
    // Get the filename being requested
    var trimmedAssetName = data.path.replace('public/', '').trim();
    if (trimmedAssetName.length > 0) {
      helpers.getStaticAsset(trimmedAssetName, function(err, data) {
        if (!err && data) {
          // Determine the content type (default to plain text)
          var contentType = 'plain';
          if (trimmedAssetName.indexOf('.css') > -1) {
            contentType = 'css';
          }

          if (trimmedAssetName.indexOf('.png') > -1) {
            contentType = 'png';
          }

          if (trimmedAssetName.indexOf('.jpg') > -1) {
            contentType = 'jpg';
          }

          if (trimmedAssetName.indexOf('.ico') > -1) {
            contentType = 'favicon';
          }

          // Callback the data
          callback(200, data, contentType);
        } else {
          callback(httpStatuses.NOT_FOUND.code);
        }
      });
    } else {
      callback(httpStatuses.NOT_FOUND.code);
    }

  } else {
    callback(httpStatuses.METHOD_NOT_ALLOWED.code, undefined, CONTENT_TYPE_HTML);
  }
}

module.exports = htmlHandlers;
