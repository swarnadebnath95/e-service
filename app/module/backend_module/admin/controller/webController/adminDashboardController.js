const AdminModel = require("../../model/adminModel");
const ServiceModel = require("../../../../frontened_module/customer_dashboard/model/applyServiceModel");
const UserModel = require("../../model/userModel");
const Role = require('../../../role/model/role.model')

const CustomerModel = require('../../../../frontened_module/customer_authentication/model/customerModel')
const EnqueryModel = require("../../../../frontened_module/customer_dashboard/model/contactModel");
const CategoryModel = require("../../model/categoryModel")
const AboutModel = require("../../model/aboutUsModel")
const FrontenedDashboardModel = require("../../model/frontenedDashboard")
const ServiceDashboardModel = require('../../model/serviceDasahboard')
const TokenModel = require("../../model/tokenModel");
const Notification = require("../../../../frontened_module/customer_dashboard/model/notificationModel");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const crypto = require("crypto");
const { formatDistanceToNow } = require("date-fns");
const helper = require("../../../../../helper/helper");
const {
  HashPassword,
} = require("../../../../../helper/helper");
const fs = require("fs");
const Review = require("../../../../frontened_module/customer_dashboard/model/reviewModel");
const createEmployeeValidationSchema = require('../../../../../helper/creatEmployeeValidation')
const createEmployeeUpdateValidationSchema = require('../../../../../helper/createEmplyeeUpdateVaidation')
const adminPrfileUpdateValidationSchema = require('../../../../../helper/adminProfileUpdateValidation')
const categoryValidationSchema = require('../../../../../helper/categoryValidation')

class AdminDashboardController {
  // ................................ADMIN DASHBOARD PAGE .................................

  async adminDashboardPage(req, res) {
    try {
      const userdata = await UserModel.aggregate([
        { $match: { deletestatus: 1 } },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $unwind: {
            path: "$categoryDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            category: "$categoryDetails.name",
            createdAt: 1,
          },
        },
      ]);
      // console.log(userdata);

      const data = await AdminModel.findOne({ _id: req.admin.id });
      console.log('admin data', data)

      const adminUserId = req.admin.id;
      console.log("adminUserId", adminUserId);

      const notifications = await Notification.find({ user: adminUserId })
        .sort({ createdAt: -1 })
        .lean(); // Using .lean() to return plain objects;  // Sort by most recent first

      if (Array.isArray(notifications)) {
        notifications.forEach((notification) => {
          // Format 'createdAt' to relative time like "30 minutes ago"
          notification.relativeTime = formatDistanceToNow(
            new Date(notification.createdAt),
            { addSuffix: true }
          );
        });
      }

      // console.log('notifications', notifications);
      // Filter out read notifications if you don't want to show them
      const unreadNotifications = notifications.filter(
        (notification) => !notification.read
      );
      // console.log('unreadNotifications', unreadNotifications);

      // Set notifications globally for all views
      res.locals.notifications = unreadNotifications;

      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");

      res.render("adminDashboard", {
        data: req.admin,
        uData: data,
        user: userdata,
        notifications: unreadNotifications,
        successMessage,
        errorMessage,
      });
    } catch (error) {
      console.log(error);
    }
  }


  // .................................NOTIFICATION MARK READ OR UNREAD..............................

  async markNotificationAsRead(req, res) {
    try {
      const data = await AdminModel.findOne({ _id: req.admin.id });
      const notificationId = req.params.id; // Assuming the notification ID is passed in the URL

      // Update the notification to mark it as read
      const updatedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true } // Return the updated notification
      );

      // If no notification is found, send a 404
      if (!updatedNotification) {
        return res.status(404).send("Notification not found");
      }

      // Redirect to the admin dashboard or wherever necessary
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).send("Error marking notification as read");
    }
  }

  // ................................ADMIN PROFILE VIEW PAGE .................................

  async viewProfile(req, res) {
    try {
      const data = await AdminModel.findOne({ _id: req.admin.id });
      // console.log("data",data);
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");
      res.render("viewProfile", {
        data: req.admin,
        uData: data,
        notifications: res.locals.notifications,
        successMessage,
        errorMessage,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // ................................GET ADMIN PROFILE EDIT PAGE .................................

  async viewEditPage(req, res) {
    try {
      const edata = await AdminModel.findOne({ _id: req.admin.id });

      const id = req.params.id;
      const data = await AdminModel.findById(id);
      if (!data) {
        console.log("data not found");
      }

      console.log("editdta", data);
      console.log("data", req.admin);
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");
      if (data) {
        res.render("updateProfile", {
          editData: data,
          data: data,
          uData: edata,
          notifications: res.locals.notifications,
          successMessage,
          errorMessage,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  // ................................ADMIN PROFILE UPDATE .................................

  async updateProfile(req, res) {
    try {
      const id = req.params.id;
      const edata = await AdminModel.findOne({ _id: req.admin.id });

      // Validate the incoming request data using Joi
      const { error } = adminPrfileUpdateValidationSchema.validate(req.body);

      // If validation fails, return the error message
      if (error) {
        req.flash('error-mssg', error.details[0].message);
        return res.redirect('/admin/edit/' + req.params.id);
      }

      let new_image;

      // Check if new image is uploaded and process it
      if (req.file) {
        new_image = req.file.path;

        const duplicateImage = await AdminModel.findById(id);

        if (!duplicateImage) {
          console.log("Data not found");
        }
        if (duplicateImage.image) {
          fs.promises.unlink(duplicateImage.image).catch((err) => {
            console.error("Failed to delete old image:", err);
          });
        }
      }

      const { name, email, phone } = req.body;

      // Find the existing admin data
      const existingAdmin = await AdminModel.findById(id);

      // Check if the email has changed
      const emailUpdated = email !== existingAdmin.email;

      // Check if the new email already exists in the database and isn't the same as the current email
      if (emailUpdated) {
        const emailExists = await AdminModel.findOne({ email });
        const emailExistsInUser = await UserModel.findOne({ email });
        const emailExistsInCustomer = await CustomerModel.findOne({ email });

        // If the email exists in any of the models, prevent update and show error
        if (emailExists || emailExistsInUser || emailExistsInCustomer) {
          req.flash(
            "error-mssg",
            "Email is already in use by another account."
          );
          return res.redirect("/admin/viewprofile");
        }
      }

      // Prepare data to update
      const data = { name, email, phone, image: new_image };

      // Update the admin profile in the database
      const updateData = await AdminModel.findByIdAndUpdate(id, data, {
        new: true,
      });

      // Update session data with the new admin information
      req.session.admin = updateData; // Store updated admin data in session

      // If the email has changed, update isVerified to false
      if (emailUpdated) {
        await AdminModel.findByIdAndUpdate(id, { isVerified: false }, { new: true });

        // Generate a token for email verification
        const tokenModel = new TokenModel({
          _userId: updateData._id,
          token: crypto.randomBytes(16).toString("hex"),
        });

        await tokenModel.save();

        const senderEmail = "swarnadebnath05@gmail.com";
        const senderPassword = "pqyi rqql xvdb mmqk";

        const transporter = helper.transport(senderEmail, senderPassword);

        // Email options
        const role = "admin";
        const mailOptions = {
          from: "noreply@raju.com",
          to: updateData.email,
          subject: "Profile Update",

          text: `Hello ${updateData.name},\n\nPlease verify your account by clicking the link: http://localhost:1456/admin/confirmation/${email}/${tokenModel.token}\n\nThank You!`

        };

        // Send the email
        helper.mailSender(req, res, transporter, mailOptions);

        // Redirect to the login page after updating email
        req.flash("success-mssg", "Email updated successfully!, Please login");
        return res.redirect("/admin/loginpage");
      }

     

      // If email wasn't updated, just redirect to the view profile page
      req.flash("success-mssg", "Profile updated successfully!");
      res.redirect("/admin/viewprofile");
    } catch (error) {
      req.flash("error-mssg", "An error occurred while updating Admin profile.");
      res.redirect("/admin/viewprofile");
    }
  }


  // ................................VIEW ALL TICKETS DETAILS PAGE.................................

  async viewAllTickets(req, res) {
    try {
      const edata = await AdminModel.findOne({ _id: req.admin.id });

      // Fetch all users with category details
      const users = await UserModel.aggregate([
        {
          $lookup: {
            from: "categories", // Reference to the Category collection
            localField: "category", // The category field in the User collection
            foreignField: "_id", // The _id field in the Category collection
            as: "categoryDetails", // Add category details to each user
          },
        },
        {
          $unwind: {
            path: "$categoryDetails",
            preserveNullAndEmptyArrays: true, // Keep users without categories
          },
        },
      ]);

      // Fetch all tasks with category details and assigned user details
      const tasks = await ServiceModel.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "users",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedToDetails",
          },
        },
        {
          $unwind: {
            path: "$assignedToDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $project: {
            _id: 1,
            category: "$categoryDetails.name", // Return category _id
            category_model_number: 1,
            product_issue: 1,
            address: 1,
            name: 1,
            email: 1,
            phone: 1,
            date: 1,
            assignedTo: {
              name: { $ifNull: ["$assignedToDetails.name", "Unassigned"] },
              email: { $ifNull: ["$assignedToDetails.email", ""] },
            },
            status: 1,
            assignedDate: 1,
          },
        },
      ]);

      console.log('tasks', tasks)
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");

      // Pass the necessary data to the EJS template
      res.render("allTickets", {
        users,
        tasks: tasks,
        data: req.admin,
        uData: edata,
        successMessage,
        errorMessage,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }

  // ................................VIEW CREATE EMPLOYEE PAGE .................................

  async viewCreateEmployee(req, res) {
    try {
      const edata = await AdminModel.findOne({ _id: req.admin.id });
      const categoryData = await CategoryModel.find();
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");
      res.render("createEmplyee", {
        data: req.admin,
        uData: edata,
        categories: categoryData,
        notifications: res.locals.notifications,
        successMessage,
        errorMessage,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // ................................DELETE EMPLOYEE DATA .................................

  async deleteuserData(req, res) {
    try {
      const id = req.params.id;


      const userData = await UserModel.findByIdAndUpdate(id, {
        deletestatus: 0,
      });
      req.flash("success-mssg", "User deleted successfully!");
      res.redirect("/admin/dashboard");
    } catch (error) {
      req.flash("error-mssg", "An error occurred while deleting the user.");
      console.log(error);
    }
  }

  // ................................CREATE EMPLOYEE .................................

  async createEmployee(req, res) {
    console.log("createEmployee called");
    try {
      const userdata = await UserModel.find();
      const edata = await AdminModel.findOne({ _id: req.admin.id });

      // Validate the incoming request data using Joi
      const { error } = createEmployeeValidationSchema.validate(req.body);

      // If validation fails, return the error message
      if (error) {
        req.flash('error-mssg', error.details[0].message);
        return res.redirect('/admin/viewcreateemployee');
      }

      const { name, email, category } = req.body;
      const existingUser = await UserModel.findOne({ email: email });

      console.log(req.body);

      // Step 1: Check if the email already exists in UserModel
      if (existingUser) {
        req.flash("error-mssg", "This email is already registered as a user.");
        return res.redirect("/admin/dashboard");
      }

      // Step 2: Check if the email already exists in AdminModel
      const existingAdmin = await AdminModel.findOne({ email });
      if (existingAdmin) {
        req.flash("error-mssg", "This email is already registered as an admin.");
        return res.redirect("/admin/dashboard");
      }

      // Step 3: Check if the email already exists in CustomerModel
      const existingCustomer = await CustomerModel.findOne({ email });
      if (existingCustomer) {
        req.flash("error-mssg", "This email is already registered as a customer.");
        return res.redirect("/admin/dashboard");
      }


      const password = crypto.randomBytes(4).toString("hex");

      const hashpassword = await HashPassword(password);
      let role = await Role.findOne({ name: "user" });

      const user = new UserModel({
        name: req.body.name,
        email: req.body.email,
        category: req.body.category,
        password: hashpassword,
        role: role._id,
      });
      await user.save();

      const senderEmail = "swarnadebnath05@gmail.com";
      const senderPassword = "pqyi rqql xvdb mmqk";

      const transporter = helper.transport(senderEmail, senderPassword);

      // Email options
      role = "user";
      const mailOptions = {
        from: "noreply@raju.com",
        to: user.email,
        subject: "login credentials",
        text: `Hello ${user.name},\n\nthis is your login credentials:\n\nEmail: ${email}\nPassword:
     ${password}\n\nPlease log in with this credentials and change your password after first login.\n\nBest regards,\nAdmin
      http://localhost:1456/${role}/loginPage`,
      };

      // Send the email
      helper.mailSender(req, res, transporter, mailOptions);
      // console.log(req.admin);

      if (req.admin) {
        const data = await AdminModel.findOne({ _id: req.admin.id });
        if (user) {
          req.flash("success-mssg", "user created successfully");
          return res.redirect("/admin/dashboard");
        }
      }

    } catch (error) {
      req.flash("error-mssg", "internal server error");
      res.status(500).send("Server Error");
    }
  }


  // ................... EDIT EMPLOYEE DETAILS PAGE ................


  async editEmployeeDetails(req, res) {
    try {
      const data = await AdminModel.findOne({ _id: req.admin.id });
      // console.log("data",data);
      const employeedata = await UserModel.findById(req.params.id).populate('category');

      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");
      if (employeedata) {
        res.render('employeeDataEditPage', {
          data: req.admin,
          uData: data,
          notifications: res.locals.notifications,
          successMessage,
          errorMessage,
          employeedata: employeedata

        })
      }
    } catch (error) {
      console.log(error);
    }
  }


  // ................... UPDATE EMPLOYEE DETAILS PAGE ................


  async updateEmployeeDetails(req, res) {
    try {

      const { name, email } = req.body;

      // Validate the incoming request data using Joi
      const { error } = createEmployeeUpdateValidationSchema.validate(req.body);

      // If validation fails, return the error message
      if (error) {
        req.flash('error-mssg', error.details[0].message);
        return res.redirect('/admin/editemployeedata/' + req.params.id);
      }

      // Check if the new email already exists in UserModel, AdminModel, or CustomerModel
      const existingUser = await UserModel.findOne({ email });
      const existingAdmin = await AdminModel.findOne({ email });
      const existingCustomer = await CustomerModel.findOne({ email });

      if ((existingUser && existingUser._id.toString() !== req.params.id) ||
        (existingAdmin && existingAdmin.email === email) ||
        (existingCustomer && existingCustomer.email === email)) {
        req.flash('error-mssg', 'The email address is already in use by another account.');
        return res.redirect('/admin/editemployeedata/' + req.params.id);
      }

      // Fetch the current user data
      const user = await UserModel.findById(req.params.id);

      // Store the old email to check if it's being updated
      const oldEmail = user.email;

      // Update user details with new name and email
      await UserModel.findByIdAndUpdate(req.params.id, { name, email });

      // If email was updated, send a credential email to the new email address
      if (oldEmail !== email) {
        // Send the credential email (without password update)
        const senderEmail = "swarnadebnath05@gmail.com";
        const senderPassword = "pqyi rqql xvdb mmqk";

        const transporter = helper.transport(senderEmail, senderPassword);

        const mailOptions = {
          from: "noreply@raju.com",
          to: email,
          subject: "Profile Update",
          html: `
          <h4>Hello ${name},</h4>
          <p>Your email address has been successfully updated in our system.</p>
          <p><strong>New Email Address:</strong> ${email}</p>
          <p>If you did not request this change, please contact the admin immediately.</p>
          <br>
          <p>Thank you,</p>
          <p>Admin Team</p>
        `,
        };

        helper.mailSender(req, res, transporter, mailOptions);
        console.log('Notification sent to the updated email.');
      }

      // Send success message
      req.flash('success-mssg', 'User details updated successfully');
      res.redirect('/admin/dashboard');

    } catch (error) {
      console.error('Error updating user details:', error);
      req.flash('error-mssg', 'Failed to update user details');
      res.redirect('/admin/editemployeedata/' + req.params.id);
    }
  }


  // ................................ASSIGN TICKET TO THE EMPLOYEE .................................


  async assignTicket(req, res) {

    try {
      const { taskId, userId } = req.body;

      if (!taskId || !userId) {
        return res.status(400).json({ success: false, message: 'Task ID or User ID is missing' });
      }

      // Logic to assign the user to the task
      const task = await ServiceModel.findById(taskId);

      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      task.assignedTo = userId;
      task.status = 'assign';  // Update status
      task.assignedDate = new Date();

      await task.save();

      const tasks = await ServiceModel.find()
        .populate('assignedTo', 'name email')  // Populate only the name and email fields of assignedTo
        .exec();

      const assignedUser = await UserModel.findById(userId);  // Fetch the assigned user's details
      req.flash("success-mssg", "Task assign successfully");
      // Respond with success
      res.json({
        success: true,
        userName: assignedUser.name,
        workStatus: task.status,
        assignedDate: task.assignedDate.toLocaleDateString('en-US'),
        message: 'Task assigned successfully!',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error assigning task' });
    }
  }


  // ................................GET ASSIGN TASK DETALS....................................

  async getAssignTasksByStatus(req, res) {
    try {
      const edata = await AdminModel.findOne({ _id: req.admin.id });
      // console.log("Admin found:", req.admin);

      // Fetch tasks
      const tasks = await ServiceModel.find({ status: { $in: ["assign"] } });
      // console.log('Fetched Tasks:', tasks);

      // Fetch employees
      const employees = await UserModel.find();
      // console.log('Fetched Employees:', employees);
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");
      // Check if both tasks and employees are not empty before rendering
      if (tasks.length > 0) {
        res.render("assignTaskDetails", {
          tasks,
          employees,
          data: req.admin,
          uData: edata,
          successMessage,
          errorMessage,
        });
      } else {
        res.render("assignTaskDetails", {
          tasks: [],
          employees,
          data: req.admin,
          uData: edata,
          notifications: res.locals.notifications,
          successMessage,
          errorMessage,
        });
      }
    } catch (error) {
      console.error("Error fetching tasks or employees:", error);
      res.status(500).send("Error fetching data for task assignment.");
    }
  }

  // ................................GET PENDING TASK DETAILS....................................

  async getPendingTasksByStatus(req, res) {
    try {
      const edata = await AdminModel.findOne({ _id: req.admin.id });
      // Fetch tasks
      const tasks = await ServiceModel.find({ status: { $in: ["pending"] } });
      // console.log('Fetched Tasks:', tasks);

      // Fetch employees
      const employees = await UserModel.find();
      // console.log('Fetched Employees:', employees);
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");
      // Check if both tasks and employees are not empty before rendering
      if (tasks.length > 0) {
        res.render("pendingTaskDetails", {
          tasks,
          employees,
          data: req.admin,
          uData: edata,
          successMessage,
          errorMessage,
        });
      } else {
        res.render("pendingTaskDetails", {
          tasks: [],
          employees,
          data: req.admin,
          uData: edata,
          notifications: res.locals.notifications,
          successMessage,
          errorMessage,
        });
      }
    } catch (error) {
      console.error("Error fetching tasks or employees:", error);
      res.status(500).send("Error fetching data for task assignment.");
    }
  }

  // ................................GET COMPLETE TASK DETAILS....................................

  async getCompleteTasksByStatus(req, res) {
    try {
      const edata = await AdminModel.findOne({ _id: req.admin.id });

      // Fetch tasks
      const tasks = await ServiceModel.find({ status: { $in: ["complete"] } });
      // console.log('Fetched Tasks:', tasks);

      // Fetch employees
      const employees = await UserModel.find();
      // console.log('Fetched Employees:', employees);
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");
      // Check if both tasks and employees are not empty before rendering
      if (tasks.length > 0) {
        res.render("completeTaskDetails", {
          tasks,
          employees,
          data: req.admin,
          uData: edata,
          successMessage,
          errorMessage,
        });
      } else {
        res.render("pendingTaskDetails", {
          tasks: [],
          employees,
          data: req.admin,
          uData: edata,
          notifications: res.locals.notifications,
          successMessage,
          errorMessage,
        });
      }
    } catch (error) {
      console.error("Error fetching tasks or employees:", error);
      res.status(500).send("Error fetching data for task assignment.");
    }
  }

  // ................................GET ALL ENQUERY dETAILS....................................

  async allenqueryDetails(req, res) {
    try {
      const data = await AdminModel.findOne({ _id: req.admin.id });

      const enquery = await EnqueryModel.find();
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");

      res.render("allenquery", {
        data: req.admin,
        uData: data,
        tasks: enquery,
        successMessage,
        errorMessage,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // ................................SEARCH ENQUERY DETAILS BY NAME....................................

  async searchEnquery(req, res) {
    try {
      const { searchQuery } = req.body; // Get the search query from the request body

      // MongoDB query to search by name or email (case-insensitive)
      const tasks = await EnqueryModel.aggregate([
        {
          $match: {
            $or: [{ name: { $regex: searchQuery, $options: "i" } }],
          },
        },
      ]);

      // console.log('search', tasks);

      // Respond with the filtered users
      res.json({ tasks });
    } catch (error) {
      console.error("Error searching users by name or email:", error);
      res.status(500).json({ message: "Error searching users" });
    }
  }

  // ................................ALL REVIEW....................................

  async allpendingReview(req, res) {
    try {
      const data = await AdminModel.findOne({ _id: req.admin.id });
      const reviews = await Review.find();
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");
      res.render("allreviewDetails", {
        data: req.admin,
        uData: data,
        review: reviews,
        successMessage,
        errorMessage,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async allapproveReview(req, res) {
    try {
      const data = await AdminModel.findOne({ _id: req.admin.id });
      const { reviewId } = req.params; // Get the reviewId from the route parameters

      // Find the review by ID and update the 'approved' field to true
      const allreview = await Review.findById(reviewId);
      allreview.approved = true;
      console.log("review", allreview);

      const reviews = await allreview.save();

      if (!reviews) {
        console.log("Review not found.");
      }
      req.flash("success-mssg", "Review approved successfully!");
      res.redirect("/admin/allreview");

    } catch (error) {
      req.flash("error-mssg", "An error occurred while approving review");
      console.error("Error approving review:", error);
    }
  }



  // ................................CATEGORY SECTION....................................



  async servicePage(req, res) {
    try {
      const data = await AdminModel.findOne({ _id: req.admin.id });
      const categoryData = await CategoryModel.find()
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");

      res.render("servicesListPage", {
        data: req.admin,
        uData: data,
        notifications: res.locals.notifications,
        category: categoryData,
        successMessage,
        errorMessage,
      });
    } catch (error) {
      req.flash("error-mssg", "An error occurred while creating service details");
      console.log(error);
    }
  }


  async addService(req, res) {
    try {
      const data = await AdminModel.findOne({ _id: req.admin.id });
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");


      res.render("addServicePage", {
        data: req.admin,
        uData: data,
        successMessage,
        errorMessage,
      });
    } catch (error) {
      console.log(error);
    }
  }


  async postService(req, res) {
    try {

      // Validate the incoming request data using Joi
      const { error } = categoryValidationSchema.validate(req.body);

      // If validation fails, return the error message
      if (error) {
        req.flash('error-mssg', error.details[0].message);
        return res.redirect('/admin/service-page');
      }

      const { name, description } = req.body
       // Normalize the name to handle any extra spaces
    const normalizedName = name.trim(); // Remove leading/trailing spaces

    // Check if a category with the same name (case-insensitive) already exists
    const existingCategory = await CategoryModel.findOne({
      name: { $regex: `^${normalizedName}$`, $options: 'i' }, // Case-insensitive match
    });

    if (existingCategory) {
      req.flash("error-mssg", "Category already exists (case-insensitive).");
      return res.redirect("/admin/service-page");
    }

    // Create a new category instance
    const createCategoryData = new CategoryModel({
      name: normalizedName, // Save the normalized name
      description,
    });

      if (req.file) {
        createCategoryData.image = req.file.path
      }
      const response = await createCategoryData.save()
      if (response) {
        req.flash('success-mssg', 'Added Product Successfully')
        res.redirect('/admin/service-page')
      } else {
        res.redirect('/admin/addservice')
      }

    } catch (error) {
      req.flash("error-mssg", "An error occurred while creating service details");
      console.log(error);
    }
  }

  async categoryDetailsActive(req, res) {
    const id = req.params.id;

    try {
      const categoryActiveData = await CategoryModel.findByIdAndUpdate(id, { status: 0 });
      req.flash('success-mssg', 'data deactivated Successfully')
      res.redirect('/admin/service-page');
    } catch (error) {
      console.error(error);
    }
  }


  async categoryDetailsDeactivate(req, res) {
    const id = req.params.id;

    try {
      const categoryDeactivateData = await CategoryModel.findByIdAndUpdate(id, { status: 1 });
      req.flash('success-mssg', 'data activated Successfully')
      res.redirect('/admin/service-page');
    } catch (error) {
      console.error(error);
    }
  }


  // ................................ABOUT US SECTION....................................


  async aboutPage(req, res) {
    try {
      const data = await AdminModel.findOne({ _id: req.admin.id });
      const aboutData = await AboutModel.find()
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");

      res.render("aboutUsListPage", {
        data: req.admin,
        uData: data,
        aboutdata: aboutData,
        successMessage,
        errorMessage,
      });
    } catch (error) {
      req.flash("error-mssg", "An error occurred while creating about details");
      console.log(error);
    }
  }


  async addAbout(req, res) {
    try {
      const data = await AdminModel.findOne({ _id: req.admin.id });
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");

      res.render("addAboutUsDetails", {
        data: req.admin,
        uData: data,
        successMessage,
        errorMessage,
      });
    } catch (error) {
      console.log(error);
    }
  }


  async postAbout(req, res) {
    try {
      const { title, description } = req.body
      const createCategoryData = new AboutModel({
        title,
        description
      })

      if (req.file) {
        createCategoryData.image = req.file.path
      }
      const response = await createCategoryData.save()
      if (response) {
        req.flash('success-mssg', 'Added data Successfully')
        res.redirect('/admin/about-page')
      } else {
        res.redirect('/admin/addabout')
      }

    } catch (error) {
      req.flash("error-mssg", "An error occurred while creating service details");
      console.log(error);
    }
  }

  async aboutDetailsActive(req, res) {
    const id = req.params.id;

    try {
      const aboutActiveData = await AboutModel.findByIdAndUpdate(id, { status: 0 });
      req.flash('success-mssg', 'data deactivated Successfully')
      res.redirect('/admin/about-page');
    } catch (error) {
      console.error(error);
    }
  }


  async aboutDetailsDeactivate(req, res) {
    const id = req.params.id;

    try {
      const aboutDeactivateData = await AboutModel.findByIdAndUpdate(id, { status: 1 });
      req.flash('success-mssg', 'data activated Successfully')
      res.redirect('/admin/about-page');
    } catch (error) {
      console.error(error);
    }
  }


  // ................... EDIT ABoUt DETAILS ................


  async editAboutDataDetails(req, res) {
    try {
      const id = req.params.id
      const data = await AdminModel.findOne({ _id: req.admin.id });
      const editAboutData = await AboutModel.findByIdAndUpdate(id, { status: 0 });
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");
      if (editAboutData) {
        res.render('aboutUsListPageEdit', {
          title: "update page",
          uData: data,
          edit: editAboutData,
          successMessage,
          errorMessage

        })
      }
    } catch (error) {
      console.log(error);
    }
  }


  // ................... UPDATE ABOUT DETAILS ................


  async updateAboutDataDetails(req, res) {
    const id = req.params.id;

    // Check if a new image is uploaded
    const newImage = req.file ? req.file.path : null;

    try {
      // Find the about data by ID
      const aboutData = await AboutModel.findById(id);
      if (!aboutData) {
        req.flash('error-mssg', 'About data not found');
        return res.redirect('/admin/about-page');
      }

      // Prepare the update object
      const updateData = {
        title: req.body.title,
        description: req.body.description,
      };

      // If a new image is provided, include it in the update
      if (newImage) {
        updateData.image = newImage;
      } else {
        // If no image is uploaded, don't change the current image
        updateData.image = aboutData.image;
      }

      // Update the about data
      const updatedAboutDetails = await AboutModel.findByIdAndUpdate(id, updateData, { new: true });

      if (updatedAboutDetails) {
        req.flash('success-mssg', 'About data updated successfully');
        return res.redirect('/admin/about-page');
      } else {
        req.flash('error-mssg', 'Unable to update about data');
        return res.redirect('/admin/editaboutdata/' + id); // Go back to the edit page if update fails
      }
    } catch (err) {
      req.flash('error-mssg', 'An error occurred while updating');
      console.error(err);
      return res.redirect('/admin/editaboutdata/' + id); // Go back to the edit page in case of error
    }
  }




  // ................................SERVICE DASHBOARD SECTION....................................


  async serviceDashboardPage(req, res) {
    try {
      const data = await AdminModel.findOne({ _id: req.admin.id });
      const servicedashoardData = await ServiceDashboardModel.find()
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");



      res.render("serviceDaashboardList", {
        data: req.admin,
        uData: data,
        servicedashoarddata: servicedashoardData,
        successMessage,
        errorMessage,
      });
    } catch (error) {
      req.flash("error-mssg", "An error occurred while creating service dashboard details");
      console.log(error);
    }
  }


  async addserviceDashboard(req, res) {
    try {
      const data = await AdminModel.findOne({ _id: req.admin.id });
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");


      res.render("addServiceDashboardDetails", {
        data: req.admin,
        uData: data,
        successMessage,
        errorMessage,
      });
    } catch (error) {
      req.flash("error-mssg", "An error occurred while adding service dashboard details");
      console.log(error);
    }
  }


  async postserviceDashboard(req, res) {
    try {
      const { title, description } = req.body
      const createServiceDashboardData = new ServiceDashboardModel({
        title,
        description
      })

      if (req.file) {
        createServiceDashboardData.image = req.file.path
      }
      const response = await createServiceDashboardData.save()
      if (response) {
        req.flash("success-mssg", "service dashboard data aadded successfully");
        res.redirect('/admin/serviceDashboard-page')
      } else {
        res.redirect('/admin/addserviceDashboard')
      }

    } catch (error) {
      req.flash("error-mssg", "An error occurred while creating service details");
      console.log(error);
    }
  }

  async serviceDashboardDetailsActive(req, res) {
    const id = req.params.id;

    try {
      const serviceDashboardActiveData = await ServiceDashboardModel.findByIdAndUpdate(id, { status: 0 });
      req.flash('success-mssg', 'data deactivated Successfully')
      res.redirect('/admin/serviceDashboard-page');
    } catch (error) {
      console.error(error);
    }
  }


  async serviceDashboardDetailsDeactivate(req, res) {
    const id = req.params.id;

    try {
      const serviceDashboardDeactivateData = await ServiceDashboardModel.findByIdAndUpdate(id, { status: 1 });
      req.flash('success-mssg', 'data activated Successfully')
      res.redirect('/admin/serviceDashboard-page');
    } catch (error) {
      console.error(error);
    }
  }


  // ................... EDIT SERViCE PAGE DETAILS ................


  async editServiceDataDetails(req, res) {
    try {
      const id = req.params.id
      const data = await AdminModel.findOne({ _id: req.admin.id });
      const editServiceData = await ServiceDashboardModel.findByIdAndUpdate(id, { status: 0 });
      const successMessage = req.flash("success-mssg");
      const errorMessage = req.flash("error-mssg");
      if (editServiceData) {
        res.render('editServiceDataPage', {
          title: "update page",
          uData: data,
          edit: editServiceData,
          successMessage,
          errorMessage

        })
      }
    } catch (error) {
      console.log(error);
    }
  }


  // ................... UPDATE SERViCE PAGE DETAILS ................


  async updateServiceDataDetails(req, res) {
    const id = req.params.id;

    // Check if a new image is uploaded
    const newImage = req.file ? req.file.path : null;

    try {
      // Find the about data by ID
      const serviceData = await ServiceDashboardModel.findById(id);
      if (!serviceData) {
        req.flash('error-mssg', 'About data not found');
        return res.redirect('/admin/serviceDashboard-page');
      }

      // Prepare the update object
      const updateData = {
        title: req.body.title,
        description: req.body.description,
      };

      // If a new image is provided, include it in the update
      if (newImage) {
        updateData.image = newImage;
      } else {
        // If no image is uploaded, don't change the current image
        updateData.image = serviceData.image;
      }

      // Update the about data
      const updatedServiceDetails = await ServiceDashboardModel.findByIdAndUpdate(id, updateData, { new: true });

      if (updatedServiceDetails) {
        req.flash('success-mssg', 'Service data updated successfully');
        return res.redirect('/admin/serviceDashboard-page');
      } else {
        req.flash('error-mssg', 'Unable to update Service data');
        return res.redirect('/admin/editservicedata/' + id); // Go back to the edit page if update fails
      }
    } catch (err) {
      req.flash('error-mssg', 'An error occurred while updating');
      console.error(err);
      return res.redirect('/admin/editservicedata/' + id); // Go back to the edit page in case of error
    }
  }


    // ................................FRONTENED DASHBOARD SECTION....................................


    async frontenedPage(req, res) {
      try {
        const data = await AdminModel.findOne({ _id: req.admin.id });
        const frontenedData = await FrontenedDashboardModel.find()
        const successMessage = req.flash("success-mssg");
        const errorMessage = req.flash("error-mssg");
  
        res.render("frontenedDashboardData", {
          data: req.admin,
          uData: data,
          frontenedData: frontenedData,
          successMessage,
          errorMessage,
        });
      } catch (error) {
        req.flash("error-mssg", "An error occurred while creating about details");
        console.log(error);
      }
    }
  
  
    async addfrontened(req, res) {
      try {
        const data = await AdminModel.findOne({ _id: req.admin.id });
        const successMessage = req.flash("success-mssg");
        const errorMessage = req.flash("error-mssg");
  
        res.render("addFontenedDasghboardData", {
          data: req.admin,
          uData: data,
          successMessage,
          errorMessage,
        });
      } catch (error) {
        console.log(error);
      }
    }
  
  
    async postfrontened(req, res) {
      try {
        const { title, description } = req.body
        const createCategoryData = new FrontenedDashboardModel({
          title,
          description
        })
  
        if (req.file) {
          createCategoryData.image = req.file.path
        }
        const response = await createCategoryData.save()
        if (response) {
          req.flash('success-mssg', 'Added data Successfully')
          res.redirect('/admin/frontened-page')
        } else {
          res.redirect('/admin/addfrontened')
        }
  
      } catch (error) {
        req.flash("error-mssg", "An error occurred while creating service details");
        console.log(error);
      }
    }
  
    async frontenedDetailsActive(req, res) {
      const id = req.params.id;
  
      try {
        const aboutActiveData = await FrontenedDashboardModel.findByIdAndUpdate(id, { status: 0 });
        req.flash('success-mssg', 'data deactivated Successfully')
        res.redirect('/admin/frontened-page');
      } catch (error) {
        console.error(error);
      }
    }
  
  
    async frontenedDetailsDeactivate(req, res) {
      const id = req.params.id;
  
      try {
        const aboutDeactivateData = await FrontenedDashboardModel.findByIdAndUpdate(id, { status: 1 });
        req.flash('success-mssg', 'data activated Successfully')
        res.redirect('/admin/frontened-page');
      } catch (error) {
        console.error(error);
      }
    }
  
  
    // ................... FRONTENED DASHBOARD DETAILS ................
  
  
    async editfrontenedDataDetails(req, res) {
      try {
        const id = req.params.id
        const data = await AdminModel.findOne({ _id: req.admin.id });
        const editAboutData = await FrontenedDashboardModel.findByIdAndUpdate(id, { status: 0 });
        const successMessage = req.flash("success-mssg");
        const errorMessage = req.flash("error-mssg");
        if (editAboutData) {
          res.render('editFrontenedData', {
            title: "update page",
            uData: data,
            edit: editAboutData,
            successMessage,
            errorMessage
  
          })
        }
      } catch (error) {
        console.log(error);
      }
    }
  
  
    // ................... FRONTENED DASHBOARD DETAILS ................
  
  
    async updatefrontenedDataDetails(req, res) {
      const id = req.params.id;
  
      // Check if a new image is uploaded
      const newImage = req.file ? req.file.path : null;
  
      try {
        // Find the about data by ID
        const aboutData = await FrontenedDashboardModel.findById(id);
        if (!aboutData) {
          req.flash('error-mssg', 'data not found');
          return res.redirect('/admin/frontened-page');
        }
  
        // Prepare the update object
        const updateData = {
          title: req.body.title,
          description: req.body.description,
        };
  
        // If a new image is provided, include it in the update
        if (newImage) {
          updateData.image = newImage;
        } else {
          // If no image is uploaded, don't change the current image
          updateData.image = aboutData.image;
        }
  
        // Update the about data
        const updatedAboutDetails = await FrontenedDashboardModel.findByIdAndUpdate(id, updateData, { new: true });
  
        if (updatedAboutDetails) {
          req.flash('success-mssg', 'data updated successfully');
          return res.redirect('/admin/frontened-page');
        } else {
          req.flash('error-mssg', 'Unable to update about data');
          return res.redirect('/admin/editfronteneddata/' + id); // Go back to the edit page if update fails
        }
      } catch (err) {
        req.flash('error-mssg', 'An error occurred while updating');
        console.error(err);
        return res.redirect('/admin/editfronteneddata/' + id); // Go back to the edit page in case of error
      }
    }  



}

module.exports = new AdminDashboardController();
