/*
 * Frontend Logic for application
 *
 */

// Container for frontend application
var app = {};

// Config
app.config = {
  'sessionToken': false
};

// AJAX Client (for RESTful API)
app.client = {}

// Interface for making API calls
app.client.request = function(headers, path, method, queryStringObject, payload, callback) {

  // Set defaults
  headers = typeof(headers) == 'object' && headers !== null
    ? headers
    : {};
  path = typeof(path) == 'string'
    ? path
    : '/';
  method = typeof(method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) > -1
    ? method.toUpperCase()
    : 'GET';
  queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null
    ? queryStringObject
    : {};
  payload = typeof(payload) == 'object' && payload !== null
    ? payload
    : {};
  callback = typeof(callback) == 'function'
    ? callback
    : false;

  // For each query string parameter sent, add it to the path
  var requestUrl = path + '?';
  var counter = 0;
  for (var queryKey in queryStringObject) {
    if (queryStringObject.hasOwnProperty(queryKey)) {
      counter++;
      // If at least one query string parameter has already been added, preprend new ones with an ampersand
      if (counter > 1) {
        requestUrl += '&';
      }
      // Add the key and value
      requestUrl += queryKey + '=' + queryStringObject[queryKey];
    }
  }

  // Form the http request as a JSON type
  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-type", "application/json");

  // For each header sent, add it to the request
  for (var headerKey in headers) {
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey]);
    }
  }

  // If there is a current session token set, add that as a header
  if (app.config.sessionToken) {
    xhr.setRequestHeader("token", app.config.sessionToken.id);
    xhr.setRequestHeader("email", app.config.sessionToken.email);
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      var statusCode = xhr.status;
      var responseReturned = xhr.responseText;

      // Callback if requested
      if (callback) {
        try {
          var parsedResponse = JSON.parse(responseReturned);
          callback(statusCode, parsedResponse);
        } catch (e) {
          callback(statusCode, false);
        }

      }
    }
  }

  // Send the payload as JSON
  var payloadString = JSON.stringify(payload);
  xhr.send(payloadString);

};

// Bind the logout button
app.bindLogoutButton = function() {
  document.getElementById("logoutButton").addEventListener("click", function(e) {

    // Stop it from redirecting anywhere
    e.preventDefault();

    // Log the user out
    app.logUserOut();

  });
};

// Log the user out then redirect them
app.logUserOut = function(redirectUser) {
  // Set redirectUser to default to true
  redirectUser = typeof(redirectUser) == 'boolean'
    ? redirectUser
    : true;

  // Get the current token id
  var tokenId = typeof(app.config.sessionToken.id) == 'string'
    ? app.config.sessionToken.id
    : false;

  // Send the current token to the tokens endpoint to delete it
  var queryStringObject = {
    'id': tokenId
  };
  app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, function(statusCode, responsePayload) {
    // Set the app.config token as false
    app.setSessionToken(false);

    // Send the user to the logged out page
    if (redirectUser) {
      window.location = '/session/deleted';
    }

  });
};

app.handleFormSubmit = function(e) {

  // Stop it from submitting
  e.preventDefault();
  var formId = this.getAttribute('id');
  var path = this.getAttribute('action');
  var method = this.getAttribute('method').toUpperCase();

  // Hide the error message (if it's currently shown due to a previous error)
  if (document.querySelector("#" + formId + " .formError")) {
    document.querySelector("#" + formId + " .formError").style.display = 'none';
  }

  // Hide the success message (if it's currently shown due to a previous error)
  if (document.querySelector("#" + formId + " .formSuccess")) {
    document.querySelector("#" + formId + " .formSuccess").style.display = 'none';
  }

  // Turn the inputs into a payload
  var payload = {};
  var elements = this.elements;
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].type !== 'submit') {
      // Determine class of element and set value accordingly
      var classOfElement = typeof(elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0
        ? elements[i].classList.value
        : '';
      var valueOfElement = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1
        ? elements[i].checked
        : classOfElement.indexOf('intval') == -1
          ? elements[i].value
          : parseInt(elements[i].value);
      var elementIsChecked = elements[i].checked;
      // Override the method of the form if the input's name is _method
      var nameOfElement = elements[i].name;
      if (nameOfElement == '_method') {
        method = valueOfElement;
      } else {
        // Create an payload field named "method" if the elements name is actually httpmethod
        if (nameOfElement == 'httpmethod') {
          nameOfElement = 'method';
        }
        // Create an payload field named "id" if the elements name is actually uid
        if (nameOfElement == 'uid') {
          nameOfElement = 'id';
        }
        // If the element has the class "multiselect" add its value(s) as array elements
        if (classOfElement.indexOf('multiselect') > -1) {
          if (elementIsChecked) {
            payload[nameOfElement] = typeof(payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array
              ? payload[nameOfElement]
              : [];
            payload[nameOfElement].push(valueOfElement);
          }
        } else if (nameOfElement) {
          //if its a radio button, store only the checked value.
          if (elements[i].type === 'radio') {
            if (elementIsChecked) {
              payload[nameOfElement] = valueOfElement;
            }
          } else {
            payload[nameOfElement] = valueOfElement;
          }
        }
      }
    }
  }

  // If the method is DELETE, the payload should be a queryStringObject instead
  var queryStringObject = method == 'DELETE'
    ? payload
    : {};

  // Call the API
  app.client.request(undefined, path, method, queryStringObject, payload, function(statusCode, responsePayload) {
    // Display an error on the form if needed
    if (statusCode !== 200) {

      if (statusCode == 403) {
        // log the user out
        app.logUserOut();

      } else {

        // Try to get the error from the api, or set a default error message
        var error = typeof(responsePayload.Error) == 'string'
          ? responsePayload.Error
          : 'An error has occured, please try again';

        // Set the formError field with the error text
        document.querySelector("#" + formId + " .formError").innerHTML = error;

        // Show (unhide) the form error field on the form
        document.querySelector("#" + formId + " .formError").style.display = 'block';
      }
    } else {
      // If successful, send to form response processor
      app.formResponseProcessor(formId, payload, responsePayload);
    }

  });
};

// Bind the forms
app.bindForms = function() {
  if (document.querySelector("form")) {
    var allForms = document.querySelectorAll("form");
    for (var i = 0; i < allForms.length; i++) {
      // check if the form already has a submit event handlers attached before attaching one.
      if (!allForms[i].getAttribute("isFormSubmitEventHandlerSet")) {
        allForms[i].addEventListener("submit", function(e) {
          var self = this;
          app.handleFormSubmit.call(self, e);
        });
        //record the fact a submit event listener is already attached to avoid attaching again.
        allForms[i].setAttribute("isFormSubmitEventHandlerSet", true)
      }
    }
  }
};

// Form response processor
app.formResponseProcessor = function(formId, requestPayload, responsePayload) {
  var functionToCall = false;
  // If account creation was successful, try to immediately log the user in
  if (formId == 'accountCreate') {
    // Take the email and password, and use it to log the user in
    var newPayload = {
      'email': requestPayload.email,
      'password': requestPayload.password
    };

    app.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload, function(newStatusCode, newResponsePayload) {
      // Display an error on the form if needed
      if (newStatusCode !== 200) {

        // Set the formError field with the error text
        document.querySelector("#" + formId + " .formError").innerHTML = 'Sorry, an error has occured. Please try again.';

        // Show (unhide) the form error field on the form
        document.querySelector("#" + formId + " .formError").style.display = 'block';

      } else {
        // If successful, set the token and redirect the user
        app.setSessionToken(newResponsePayload);
        window.location = '/cart';
      }
    });
  }
  // If login was successful, set the token in localstorage and redirect the user
  if (formId == 'sessionCreate') {
    app.setSessionToken(responsePayload);
    window.location = '/cart';
  }

  // If forms saved successfully and they have success messages, show them
  var formsWithSuccessMessages = ['accountEdit', 'changePassword', 'checksEdit1'];
  if (formsWithSuccessMessages.indexOf(formId) > -1) {
    document.querySelector("#" + formId + " .formSuccess").style.display = 'block';
  }

  // If the user just deleted their account, redirect them to the account-delete page
  if (formId == 'accountDelete') {
    app.logUserOut(false);
    window.location = '/account/deleted';
  }

  // redraw the cart page upon adding or deleting an item to or from the cart respectively
  if (formId == 'cart' || formId == 'pizzaBuilder' || formId.indexOf("deleteCartItem-") > -1) {
    app.loadCart();
  }

  //redirect to offers page upon succesfully creating an order.
  if (formId == 'orderCreate') {
    window.location = '/orders'
  }
};

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function() {
  var tokenString = localStorage.getItem('token');
  if (typeof(tokenString) == 'string') {
    try {
      var token = JSON.parse(tokenString);
      app.config.sessionToken = token;
      if (typeof(token) == 'object') {
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }
    } catch (e) {
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function(add) {
  var target = document.querySelector("body");
  if (add) {
    target.classList.add('loggedIn');
  } else {
    target.classList.remove('loggedIn');
  }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = function(token) {
  app.config.sessionToken = token;
  var tokenString = JSON.stringify(token);
  localStorage.setItem('token', tokenString);
  if (typeof(token) == 'object') {
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

// Renew the token
app.renewToken = function(callback) {
  var currentToken = typeof(app.config.sessionToken) == 'object'
    ? app.config.sessionToken
    : false;
  if (currentToken) {
    // Update the token with a new expiration
    var payload = {
      'id': currentToken.id,
      'extend': true
    };
    app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, function(statusCode, responsePayload) {
      // Display an error on the form if needed
      if (statusCode == 200) {
        // Get the new token details
        var queryStringObject = {
          'id': currentToken.id
        };
        app.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined, function(statusCode, responsePayload) {
          // Display an error on the form if needed
          if (statusCode == 200) {
            app.setSessionToken(responsePayload);
            callback(false);
          } else {
            app.setSessionToken(false);
            callback(true);
          }
        });
      } else {
        app.setSessionToken(false);
        callback(true);
      }
    });
  } else {
    app.setSessionToken(false);
    callback(true);
  }
};

// Load data on the page
app.loadDataOnPage = function() {
  // Get the current page from the body class
  var bodyClasses = document.querySelector("body").classList;
  var primaryClass = typeof(bodyClasses[0]) == 'string'
    ? bodyClasses[0]
    : false;

  // Logic for account settings page
  if (primaryClass == 'accountEdit') {
    app.loadAccountEditPage();
  } else if (primaryClass == 'cart') {
    app.loadCartPage(); // pull the data for the cart page and show it
  } else if (primaryClass == 'orders') {
    app.loadOrdersPage(); // pull the data for the orders page and show it
  }
};

// Load the account edit page specifically
app.loadAccountEditPage = function() {
  // Get the email number from the current token, or log the user out if none is there
  var email = typeof(app.config.sessionToken.email) == 'string'
    ? app.config.sessionToken.email
    : false;
  if (email) {
    // Fetch the user data
    var queryStringObject = {
      'email': email
    };
    app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, function(statusCode, responsePayload) {
      if (statusCode == 200) {
        // Put the data into the forms as values where needed
        document.querySelector("#accountEdit .nameInput").value = responsePayload.name;
        document.querySelector("#accountEdit .addressInput").value = responsePayload.address;
        document.querySelector("#accountEdit .displayEmailInput").value = responsePayload.email;

        // Put the hidden phone field into both forms
        var hiddenEmailInputs = document.querySelectorAll("input.hiddenEmailInput");
        for (var i = 0; i < hiddenEmailInputs.length; i++) {
          hiddenEmailInputs[i].value = responsePayload.email;
        }

      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
};

// Sets up the cart page event handlers and then loads the data for the cart page.
app.loadCartPage = function() {
  // attach even to the pizza builder button to the pizza builder view.
  document.getElementById("pizzaBuilderButton").addEventListener("click", function(e) {
    // Stop it from redirecting anywhere
    e.preventDefault();
    app.loadPizzaBuilderUI();
  });
  // attach event to cancel button to cancel from pizza builder view.
  document.getElementById("cancelPizzaBuilder").addEventListener("click", function(e) {
    // Stop it from redirecting anywhere
    e.preventDefault();
    app.loadCart();
  });
  app.loadCart();
};

//loads the data for the card page.
app.loadCart = function() {
  app.client.request(undefined, 'api/cart', 'GET', undefined, undefined, function(statusCode, response) {
    if (statusCode == 200) {
      const html = app.buildCartItemsHtml(response.cart);
      // upon successful construction of html, update the html accordingly
      if (html) {
        document.getElementById("cartItems").innerHTML = html;
        document.getElementById("cartItems").setAttribute("class", "show");
        document.getElementById("emptyCart").setAttribute("class", "hide");
        document.getElementById("pizzaBuilder").setAttribute("class", "hide");
        app.bindForms();
      } else {
        document.getElementById("cartItems").setAttribute("class", "hide");
        document.getElementById("emptyCart").setAttribute("class", "show");
        document.getElementById("pizzaBuilder").setAttribute("class", "hide");
      }
    } else {
      // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
      app.logUserOut();
    }
  });
}

// helper function to build the cart items html but the order button.
app.buildCartItemsHtml = function(cartItems) {
  if (cartItems) {
    let html = '';
    let cartTotal = 0;
    cartItems.forEach(function(cartItem) {
      cartTotal += cartItem.itemTotal;
      html += app.buildCartItemHtml(cartItem);
    });

    html += '<div class="cartTotal">Cart Total : ' + app.formatMoney(cartTotal, '$') + '</div>';
    html += '<div><form id="orderCreate" action="/api/order" method="POST"><div class="inputWrapper ctaWrapper"><button type="submit" class="cta green">Order Now!</button></div></form></div>';

    return html;
  }
  return '';
}

// helper function to build the individual cart item with option to delete the item.
app.buildCartItemHtml = function(cartItem) {
  if (cartItem) {
    return `<div class="cartItem">
      <div class="details">
        <div>${cartItem.size.name} ${cartItem.crust.name} ${cartItem.meat} pizza with ${cartItem.sauce} sauce</div>
        <div class="toppings">Toppings - ${cartItem.toppings.toString()}</div>
      </div>
      <div class="price">${app.formatMoney(cartItem.itemTotal, '$')}</div>
      <form id="deleteCartItem-${cartItem.id}" action="/api/cart" method="DELETE" class="delete"><input type="hidden" name="id" value="${cartItem.id}"/><button type="submit">x</button></form>
    </div>`
  }
  return '';
}

// helper function to setup and show the pizza builder ui
app.loadPizzaBuilderUI = function() {
  app.client.request(undefined, 'api/menu', 'GET', undefined, undefined, function(statusCode, response) {
    if (statusCode == 200) {
      const html = app.buildPizzaBuilderHtml(response.selection);
      if (html) {
        document.getElementById("pizzaBuilderInputs").innerHTML = html;
        document.getElementById("cartItems").setAttribute("class", "hide");
        document.getElementById("emptyCart").setAttribute("class", "hide");
        document.getElementById("pizzaBuilder").setAttribute("class", "show");
      }
    } else {
      // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
      app.logUserOut();
    }
  });
}

// helper function to build the pizza builder ui which has the selection options to configure a pizza and add it to cart
app.buildPizzaBuilderHtml = function(menuSelection) {
  if (menuSelection) {
    let html = '';

    //html for size selection
    html += app.buildPizzaBuilderField('Size', menuSelection.sizes.map((size) => {
      return app.buildInputHtml({
        'name': 'size',
        'value': size.name,
        'checked': size.default
          ? 'checked'
          : '',
        'inputType': 'radio'
      })
    }).join(''));

    //html for crust selection
    html += app.buildPizzaBuilderField('Crust', menuSelection.crusts.map((crust) => {
      return app.buildInputHtml({
        'name': 'crust',
        'value': crust.name,
        'checked': crust.price === 0
          ? 'checked'
          : '',
        'inputType': 'radio',
        'class': ''
      });
    }).join(''));

    //html for meat selection
    html += app.buildPizzaBuilderField('Meat', menuSelection.meats.map((meat) => {
      return app.buildInputHtml({
        'name': 'meat',
        'value': meat,
        'checked': meat === 'Chicken'
          ? 'checked'
          : '',
        'inputType': 'radio',
        'class': ''
      });
    }).join(''));

    //html for sauce selection
    html += app.buildPizzaBuilderField('Sauce', menuSelection.sauces.map((sauce) => {
      return app.buildInputHtml({
        'name': 'sauce',
        'value': sauce,
        'checked': sauce === 'Regular'
          ? 'checked'
          : '',
        'inputType': 'radio',
        'class': ''
      });
    }).join(''));

    //html for toppings selection
    html += app.buildPizzaBuilderField('Toppings', menuSelection.toppings.map((topping) => {
      return app.buildInputHtml({'name': 'toppings', 'value': topping, 'checked': '', 'inputType': 'checkbox', 'class': 'multiselect'});
    }).join(''));

    return html;
  }
  return '';
}

// helper function for each field of pizza builder ui
app.buildPizzaBuilderField = function(fieldName, html) {
  return `<div class="inputWrapper">
    <div class="inputLabel">${fieldName}</div>
    ${html}
  </div>`;
}

// helper function for inputs used in the pizza builder
app.buildInputHtml = function(data) {
  return `<div class="inline-box regular">
    <label for="${data.value}"><input type="${data.inputType}" id="${data.value}" name="${data.name}" value="${data.value}" ${data.checked} class="${data.class}"> ${data.value}</label>
  </div>`;
}

// helper function to print the money in dollars from cents
app.formatMoney = function(amount, currencySymbol) {
  return currencySymbol + (amount / 100);
}

// Load the orders page
app.loadOrdersPage = function() {
  var email = typeof(app.config.sessionToken.email) == 'string'
    ? app.config.sessionToken.email
    : false;
  if (email) {
    // Fetch the user data
    var queryStringObject = {
      'email': email
    };
    app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, function(statusCode, response) {
      if (statusCode == 200) {
        if (response && response.orders && response.orders.length) {
          response.orders.reverse(); // reversing the array as recently in the last element in the array
          //loads all the orders of this users parallely.
          app.parallelCalls(response.orders.map(function(orderId) {
            return function(callback) {
              app.client.request(undefined, 'api/order', 'GET', {
                'id': orderId
              }, undefined, function(statusCode, orderDetails) {
                if (statusCode == 200) {
                  callback(false, orderDetails);
                } else {
                  callback(Error(statusCode));
                }
              });
            }
          }), function(err, orders) {
            if (err) {
              document.querySelector(".orders .formError").innerHTML = "Error loading orders, Please try again by refreshing the page."
            } else {
              if (document.querySelector(".orders .formError")) {
                document.querySelector(".orders .formError").style.display = 'none';
              }

              const html = app.buildOrdersHtml(orders);
              if (html) {
                if (document.querySelector(".orders #noOrders")) {
                  document.querySelector(".orders #noOrders").style.display = 'none';
                }
                document.getElementById("ordersList").innerHTML = html;
              } else {
                document.getElementById("ordersList").style.display = 'none';
              }
            }
          })
        } else {}
      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
};

// helper function to build orders html
app.buildOrdersHtml = function(orders) {
  if (orders) {
    let html = '';
    orders.forEach(function(order) {
      let orderHtml = '';
      if (order && order.items) {
        orderHtml += '<div class="orderItem">';
        orderHtml += `<div class="lineItem">Order Id: <span class="dimmed">${order.id}</span></div>`;
        if(order.created){
          orderHtml += `<div class="lineItem">Date &amp; Time : <span class="dimmed">${(new Date(order.created)).toLocaleString()}</span></div>`;
        }
        order.items.forEach(function(cartItem) {
          orderHtml += `<div class="cartItem">
              <div class="details">
                <div>${cartItem.size.name} ${cartItem.crust.name} ${cartItem.meat} pizza with ${cartItem.sauce} sauce</div>
                <div class="toppings">Toppings - ${cartItem.toppings.toString()}</div>
              </div>
              <div class="price">${app.formatMoney(cartItem.itemTotal, '$')}</div>
            </div>`;
        });
        orderHtml += `<div class="orderTotal">Order Total: <span class="amount">${app.formatMoney(order.totalAmount, '$')}</span></div>`;
        orderHtml += '</div>';
        html += orderHtml;
      }
    });
    return html;
  }
  return '';
}

// utility to call multiple functions parallely
app.parallelCalls = function(fns, callback) {
  const totalFns = fns.length;
  let results = [];
  let returnedResult = false;
  let resultCount = 0;

  const eachFnCallback = function(index) {
    return function(err, response) {
      if (!returnedResult) {
        if (err) {
          returnedResult = true;
          callback(err);
        } else {
          resultCount++;
          results[index] = response;
          if (resultCount === totalFns) {
            returnedResult = true;
            callback(null, results);
          }
        }
      }
    };
  }

  fns.forEach(function(fn, index) {
    fn(eachFnCallback(index))
  });
}

// Loop to renew token often
app.tokenRenewalLoop = function() {
  setInterval(function() {
    app.renewToken(function(err) {
      if (!err) {
        console.log("Token renewed successfully @ " + Date.now());
      }
    });
  }, 1000 * 60);
};

// Init (bootstrapping)
app.init = function() {

  // Bind all form submissions
  app.bindForms();

  // Bind logout logout button
  app.bindLogoutButton();

  // Get the token from localstorage
  app.getSessionToken();

  // Renew token
  app.tokenRenewalLoop();

  // Load data on page
  app.loadDataOnPage();

};

// Call the init processes after the window loads
window.onload = function() {
  app.init();
};
