const express = require('express')
const AdminAuthenticationController = require('../../../module/backend_module/admin/controller/webController/adminAuthenticationController')
const uploadImage = require("../../../helper/image");
const { adminAuth } = require('../../../middleware/authCheck');
const adminRouter = express.Router()


// .............................ADMIN REGISTRATION.................................

adminRouter.get('/registerpage', AdminAuthenticationController.registrationPage)
adminRouter.post('/register', uploadImage.single('image'), AdminAuthenticationController.registerAdmin);
adminRouter.get("/confirmation/:email/:token", AdminAuthenticationController.confirmation);

// .............................ADMIN LOGIN...........................................

adminRouter.get('/loginpage', AdminAuthenticationController.loginPage)
adminRouter.post('/login', AdminAuthenticationController.loginAdmin)
adminRouter.get('/logout', AdminAuthenticationController.adminLogout)


// ....................................FORGET PASSWORD............................... 

adminRouter.get('/forget-passwordPage', AdminAuthenticationController.forgetPasswordpPage)
adminRouter.post('/forgot_password', AdminAuthenticationController.forgetPassword)

// ....................................RESET PASSWORD............................... 

adminRouter.get('/reset_passwordPage', AdminAuthenticationController.resetPWpage)
adminRouter.post('/password/reset', AdminAuthenticationController.resetPassword)

// ....................................UPDATE PASSWORD...............................

adminRouter.post('/update_password',adminAuth, AdminAuthenticationController.updatePassword)

adminRouter.get('/logout', AdminAuthenticationController.adminLogout)


module.exports = adminRouter