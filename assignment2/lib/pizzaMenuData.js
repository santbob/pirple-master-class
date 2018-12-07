
// init the menu object
const menu = {
  "name": "Pizza Selections",
  "selection": {
    "crusts": [{
      "name": "Thin",
      "price": 200,
    }, {
      "name": "Hand Tossed",
      "price": 0,
    }, {
      "name": "Original Pan Pizza",
      "price": 300,
    }],
    "toppings": ["Mushrooms", "Red Onions", "Olives", "Jalapeno", "Tomatoes", "Banana Pepers", "Green Bell Peppers", "Spinach", "Garlic", "Pineapple"],
    "pricePerTopping": 100,
    "meats": ["Chicken", "Bacon", "Beef", "Pepperoni", "Italian sausage", "Ham", "Pork", "NoMeat"],
    "sauces": ["Buffalo", "Marinara", "Alfredo", "BBQ", "Regular"],
    "sizes": [{
      "name": "Large",
      "price": 1500,
    }, {
      "name": "Medium",
      "price": 1000,
      "default": true
    }, {
      "name": "Small",
      "price": 500,
    }]
  }
};

module.exports = menu;
