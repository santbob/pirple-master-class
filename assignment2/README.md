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


## API Requests

**User Create**
```
Method: "POST"
Path: "/users"
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
Path: "/users?email=john.deo@example.com"
header: {"Content-Type": "application/json", "token": "token fetched from token create call"}
```

**User Update**
```
Method: "PUT"
Path: "/users?email=john.deo@example.com"
header: {"Content-Type": "application/json", "token": "token fetched from token create call"}
body: {
	"name": "John Doe",
	"address": "1 Letterman Drive, Suite D4700, San Francisco, CA 94129"
}
```

**User Delete**
```
Method: "DELETE"
Path: "/users?email=john.deo@example.com"
header: {"Content-Type": "application/json", "token": "token fetched from token create call"}
```

**Token Create**
```
Method: "POST"
Path: "/tokens"
header: {"Content-Type": "application/json"}
body: {
	"email": "john.doe@example.com",
	"password": "PirplePizz@"
}
```

**Token Read**
```
Method: "GET"
Path: "/tokens?id=koe3setjhem4dnhros7n"
```

**Token Update (Extending Token)**
```
Method: "PUT"
Path: "/tokens?id=koe3setjhem4dnhros7n"
body: {
	"extend": true
}
```

**Token Delete**
```
Method: "DELETE"
Path: "/tokens?id=koe3setjhem4dnhros7n"
```

**Menu Read**
```
Method: "GET"
Path: "/menu"
header: {"token": "koe3setjhem4dnhros7n", "email": "john.doe@example.com"}
```

**Cart Create/Update**
```
Method: "POST"
Path: "/cart"
header: {"Content-Type": "application/json","token": "koe3setjhem4dnhros7n", "email": "john.doe@example.com"}
body: {
	"items": [
		{
			"size": "Large",
			"crust": "Hand Tossed",
			"toppings": ["Jalapeno", "Olives", "Green Bell Peppers"],
			"sauce": "Buffalo",
			"meat": "Chicken"
		},{
			"size": "Medium",
			"crust": "Hand Tossed",
			"toppings": ["Tomatoes", "Mushrooms", "Green Bell Peppers"],
			"sauce": "BBQ",
			"meat": "Pepperoni"
		}	
	]
}
```

**Cart Read**
```
Method: "GET"
Path: "/cart?email=john.deo@example.com"
header: {"Content-Type": "application/json", "token": "koe3setjhem4dnhros7n", "email": "john.doe@example.com"}
```

**Cart Delete**
```
Method: "DELETE"
Path: "/cart?email=john.deo@example.com"
header: {"Content-Type": "application/json", "token": "koe3setjhem4dnhros7n", "email": "john.doe@example.com"}
```

**Order Create**
```
Method: "POST"
Path: "/order"
header: {"Content-Type": "application/json","token": "koe3setjhem4dnhros7n", "email": "john.doe@example.com"}
body: {}
```

## How to Test a Order flow.

Follow the steps to create an order.

1. Create an user using `User Create` api call
2. Create a token using `Token Create` api call by using same email and password used to create the user.
3. Use the token generated and email used in step 2 in the `Menu Read` call to see the list of options possible with the menu
4. Update the user carts by using the `Cart create/update` api call by configuring the items array appropriately.
5. Use the `Order Create` api to make payment and get the email confirmation.
6. Check the `User Read` or `Cart Read` api to verify if the cart is cleared.
