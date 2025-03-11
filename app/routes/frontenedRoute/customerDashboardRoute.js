const express = require('express')
const CustomerController = require('../../../app/module/frontened_module/customer_dashboard/controller/webController/customerDashboardContrle')
const { customerAuth, adminAuth } = require('../../middleware/authCheck')
const uploadReviewImage = require('../../helper/reviewImage')

const CustomerRouter = express.Router()

// .............................CUSTOMER DASHBOAARD.................................c

CustomerRouter.get('/dashboard', CustomerController.customerDashboard)
CustomerRouter.get('/applyForService',customerAuth, CustomerController.applyforService)
CustomerRouter.post('/createticket', adminAuth, customerAuth, CustomerController.createTicket)

CustomerRouter.get('/about', CustomerController.aboutSection);
CustomerRouter.get('/contactPage', CustomerController.contactSectionPage);
CustomerRouter.post('/contact', CustomerController.contactSection);
CustomerRouter.get('/account', customerAuth, CustomerController.account);

// .............................CUSTOMER PROFILE.................................

CustomerRouter.get('/viewprofile', customerAuth, CustomerController.viewprofilePage);
CustomerRouter.get("/edit/:id", customerAuth, CustomerController.viewEditPage);
CustomerRouter.post("/update/:id", customerAuth, CustomerController.updateProfile);

// .............................CUSTOMER RAISE TICKET.................................

CustomerRouter.get("/allcompleteraisetickets", customerAuth, CustomerController.allCompleteRaiseTickets);
CustomerRouter.get("/allpendingraisetickets", customerAuth, CustomerController.allPendingRaiseTickets);

// .............................CUSTOMER UPDATE PASSWORD AND MAIL ID.................................

CustomerRouter.post('/update_password', customerAuth, CustomerController.updatePassword)
CustomerRouter.post('/update_mailId', customerAuth, CustomerController.updateMailId)


// .............................CUSTOMER PAYMENT METHOD.................................


CustomerRouter.get('/servicepage', customerAuth, CustomerController.service);

// .............................CUSTOMER REVIEW.................................

CustomerRouter.get("/review", customerAuth, CustomerController.reviewpage);
CustomerRouter.post("/submit-review", uploadReviewImage.single("image"), CustomerController.submitReview);

CustomerRouter.get('/logout', CustomerController.customerLogout)



module.exports = CustomerRouter