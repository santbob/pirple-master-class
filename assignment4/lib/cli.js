/*
 * File handling CLI commands
 *
 */

//Dependencies
const readline = require('readline');
const util = require('util');
const events = require('events');
class _events extends events {};
const e = new _events();
const pizzaMenuData = require('./pizzaMenuData');
const helpers = require('./helpers');
const _data = require('./data');

//instantiate the cli object to be exported
const cli = {};

// Create a vertical space
const verticalSpace = function(lines) {
  lines = typeof(lines) == 'number' && lines > 0
    ? lines
    : 1;
  for (i = 0; i < lines; i++) {
    console.log('');
  }
};

// Create a horizontal line across the screen
const horizontalLine = function() {

  // Get the available screen size
  var width = process.stdout.columns;

  // Put in enough dashes to go across the screen
  var line = '';
  for (i = 0; i < width; i++) {
    line += '-';
  }
  console.log(line);

};

// Create centered text on the screen
const centered = function(str) {
  str = typeof(str) == 'string' && str.trim().length > 0
    ? str.trim()
    : '';

  // Get the available screen size
  var width = process.stdout.columns;

  // Calculate the left padding there should be
  var leftPadding = Math.floor((width - str.length) / 2);

  // Put in left padded spaces before the string itself
  var line = '';
  for (i = 0; i < leftPadding; i++) {
    line += ' ';
  }
  line += str;
  console.log(line);
};

// define responders for events
const responders = {};

// exits the cli
responders.exit = function(str) {
  process.exit(0);
}

// Help / Man
responders.help = function(str) {
  // Show a header for the help page that is as wide as the screen
  horizontalLine();
  centered('Pirple Pizza Manual');
  horizontalLine();
  verticalSpace(2);

  // Show each command, followed by its explanation, in white and yellow respectively
  commandsConfiguration.forEach(function(command) {
    var line = '      \x1b[33m ' + command.name + " " + command.params + '      \x1b[0m';
    var padding = 60 - line.length;
    for (i = 0; i < padding; i++) {
      line += ' ';
    }
    line += command.description;
    console.log(line);
    verticalSpace();
  });

  verticalSpace(1);

  // End with another horizontal line
  horizontalLine();
}

// returns the menu options of pirple pizza
responders.menu = function(str) {
  verticalSpace();
  centered('Pirple Pizza Menu');
  verticalSpace(1);
  console.log("Sizes - ", pizzaMenuData.selection.sizes.map((size) => {
    return `${size.name} (${helpers.formatMoney(size.price, '$')})`;
  }).join(','));
  console.log("Crusts - ", pizzaMenuData.selection.crusts.map((crust) => {
    return `${crust.name} (${helpers.formatMoney(crust.price, '$')})`;
  }).join(','));
  console.log("Meats - ", pizzaMenuData.selection.meats.map((meat) => {
    return `${meat}`;
  }).join(','));
  console.log("Meats - ", pizzaMenuData.selection.sauces.map((sauce) => {
    return `${sauce}`;
  }).join(','));
  console.log(`Toppings (${helpers.formatMoney(pizzaMenuData.selection.pricePerTopping, '$')} per topping) - `, pizzaMenuData.selection.toppings.map((topping) => {
    return `${topping}`;
  }).join(','));
  verticalSpace(2);
}

// list the orders created in the last N hrs, default is 24hrs
responders.orders = function(str) {
  verticalSpace();
  const arr = str.split('--');
  const hrs = typeof(arr[1]) == 'string' && !isNaN(parseInt(arr[1], 10))
    ? parseInt(arr[1], 10)
    : 24;

  const startTime = Date.now() - (hrs * 3600000);
  console.log(`Orders from last ${hrs} hours`);
  verticalSpace();
  _data.list('orders', function(err, fileNames) {
    if (!err && fileNames) {
      fileNames.forEach(function(fileName) {
        _data.fileStat('orders', fileName, function(err, stat) {
          if (stat && stat.birthtimeMs && stat.birthtimeMs > startTime) {
            console.log(fileName);
          }
        })
      });
    }
  });
}

// returns the full info of the offer
responders.orderInfo = function(str) {
  var arr = str.split('--');
  var orderId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0
    ? arr[1].trim()
    : false;
  if (orderId) {
    // Lookup the user
    _data.read('orders', orderId, function(err, orderData) {
      if (!err && orderData) {
        // Print their JSON object with text highlighting
        verticalSpace();

        //converts the complex objects in items to simple strings to display properly
        orderData.items.forEach((item, index) => {
          item['size'] = item['size'].name + '(' + helpers.formatMoney(item['size'].price, '$') + ')';
          item['crust'] = item['crust'].name + '(' + helpers.formatMoney(item['crust'].price, '$') + ')';
          item['toppings'] = item['toppings'].join(', ');
        });

        console.dir(orderData, {'colors': true});
        verticalSpace();
      }
    });
  }
}

// list the new users signed up in the last N hrs, default is 24hrs
responders.newUsers = function(str) {
  verticalSpace();
  const arr = str.split('--');
  const hrs = typeof(arr[1]) == 'string' && !isNaN(parseInt(arr[1], 10))
    ? parseInt(arr[1], 10)
    : 24;

  const startTime = Date.now() - (hrs * 3600000);
  console.log(`New Users from last ${hrs} hours`);
  verticalSpace();
  _data.list('users', function(err, userFileNames) {
    if (!err && userFileNames) {
      userFileNames.forEach(function(fileName) {
        _data.fileStat('users', fileName, function(err, stat) {
          if (stat && stat.birthtimeMs && stat.birthtimeMs > startTime) {
            console.log(fileName);
          }
        })
      });
    }
  });
}

// returns the full info of the given user
responders.userInfo = function(str) {
  var arr = str.split('--');
  var email = typeof(arr[1]) == 'string' && arr[1].trim().length > 0
    ? arr[1].trim()
    : false;
  if (email) {
    // Lookup the user
    _data.read('users', email, function(err, userData) {
      if (!err && userData) {
        // Remove the hashed password
        delete userData.hashedPassword;

        // Print their JSON object with text highlighting
        verticalSpace();
        console.dir(userData, {'colors': true});
        verticalSpace();
      }
    });
  }
}

// commands supports by the cli
const commandsConfiguration = [
  {
    name: 'exit',
    params: '',
    description: 'Kill the CLI (and the rest of the application)',
    responder: responders.exit
  }, {
    name: 'man',
    params: '',
    description: 'Show this help page',
    responder: responders.help
  }, {
    name: 'help',
    params: '',
    description: 'Alias for man page, Show this help page',
    responder: responders.help
  }, {
    name: 'menu',
    params: '',
    description: 'Shows the menu options',
    responder: responders.menu
  }, {
    name: 'orders',
    params: '--{hrs}',
    description: 'Shows the orders in the last N hrs, if not provided default is 24hrs',
    responder: responders.orders
  }, {
    name: 'order info',
    params: '--{orderId}',
    description: 'Show details of a specified offer',
    responder: responders.orderInfo
  }, {
    name: 'list new users',
    params: '--{hrs}',
    description: 'Shows the users signed up in the last N hrs, if not provided default is 24hrs',
    responder: responders.newUsers
  }, {
    name: 'user info',
    params: '--{email}',
    description: 'Show details of a specified offer',
    responder: responders.userInfo
  }
];

// attach event handlers
const supportedCommands = [];
commandsConfiguration.forEach(function(command) {
  supportedCommands.push(command.name);
  e.on(command.name, command.responder);
});

// process each line of input and trigger corresponding event
const processCliInput = function(str) {
  str = typeof(str) == 'string' && str.trim().length > 0
    ? str.trim()
    : false;
  // process the line text only if its truthy
  if (str) {
    // Go through the possible inputs, emit event when a match is found
    var matchFound = false;
    var counter = 0;
    supportedCommands.some(function(command) {
      if (str.toLowerCase().indexOf(command) > -1) {
        matchFound = true;
        // Emit event matching the unique input, and include the full string given
        e.emit(command, str);
        return true;
      }
    });

    // If no match is found, tell the user to try again
    if (!matchFound) {
      console.log("Command not supported");
    }
  }
}

cli.init = function() {

  // Send to console, in dark blue
  console.log('\x1b[36m%s\x1b[0m', 'The CLI is running');

  const _interface = readline.createInterface({input: process.stdin, output: process.stdout, prompt: ''});

  // Create an initial prompt
  _interface.prompt();

  // process each line.
  _interface.on('line', function(str) {

    // Send to the input processor
    processCliInput(str);

    // Re-Initialize the prompt again
    _interface.prompt();
  });
}

//export the module
module.exports = cli;
