const adminModel = require('../../../../backend_module/admin/model/adminModel');
const UserModel = require('../../../../backend_module/admin/model/userModel')
const ServiceModel = require('../../model/applyServiceModel')
const AboutModel = require('../../../../backend_module/admin/model/aboutUsModel')
const FrontModel = require('../../../../backend_module/admin/model/frontenedDashboard')
const ServiceDashboardModel = require('../../../../backend_module/admin/model/serviceDasahboard')
const createticketvalidateService = require('../../../../../helper/createTicketValidation')
const customerPrfileUpdateValidationSchema = require('../../../../../helper/customerProfileValidation')
const passwordValidationSchema = require('../../../../../helper/passwordValidation')
const emailValidationSchema = require('../../../../../helper/emailValidation')
const CaategoryModel = require('../../../../backend_module/admin/model/categoryModel')
const NotificationModel = require('../../model/notificationModel')
const CustomerModel = require('../../../customer_authentication/model/customerModel')
const CustomertokenModel = require('../../../customer_authentication/model/customertTokenModel')
const helper = require('../../../../../helper/helper')
const ContactModel = require('../../model/contactModel')
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const ReviewModel = require('../../model/reviewModel')




class CustomerController {


    // ...........................CUSTOMER DASHBOARD PAGE.......................................


    async customerDashboard(req, res) {

        try {
            const ticketdetails = await ServiceModel.find()
            const reiviews = await ReviewModel.find({ approved: true })
            const aboutData = await AboutModel.find()
            const serviceDashboardData = await ServiceDashboardModel.find()
            const fronteneddata = await FrontModel.find()
            const cdata = await CaategoryModel.find();

            // const customerData = req.customer ? await CustomerModel.findById(req.customer.id) : null;

            const successMessage = req.flash("success-mssg");
            const errorMessage = req.flash("error-mssg");
            res.render('customer_dashboard', {
               
                data: ticketdetails,
                review: reiviews,
                aboutdata: aboutData,
                serviceDashboardData,
                fronteneddata,
                cdata,
               
                successMessage,
                errorMessage,
            })
        } catch (error) {
            console.log(error);
        }

    }


    // ...........................CUSTOMER APPLY SERVICE PAGE.......................................


    async applyforService(req, res) {

        try {
            const data = await CustomerModel.findOne({ _id: req._id })
            console.log("datacustomer", data);

            const categoryData = await CaategoryModel.find();
            const successMessage = req.flash("success-mssg");
            const errorMessage = req.flash("error-mssg");

            console.log('admin data', data)

            res.render('applyForServicePage', {
                data: req.customer,
                uData: data,
                categories: categoryData,
                successMessage,
                errorMessage,
            })
        } catch (error) {
            console.log(error);

        }

    }


    // ...........................CUSTOMER APPLY SERVICE.......................................


    async createTicket(req, res) {
        try {

            // Ensure req.customer is set and contains the customer data
            const customerId = req.customer.id;  // It should be available after JWT authentication
            console.log("Customer ID from req.customer:", customerId);

            if (!customerId) {
                return res.status(400).json({ message: 'Customer not authenticated' });
            }

            // Validate the incoming request data using Joi
            const { error } = createticketvalidateService.validate(req.body);

            // If validation fails, return the error message
            if (error) {
                req.flash('error-mssg', error.details[0].message);
                return res.redirect('/frontened/applyForService');
            }

            const { name, email, phone, date, category, category_model_number, product_issue, address } = req.body;

            // Create a new service ticket
            const newTicket = new ServiceModel({
                name,
                email,
                phone,
                date,
                category,
                category_model_number,
                product_issue,
                address,
                createdBy: customerId,  // Attach the authenticated customer ID
                assignedDate: null
            });

            // Save the new ticket to the database
            const createdTicket = await newTicket.save();

            const adminUser = await adminModel.findOne({ _id: req.admin.id });
            console.log('adaminUser', adminUser);

            // Step 2: Create a notification for the admin
            const notificationMessage = `New service ticket created by ${name}. Issue: ${product_issue}`;

            // const adminUserId = '673e06c30753563a44ab27ba';

            const newNotification = new NotificationModel({
                user: adminUser._id, // replace with the actual admin user ID
                message: notificationMessage
            });

            console.log("newNotification", newNotification);

            await newNotification.save();

            const senderEmail = "swarnadebnath05@gmail.com";
            const senderPassword = "pqyi rqql xvdb mmqk";

            const transporter = helper.transport(senderEmail, senderPassword);

            // Email options
            const mailOptions = {
                from: "noreply@raju.com",
                to: createdTicket.email,
                subject: "Regarding Ticket",
                text: `Hello ${createdTicket.name},\n\nRegarding your issue ,we will update you soon.\n\nBest regards,\nAdmin`
            };
            // Send the email
            helper.mailSender(req, res, transporter, mailOptions);
            req.flash('success-mssg', "raise a ticket successfully");
            // Send a success response
            if (createdTicket) {
                res.redirect('/frontened/dashboard')
            }

        } catch (error) {
            console.error("Error creating ticket:", error);

        }
    }



    // ....................................ABOUT SECTION.......................................


    async aboutSection(req, res) {

        try {
            const aboutdata = await AboutModel.find()
            console.log('about data', aboutdata)
            res.render('aboutSection', {
                data: aboutdata
            })
        } catch (error) {
            console.log(error);

        }
    }


    // ....................................CONTACT SECTION POST.......................................


    async contactSectionPage(req, res) {

        try {
            res.render('contactUsPage')
        } catch (error) {
            console.log(error);

        }
    }


    // ....................................CONTACT SECTION POST.......................................


    async contactSection(req, res) {

        try {

            const { name, email, phone, message } = req.body;

            const createcontact = new ContactModel({
                name,
                email,
                phone,
                message
            })

            const newCreatecontact = await createcontact.save()

            const senderEmail = "swarnadebnath05@gmail.com";
            const senderPassword = "pqyi rqql xvdb mmqk";

            const transporter = helper.transport(senderEmail, senderPassword);

            // Email options
            const mailOptions = {
                from: "noreply@raju.com",
                to: newCreatecontact.email,
                subject: "Regarding Ticket",
                text: `Hello ${newCreatecontact.name},\n\nRegarding your issue ,we will contact you as soon as possible.\n\nBest regards,\nAdmin`
            };
            // Send the email
            helper.mailSender(req, res, transporter, mailOptions);

            if (newCreatecontact) {
                res.redirect('/frontened/dashboard')
                res.status(500).send("An error occurred while creating the contact.");
            }

        } catch (error) {
            console.log(error);

        }
    }


    // ....................................SERVICE SECTION .......................................


    async service(req, res) {

        try {
            const customerId = req.customer.id;
            const data = await CustomerModel.findOne({ _id: req.customer.id })
            const customer = await CustomerModel.findById(customerId)
            const serviceDashboardData = await ServiceDashboardModel.find()
            const categorydata = await CaategoryModel.find()
            console.log('categorydata', categorydata)

            res.render('serviceSection', {
                data: req.customer,
                uData: data,
                customer,
                razorpayKey: 'rzp_test_xXhDLjnAZ7RZRV',
                serviceDashboardData,
                cdata: categorydata
            })
        } catch (error) {
            console.log(error);

        }
    }



    // ....................................CUSTOMER ACCOUNT PAGE.......................................


    async account(req, res) {

        try {
            const data = await CustomerModel.findOne({ _id: req.customer.id })
            console.log("data", data);
            const successMessage = req.flash("success-mssg");
            const errorMessage = req.flash("error-mssg");

            res.render('accountPage', {
                data: req.customer,
                uData: data,
                successMessage,
                errorMessage,
            })


        } catch (error) {
            console.log(error);

        }
    }


    // ....................................CUSTOMER VIEW PROFILE.......................................


    async viewprofilePage(req, res) {

        try {
            const data = await CustomerModel.findOne({ _id: req.customer.id })
            const successMessage = req.flash("success-mssg");
            const errorMessage = req.flash("error-mssg");
            res.render('customerViewprofile', {
                data: req.customer,
                uData: data,
                successMessage,
                errorMessage,
            })
        } catch (error) {
            console.log(error);
        }
    }


    // ....................................CUSTOMER EDIT PAGE.......................................


    async viewEditPage(req, res) {

        try {
            const edata = await CustomerModel.findOne({ _id: req.customer.id })

            const id = req.params.id;
            const data = await CustomerModel.findById(id);
            if (!data) {
                console.log('data not found');
            }

            // console.log("editdta", data);
            // console.log("data", req.customer);

            const successMessage = req.flash("success-mssg");
            const errorMessage = req.flash("error-mssg");

            if (data) {
                res.render('updateProfilePage', {
                    editData: data,
                    data: data,
                    uData: edata,
                    successMessage,
                    errorMessage,
                })
            }
        } catch (error) {
            console.log(error);
        }
    }


    // ................................CUSOMER PROFILE UPDATE .................................


    async updateProfile(req, res) {

        try {

            const edata = await CustomerModel.findOne({ _id: req.customer.id })
            const id = req.params.id;

            // Validate the incoming request data using Joi
            const { error } = customerPrfileUpdateValidationSchema.validate(req.body);

            // If validation fails, return the error message
            if (error) {
                req.flash('error-mssg', error.details[0].message);
                return res.redirect('/frontened/viewprofile');
            }

            const { name, email, phone, address } = req.body;
            const data = { name, email, phone, address };

            const existingCustomer = await CustomerModel.findById(id);
            if (!existingCustomer) {
                req.flash("error-mssg", "Customer not found");
                return res.redirect('/frontened/viewprofile');
            }

            // Check if the email has changed
            const emailUpdated = email !== existingCustomer.email;
            // If the email has changed, ensure it's unique across all models
            if (emailUpdated) {
                // Check in the CustomerModel, UserModel, and AdminModel
                const emailInCustomer = await CustomerModel.findOne({ email });
                const emailInUser = await UserModel.findOne({ email });
                const emailInAdmin = await adminModel.findOne({ email });

                // If the email already exists in any model, throw an error
                if (emailInCustomer || emailInUser || emailInAdmin) {
                    req.flash("error-mssg", "Email is already registered.");
                    return res.redirect('/frontened/viewprofile');
                }
            }

            const updateData = await CustomerModel.findByIdAndUpdate(id, data, {
                new: true,
            });

            // console.log(updateData);

            // If the email has changed, create a token for email verification
            if (emailUpdated) {
                const tokenModel = new CustomertokenModel({
                    _customerId: updateData._id,
                    token: crypto.randomBytes(16).toString("hex"),
                });

                await tokenModel.save();

                const senderEmail = "swarnadebnath05@gmail.com";
                const senderPassword = "pqyi rqql xvdb mmqk";

                const transporter = helper.transport(senderEmail, senderPassword);

                // Email options
                const mailOptions = {
                    from: "noreply@raju.com",
                    to: updateData.email,
                    subject: "Profile Update",
                    text: `Hello ${updateData.name},\n\nthis is your new:\n\nEmail: ${email}\n\nYour profile is updated successfully, Please log in with your new mail id.\n\nBest regards,\nAdmin`
                };
                // Send the email
                helper.mailSender(req, res, transporter, mailOptions);
                req.flash("success-mssg", "Profile updated successfully")
                // Redirect to the login page after updating email
                return res.redirect('/frontened/loginpage');
            }

            // If email wasn't updated, just redirect to the view profile page
            req.flash("success-mssg", "Profile updated successfully");
            res.redirect('/frontened/viewprofile')

        } catch (error) {
            console.log(error);

        }
    }


    // ................................CUSOMER ALL COMPLETE TICKET .................................


    async allCompleteRaiseTickets(req, res) {
        try {

            const data = await CustomerModel.findOne({ _id: req.customer.id })

            const completedTickets = await ServiceModel.find({
                createdBy: req.customer.id,
                status: 'complete'
            });


            res.render('allRaiseTickets', {
                tickets: completedTickets,
                data: req.customer,
                uData: data,
            });
        } catch (error) {
            console.error('Error retrieving tickets:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }


    // ................................CUSOMER ALL PENDING TICKET .................................


    async allPendingRaiseTickets(req, res) {
        try {

            const data = await CustomerModel.findOne({ _id: req.customer.id })

            const pendingTickets = await ServiceModel.find({
                createdBy: req.customer.id,
                status: 'pending'
            });


            res.render('allPendingTickets', {
                tickets: pendingTickets,
                data: req.customer,
                uData: data,
            });
        } catch (error) {
            console.error('Error retrieving tickets:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }


    //...........................UPDATE PASSWORD.................................



    async updatePassword(req, res) {

        try {
            const user_id = req.customer.id;
            // console.log("id", user_id);

            // Validate the incoming request data using Joi
            const { error } = passwordValidationSchema.validate(req.body);

            // If validation fails, return the error message
            if (error) {
                req.flash('error-mssg', error.details[0].message);
                return res.redirect('/frontened/account');
            }

            const { password } = req.body;

            //check userid exist ir not
            const data = await CustomerModel.findOne({ _id: user_id });
            // console.log("data", data);

            if (data) {
                const newPassword = await helper.HashPassword(password);
                const userData = await CustomerModel.findByIdAndUpdate(
                    { _id: user_id },
                    {
                        $set: {
                            password: newPassword,
                        },
                    }
                );

                res.clearCookie("customer_token")
                res.redirect('/frontened/loginpage')
            } else {
                console.log(error);
            }
        } catch (error) {
            console.log(error);

        }
    }

    //...........................UPDATE MAIL ID.................................


    async updateMailId(req, res) {
        try {
            const user_id = req.customer.id; // Retrieve customer ID from the request

            // Fetch the customer data using the correct identifier
            const existingCustomer = await CustomerModel.findById(user_id);
            if (!existingCustomer) {
                return res.status(404).json({ message: "Customer not found" });
            }

            // Validate the incoming request data using Joi
            const { error } = emailValidationSchema.validate(req.body);

            // If validation fails, return the error message
            if (error) {
                req.flash('error-mssg', error.details[0].message);
                return res.redirect('/frontened/account');
            }

            const { email } = req.body;

            // Check if the email has changed
            const emailUpdated = email !== existingCustomer.email;

             // If the email has changed, ensure it's unique across all models
             if (emailUpdated) {
                // Check in the CustomerModel, UserModel, and AdminModel
                const emailInCustomer = await CustomerModel.findOne({ email });
                const emailInUser = await UserModel.findOne({ email });
                const emailInAdmin = await adminModel.findOne({ email });

                // If the email already exists in any model, throw an error
                if (emailInCustomer || emailInUser || emailInAdmin) {
                    req.flash("error-mssg", "Email is already registered.");
                    return res.redirect('/frontened/account');
                }
            }

            // Update the customer's email in the database
            const updateData = await CustomerModel.findByIdAndUpdate(
                user_id,
                { email }, // Update the email
                { new: true } // Return the updated document
            );

            if (emailUpdated) {
                // Generate a new verification token
                const tokenModel = new CustomertokenModel({
                    _customerId: updateData._id,
                    token: crypto.randomBytes(16).toString("hex"),
                });

                await tokenModel.save();

                const senderEmail = "swarnadebnath05@gmail.com";
                const senderPassword = "pqyi rqql xvdb mmqk";

                const transporter = helper.transport(senderEmail, senderPassword);

                // Email options
                const mailOptions = {
                    from: "noreply@raju.com",
                    to: updateData.email,
                    subject: "Profile Update",
                    text: `Hello ${updateData.name},\n\nThis is your new:\n\nEmail: ${email}\n\nYour profile is updated successfully. Please log in with your new email ID.\n\nBest regards,\nAdmin`,
                };

                // Send the email
                helper.mailSender(req, res, transporter, mailOptions);

                // Redirect or render the login page
                return res.render('customerloginpage', {
                    data: req.customer,
                    uData: updateData,
                });
            }
            req.flash("success-mssg", "Email updated successfully!please login");
            // Redirect back to the profile view if no email update was needed
            res.redirect('/frontened/loginpage');
        } catch (error) {
            console.error("Error updating email:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }


    //...........................CUSTOMER GiVE REVIEW PAGE.................................


    async reviewpage(req, res) {
        try {
            const data = await CustomerModel.findOne({ _id: req.customer.id })
            res.render('giveReview', {
                uData: data
            })
        } catch (error) {
            console.log(error);

        }
    }


    //...........................CUSTOMER GiVE REVIEW.................................


    async submitReview(req, res) {

        try {
            const { service, rating, review } = req.body;


            // Save review in database
            const newReview = new ReviewModel({

                service,
                rating,
                review,
                image: req.file ? req.file.path : null
            });

            await newReview.save();

            res.redirect('/frontened/dashboard')

        } catch (error) {
            console.error("Error submitting review:", error);
        }
    }


    async customerLogout(req, res) {
        res.clearCookie('customer_token')
        req.flash('success_msg', 'successfully logout')
        return res.redirect('/frontened/loginpage')

    }







}


module.exports = new CustomerController()