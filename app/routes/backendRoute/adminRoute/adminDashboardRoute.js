const express = require('express')
const AdminDashboardController = require('../../../module/backend_module/admin/controller/webController/adminDashboardController')
const { adminAuth,adminRolePermissionCheck } = require('../../../middleware/authCheck')
const notificationMiddleware=require('../../../middleware/notificationCheck')
const uploadImage = require("../../../helper/image");
const adminDashboardRouter = express.Router()


// .............................ADMIN DASHBOAARD.................................

adminDashboardRouter.get('/dashboard', adminAuth, adminRolePermissionCheck('view_dashboard'), AdminDashboardController.adminDashboardPage)

// .............................ADMIN DASHBOAARD PROFILE.................................

adminDashboardRouter.get('/viewprofile', adminAuth,notificationMiddleware,adminRolePermissionCheck('manage_profile'), AdminDashboardController.viewProfile)
adminDashboardRouter.get('/viewticket', adminAuth, adminAuth,adminRolePermissionCheck('view_ticket'),notificationMiddleware, AdminDashboardController.viewAllTickets)
adminDashboardRouter.post('/assign',adminAuth,notificationMiddleware,adminRolePermissionCheck('assign_ticket'), AdminDashboardController.assignTicket);
adminDashboardRouter.get("/edit/:id",adminAuth,adminRolePermissionCheck('manage_profile'),notificationMiddleware, uploadImage.single('image'), AdminDashboardController.viewEditPage);
adminDashboardRouter.post("/update/:id",adminAuth,adminRolePermissionCheck('manage_profile'), uploadImage.single('image'), AdminDashboardController.updateProfile);



// ...................................CREATE USER....................................

adminDashboardRouter.get('/viewcreateemployee', adminAuth,adminRolePermissionCheck('create_user'),notificationMiddleware, AdminDashboardController.viewCreateEmployee)
adminDashboardRouter.post('/createuser',adminAuth,adminRolePermissionCheck('create_user'), AdminDashboardController.createEmployee)
adminDashboardRouter.get('/deleteUserData/:id',adminAuth,adminRolePermissionCheck('delete_user'), notificationMiddleware,AdminDashboardController.deleteuserData)
adminDashboardRouter.get('/editemployeedata/:id',adminAuth,notificationMiddleware,AdminDashboardController.editEmployeeDetails)
adminDashboardRouter.post('/updateemployeedata/:id',adminAuth,notificationMiddleware,AdminDashboardController.updateEmployeeDetails)


// ...................................GET TICKET DETAILS BY STATUS....................................

adminDashboardRouter.get('/assigntaskstatus', adminAuth,adminRolePermissionCheck('view_ticket'),notificationMiddleware,AdminDashboardController.getAssignTasksByStatus)
adminDashboardRouter.get('/pendingtaskstatus', adminAuth,notificationMiddleware,AdminDashboardController.getPendingTasksByStatus)
adminDashboardRouter.get('/completetaskstatus', adminAuth,notificationMiddleware,AdminDashboardController.getCompleteTasksByStatus)


// ................................Route to mark notification as read.............................

adminDashboardRouter.get('/notification/:id/read',adminAuth,AdminDashboardController.markNotificationAsRead);


// ................................all enquery by customer.............................


adminDashboardRouter.get('/allenquery',adminAuth,adminRolePermissionCheck('manage_enquiry'),notificationMiddleware,AdminDashboardController.allenqueryDetails);
adminDashboardRouter.post('/search-enquery',adminRolePermissionCheck('manage_enquiry'),adminAuth,AdminDashboardController.searchEnquery);

// ................................all review admin.............................

adminDashboardRouter.get('/allreview',adminAuth,adminRolePermissionCheck('manage_review'),notificationMiddleware,AdminDashboardController.allpendingReview);
adminDashboardRouter.post('/approve-review/:reviewId',adminAuth,adminRolePermissionCheck('manage_review'),AdminDashboardController.allapproveReview);

// ................................CATEGORY DETAILS.............................

adminDashboardRouter.get('/service-page',adminAuth,adminRolePermissionCheck('manage_category'),notificationMiddleware,AdminDashboardController.servicePage);
adminDashboardRouter.get('/addservice',adminAuth,adminRolePermissionCheck('manage_category'),notificationMiddleware,AdminDashboardController.addService);
adminDashboardRouter.post('/servicepost',adminAuth,adminRolePermissionCheck('manage_category'),uploadImage.single('image'), AdminDashboardController.postService)
adminDashboardRouter.get('/thumbsUp/:id',adminAuth,adminRolePermissionCheck('manage_category'),notificationMiddleware,AdminDashboardController.categoryDetailsActive)
adminDashboardRouter.get('/thumbsDown/:id',adminAuth,notificationMiddleware,AdminDashboardController.categoryDetailsDeactivate)


// ................................ABOUT US DETAILS.............................

adminDashboardRouter.get('/about-page',adminAuth,adminRolePermissionCheck('manage_about'),notificationMiddleware,AdminDashboardController.aboutPage);
adminDashboardRouter.get('/addabout',adminAuth,adminRolePermissionCheck('manage_about'),notificationMiddleware,AdminDashboardController.addAbout);
adminDashboardRouter.post('/aboutpost',adminAuth,adminRolePermissionCheck('manage_about'),uploadImage.single('image'), AdminDashboardController.postAbout)
adminDashboardRouter.get('/aboutthumbsUp/:id',adminAuth,adminRolePermissionCheck('manage_about'),notificationMiddleware,AdminDashboardController.aboutDetailsActive)
adminDashboardRouter.get('/aboutthumbsDown/:id',adminAuth,adminRolePermissionCheck('manage_about'),notificationMiddleware,AdminDashboardController.aboutDetailsDeactivate)
adminDashboardRouter.get('/editaboutdata/:id',adminAuth,notificationMiddleware,AdminDashboardController.editAboutDataDetails)
adminDashboardRouter.post('/updateaboutdata/:id',adminAuth,uploadImage.single('image'),notificationMiddleware,AdminDashboardController.updateAboutDataDetails)


// ................................SERVICE DASHBORD DETAILS.............................

adminDashboardRouter.get('/serviceDashboard-page',adminAuth,adminRolePermissionCheck('manage_service'),notificationMiddleware,AdminDashboardController.serviceDashboardPage);
adminDashboardRouter.get('/addserviceDashboard',adminAuth,adminRolePermissionCheck('manage_service'),notificationMiddleware,AdminDashboardController.addserviceDashboard);
adminDashboardRouter.post('/serviceDashboardpost',adminAuth,uploadImage.single('image'), AdminDashboardController.postserviceDashboard)
adminDashboardRouter.get('/serviceDashboardthumbsUp/:id',adminAuth,notificationMiddleware,AdminDashboardController.serviceDashboardDetailsActive)
adminDashboardRouter.get('/serviceDashboardthumbsDown/:id',adminAuth,notificationMiddleware,AdminDashboardController.serviceDashboardDetailsDeactivate)
adminDashboardRouter.get('/editservicedata/:id',adminAuth,notificationMiddleware,AdminDashboardController.editServiceDataDetails)
adminDashboardRouter.post('/updateserviedata/:id',adminAuth,uploadImage.single('image'),notificationMiddleware,AdminDashboardController.updateServiceDataDetails)


// ................................FRONTENED DASHBOARD DETAILS.............................

adminDashboardRouter.get('/frontened-page',adminAuth,notificationMiddleware,AdminDashboardController.frontenedPage);
adminDashboardRouter.get('/addfrontened',adminAuth,notificationMiddleware,AdminDashboardController.addfrontened);
adminDashboardRouter.post('/frontenedpost',adminAuth,uploadImage.single('image'), AdminDashboardController.postfrontened)
adminDashboardRouter.get('/frontenedthumbsUp/:id',adminAuth,notificationMiddleware,AdminDashboardController.frontenedDetailsActive)
adminDashboardRouter.get('/frontenedthumbsDown/:id',adminAuth,notificationMiddleware,AdminDashboardController.frontenedDetailsDeactivate)
adminDashboardRouter.get('/editfronteneddata/:id',adminAuth,notificationMiddleware,AdminDashboardController.editfrontenedDataDetails)
adminDashboardRouter.post('/updatefronteneddata/:id',adminAuth,uploadImage.single('image'),notificationMiddleware,AdminDashboardController.updatefrontenedDataDetails)


module.exports = adminDashboardRouter