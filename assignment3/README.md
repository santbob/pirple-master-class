# Pirple Pizza

This project is assignment#2 of the NodeJS Master class from pirple. The aim is build a backend for the Pizza Delivery app where a user can create an account, lookup pizza options, make an order which inturn should take payment and send out the Order confirmation email.

## Steps to setup

1. Clone or download the project
2. create folder `users`, `tokens`, `orders` under the `.data` folder
3. setup the following environment variables in the terminal
   1. `MAILGUN_API_SECRET_KEY` - the secret Key for the mailgun api, example api:f0asdlkjfdsjjweor-oweuroewur-ddfjkdkf
   2. `MAILGUN_SANDBOX_NAME` - the sandbox environment name created for you in the mailgun account, ex. sandbox122323232
   3. `STRIPE_API_SECRET_KEY` - the secret key for using stripe api ex. sk_test_34343493943984
4. once the environment variable are set, run `node .`

## How to Test a Order flow.

Follow the steps below to create an order, api requests details are in the section below.

1. Create an user using `User Create` api call
2. Create a token using `Token Create` api call by using same email and password used to create the user.
3. Use the token generated and email used in step 2 in the `Menu Read` call to see the list of options possible with the menu
4. Update the user carts by using the `Cart create/update` api call by configuring the items array appropriately.
5. Use the `Order Create` api to make payment and get the email confirmation.
6. Check the `User Read` or `Cart Read` api to verify if the cart is cleared.

## API Requests

**User Create**
```
Method: "POST"
Path: "/api/users"
header: {"Content-Type": "application/json"}
body: {
	"name": "John Doe",
	"email": "john.doe@example.com",
	"password": "PirplePizz@",
	"address": "1 Letterman Drive, Suite D4700, San Francisco, CA 94129"
}
```

**User Read**
```
Method: "GET"
Path: "/api/users?email=john.deo@example.com"
header: {"Content-Type": "application/json", "token": "token fetched from token create call"}
```

**User Update**
```
Method: "PUT"
Path: "/api/users"
header: {"Content-Type": "application/json", "token": "token fetched from token create call"}
body: {
        "email": "john.doe@example.com",
	"name": "John Doe",
	"address": "1 Letterman Drive, Suite D4700, San Francisco, CA 94129"
}
```

**User Delete**
```
Method: "DELETE"
Path: "/api/users?email=john.deo@example.com"
header: {"Content-Type": "application/json", "token": "token fetched from token create call"}
```

**Token Create**
```
Method: "POST"
Path: "/api/tokens"
header: {"Content-Type": "application/json"}
body: {
	"email": "john.doe@example.com",
	"password": "PirplePizz@"
}
```

**Token Read**
```
Method: "GET"
Path: "/api/tokens?id=koe3setjhem4dnhros7n"
```

**Token Update (Extending Token)**
```
Method: "PUT"
Path: "/api/tokens"
body: {
        "id": "koe3setjhem4dnhros7n",
	"extend": true
}
```

**Token Delete**
```
Method: "DELETE"
Path: "/api/tokens?id=koe3setjhem4dnhros7n"
```

**Menu Read**
```
Method: "GET"
Path: "/api/menu"
header: {"token": "koe3setjhem4dnhros7n", "email": "john.doe@example.com"}
```

**Cart Create/Update**
```
Method: "POST"
Path: "/api/cart"
header: {"Content-Type": "application/json","token": "koe3setjhem4dnhros7n", "email": "john.doe@example.com"}
body: {
		
	"size": "Large",
	"crust": "Hand Tossed",
	"toppings": ["Jalapeno", "Olives", "Green Bell Peppers"],
	"sauce": "Buffalo",
	"meat": "Chicken"
		
}
```

**Cart Read**
```
Method: "GET"
Path: "/api/cart"
header: {"Content-Type": "application/json", "token": "koe3setjhem4dnhros7n", "email": "john.doe@example.com"}
```

**Cart Delete**
```
Method: "DELETE"
Path: "/api/cart"
header: {"Content-Type": "application/json", "token": "koe3setjhem4dnhros7n", "email": "john.doe@example.com"}
```

**Order Create**
```
Method: "POST"
Path: "/api/order"
header: {"Content-Type": "application/json","token": "koe3setjhem4dnhros7n", "email": "john.doe@example.com"}
body: {}
```

**Order Read**
```
Method: "GET"
Path: "/api/order?id=abcdefghij1234567890"
header: {"Content-Type": "application/json", "token": "koe3setjhem4dnhros7n", "email": "john.doe@example.com"}
```
