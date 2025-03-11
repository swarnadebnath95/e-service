const express = require('express')
const UserAuthenticationController = require('../../../module/backend_module/user/controller/webController/userAuthenticationController')
const { userAuth } = require('../../../middleware/authCheck');
const userRouter = express.Router()


// .............................USER LOGIN...........................................

userRouter.get("/loginPage",UserAuthenticationController.userLoginPage)
userRouter.post("/login",UserAuthenticationController.loginUser)
userRouter.get('/logout', UserAuthenticationController.userLogout)

userRouter.post('/update_password',userAuth, UserAuthenticationController.updatePassword)


module.exports = userRouter