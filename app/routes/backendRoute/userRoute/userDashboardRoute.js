const express = require('express')
const userDashboardController = require('../../../module/backend_module/user/controller/webController/userDashboardController')
const {userAuth}=require('../../../middleware/authCheck')
const uploadUserImage = require('../../../helper/userImage')
const userDashboardRouter = express.Router()


// .............................USER DASHBOAARD.................................


userDashboardRouter.get('/dashboard',userAuth,userDashboardController.userDashboard)
userDashboardRouter.post('/update-status',userDashboardController.updateStatus)

userDashboardRouter.get('/all-task',userAuth,userDashboardController.getAllTasks)
userDashboardRouter.get('/viewprofile',userAuth,userDashboardController.viewprofile)
userDashboardRouter.get('/editprofile/:id',userAuth, uploadUserImage.single('image'),userDashboardController.updateprofile)
userDashboardRouter.post('/updateprofile/:id',userAuth, uploadUserImage.single('image'),userDashboardController.updateuserprofile)

userDashboardRouter.get('/all-assign-task',userAuth,userDashboardController.getAllAssignTasks)
userDashboardRouter.get('/all-complete-task',userAuth,userDashboardController.getAllCompleteTasks)



module.exports = userDashboardRouter