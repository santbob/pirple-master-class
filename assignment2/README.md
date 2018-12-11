# Pirple Pizza

This project is assignment#2 of the NodeJS Master class from pirple. The aim is build a backend for the Pizza Delivery app where a user can create an account, lookup pizza options, make an order which inturn should take payment and send out the Order confirmation email.

## Steps to test

1. Clone or download the project
2. create folder `users`, `tokens`, `orders` under the `.data` folder
3. setup the following environment variables in the terminal
   1. `MAILGUN_API_SECRET_KEY` - the secret Key for the mailgun api, example api:f0asdlkjfdsjjweor-oweuroewur-ddfjkdkf
   2. `MAILGUN_SANDBOX_NAME` - the sandbox environment name created for you in the mailgun account, ex. sandbox122323232
   3. `STRIPE_API_SECRET_KEY` - the secret key for using stripe api ex. sk_test_34343493943984
4. once the environment variable are set, run `node .`
