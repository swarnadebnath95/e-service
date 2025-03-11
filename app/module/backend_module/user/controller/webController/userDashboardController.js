const Service = require('../../../../frontened_module/customer_dashboard/model/applyServiceModel')
const UserModel = require('../../../admin/model/userModel')
const helper = require('../../../../../helper/helper')
const fs = require('fs');
const adminModel = require('../../../admin/model/adminModel');
const userProfileUpdate=require('../../../../../helper/userProfileValidation')


class userDashboardController {


    // ...................USER DASHBOARD - SHOW WEEKLY WORKING STATUS - ASSIGN DAY tASK...............


    async userDashboard(req, res) {

        try {
            const data = await UserModel.findOne({ _id: req.user.id });

            const userId = req.user.id; // This comes from the userAuth middleware
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Get the start of the day

            // Fetch all services assigned to the user from today onwards
            const assignedServices = await Service.find({
                assignedTo: userId,
                assignedDate: { $gte: today },  // Only services assigned from today onwards
                status: 'assign'               // Only services that are 'assigned' and not completed
            }).lean();

            // Check if there are no services assigned for today
            let message = null;
            if (assignedServices.length === 0) {
                message = 'No pending tasks for today'; // Set the message when no tasks are assigned
            }

            // Calculate working days excluding weekends (inline calculation)
            const joiningDate = data.joiningDate || new Date('2023-01-01'); // Fallback date for testing
            let currentDate = new Date(joiningDate);

            // Initialize an array to hold weekday status (Present/Absent)
            let weekdayStatus = {
                Monday: "Absent",
                Tuesday: "Absent",
                Wednesday: "Absent",
                Thursday: "Absent",
                Friday: "Absent",
                Saturday: "Absent",
                Sunday: "Absent"
            };

            // Ensure startDate is before today
            if (currentDate <= today) {
                // Loop through each day from joining date to today
                while (currentDate <= today) {
                    const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 6 is Saturday
                    const dayName = new Date(currentDate).toLocaleString('en-US', { weekday: 'long' });

                    // Mark the weekday as "Present" if it's a working day (Mon-Fri)
                    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                        weekdayStatus[dayName] = "Present";
                    }

                    // Move to the next day
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }

            // Mark the current day as "Present" or "Absent" (dynamic update)
            const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' });
            if (weekdayStatus[currentDay] !== "Absent") {
                weekdayStatus[currentDay] = "Present"; // Mark today's day as Present
            }


            // Get the current day of the week index (Sunday=0, Monday=1, ...)
            const currentDayIndex = today.getDay(); // Sunday is 0, Monday is 1, ...

            // Days of the week
            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

            // Create an array of days to display based on the current day (Monday to today)
            const daysToShow = daysOfWeek.slice(0, currentDayIndex); // Only show from Monday to today

            const successMsg = req.flash("success-mssg");
            const errorMsg = req.flash("error-mssg");
            // console.log("successMsg",successMsg)
            // console.log("errorMsg",errorMsg)

            // Render the user dashboard with data
            res.render('userDashboard', {
                user: req.user,
                userdata: data,
                services: assignedServices, // Pass assigned services to the template
                message: message,           // Message when no pending tasks
                weekdayStatus: weekdayStatus, // Pass weekday status to the template
                currentDay: currentDay,
                daysToShow: daysToShow,
                successMsg,
                errorMsg

            });

        } catch (error) {
            console.error("Error fetching user dashboard data:", error.message);
            res.redirect('/user/loginage');
        }
    }



    // ..................................UPDATE ASSIGN TASK STATUS.................................



    async updateStatus(req, res) {

        const { serviceId } = req.body; // Get service ID from the request
        try {
            // Find the service by ID
            const service = await Service.findById(serviceId);

            if (!service) {
                return res.status(404).json({ success: false, message: 'Service not found.' });
            }

            // Update the status to 'complete'
            service.status = 'complete';
            // console.log('service.status',service.status);

            const updatedService = await service.save(); // Save the updated service
            req.flash("success-mssg", "Work status updated successfully");

            res.json({
                success: true,
                message: 'Service status updated to complete',
                service: updatedService // Optionally return updated service data
            });
        } catch (err) {
            console.error(err);
            req.flash("error-mssg", "An error occurred while updating Work status");
            res.status(500).json({ success: false, message: 'Error updating status' });
        }
    }


    // ....................................GET ALL TASK.................................


    async getAllTasks(req, res) {

        try {
            const data = await UserModel.findOne({ _id: req.user.id })
            const userId = req.user.id; // Assuming `req.user.id` contains the logged-in user's ID

            // Fetch all tasks for the user, regardless of their status
            const allTasks = await Service.find({ assignedTo: userId }).lean();

            // Pass the fetched tasks to the template
            res.render('allTask', {
                user: req.user,
                userdata: data,
                tasks: allTasks // This will include both assigned and completed tasks
            });
        } catch (error) {
            console.error("Error fetching all tasks:", error.message);
            req.flash("error_msg", "Unable to load tasks.");
            res.redirect('/user/dashboard');
        }
    }


    // ....................................USER PROFILE.................................


    async viewprofile(req, res) {

        const data = await UserModel.findOne({ _id: req.user.id }).populate('category');
        const successMsg = req.flash("success-mssg");
        const errorMsg = req.flash("error-mssg");
        res.render('userViewProfile', {
            user: req.user,
            userdata: data,
            successMsg,
            errorMsg,
        })
    }


    // .................................GET USER PROFILE UPDATE PAGE.................................



    async updateprofile(req, res) {

        try {

            const data = await UserModel.findOne({ _id: req.user.id }).populate('category');
            const successMsg = req.flash("success-mssg");
            const errorMsg = req.flash("error-mssg");

            const id = req.params.id;
            const editdata = await UserModel.findById(id);
            if (!editdata) {
                console.log('data not found');
            }

            // console.log("editdta", data);
            // console.log("data", req.user);

            if (editdata) {
                res.render('updateUserProfile', {
                    editData: editdata,
                    user: req.user,
                    userdata: data,
                    successMsg,
                    errorMsg,
                })
            }
        } catch (error) {
            req.flash("error-mssg", "An error occurred while updating employee profile!");
            console.log(error);

        }
    }



    // ....................................USER PROFILE UPDATE.................................



    async updateuserprofile(req, res) {

        try {

            const data = await UserModel.findOne({ _id: req.user.id })
            const id = req.params.id;
            let new_image;

            if (req.file) {
                new_image = req.file.path;
                const duplicateImage = await UserModel.findById(id);

                if (!duplicateImage) {
                    console.log("Data not found");

                }
                if (duplicateImage.image) {
                    fs.promises.unlink(duplicateImage.image).catch((err) => {
                        console.error("Failed to delete old image:", err);
                    });
                }
            }

            // Validate the incoming request data using Joi
            const { error } = userProfileUpdate.validate(req.body);

            // If validation fails, return the error message
            if (error) {
                req.flash('error-mssg', error.details[0].message);
                return res.redirect('/user/editprofile/' + req.params.id);
            }

            const {  address } = req.body;
            const userdata = { address, image: new_image };

            const updateData = await UserModel.findByIdAndUpdate(id, userdata, {
                new: true,
            });

            // console.log('updateData',updateData);
            req.flash("success-mssg", "Employee profile updated successfully");
            // If email wasn't updated, just redirect to the view profile page
            res.redirect('/user/viewprofile')

        } catch (error) {
            req.flash("error-mssg", "An error occurred while updating Employee profile");
            console.log(error);

        }
    }


    // ....................................GET ALL ASSIGN TASK.................................


    async getAllAssignTasks(req, res) {
        try {
            // Fetch the user's data from the UserModel
            const data = await UserModel.findOne({ _id: req.user.id });
            const userId = req.user.id;


            const allTasks = await Service.find({
                assignedTo: userId,
                status: 'assign'
            }).lean();


            res.render('userAssignTask', {
                user: req.user,
                userdata: data,
                tasks: allTasks
            });
        } catch (error) {
            console.error("Error fetching all tasks:", error.message);
            res.redirect('/user/dashboard');
        }
    }


    // ....................................GET ALL COMPLETE TASK.................................


    async getAllCompleteTasks(req, res) {

        try {
            // Fetch the user's data from the UserModel
            const data = await UserModel.findOne({ _id: req.user.id });
            const userId = req.user.id;


            const allTasks = await Service.find({
                assignedTo: userId,
                status: 'complete'
            }).lean();


            res.render('userCompleteTask', {
                user: req.user,
                userdata: data,
                tasks: allTasks
            });
        } catch (error) {
            console.error("Error fetching all tasks:", error.message);
            res.redirect('/user/dashboard');
        }
    }


}



module.exports = new userDashboardController()