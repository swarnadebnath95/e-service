const express = require('express')
const CustomerAuthenticationController = require('../../module/frontened_module/customer_authentication/controller/webcontroller/customerAuthController')
const customerAuthRouter = express.Router()


// .............................ADMIN REGISTRATION.................................

customerAuthRouter.get('/registerpage', CustomerAuthenticationController.registrationPage)
customerAuthRouter.post('/register', CustomerAuthenticationController.registerCustomer);
customerAuthRouter.get("/confirmation/:email/:token", CustomerAuthenticationController.confirmation);

// .............................ADMIN LOGIN...........................................

customerAuthRouter.get('/loginpage', CustomerAuthenticationController.loginPage)
customerAuthRouter.post('/login', CustomerAuthenticationController.loginCustomer)
customerAuthRouter.get('/logout', CustomerAuthenticationController.customerLogout)


module.exports = customerAuthRouter