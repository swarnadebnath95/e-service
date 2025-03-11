const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const helper = require('../../../../../helper/helper')
const AdminModel = require("../../model/adminModel");
const UserModel = require("../../model/userModel");
const Role = require('../../../role/model/role.model')

const CustomerModel=require('../../../../frontened_module/customer_authentication/model/customerModel')
const TokenModel = require('../../model/tokenModel')
const { HashPassword } = require("../../../../../helper/helper");
const Joi = require('joi');
const adminRegValidationSchema = require('../../../../../helper/adminRegValidation')
const passwordValidationSchema = require('../../../../../helper/passwordValidation')
const emailValidationSchema = require('../../../../../helper/emailValidation')




class AdminAuthenticationController {


    // ................................ADMIN REGISTRATION PAGE.................................


    async registrationPage(req, res) {
        const successMessage = req.flash("success-mssg");
        const errorMessage = req.flash("error-mssg");
        res.render("registrationPage", {
            successMessage,
            errorMessage,
        });
    }


    // .................................ADMIN CREATE REGISTER..................................


    async registerAdmin(req, res) {

        try {

            // Validate the incoming request data using Joi
            const { error } = adminRegValidationSchema.validate(req.body);

            // If validation fails, return the error message
            if (error) {
                req.flash('error-mssg', error.details[0].message);
                return res.redirect('/admin/registerpage');
            }

            const { name, email, image, phone, password } = req.body; // Use validated values

            // Step 1: Check if the email exists in AdminModel
            const existingEmail = await AdminModel.findOne({ email })
            if (existingEmail) {
                req.flash(
                    "error-mssg",
                    "This email is already registered as an admin, please login"
                );
                return res.redirect('/admin/registerpage')
            }

            // Step 2: Check if the email exists in UserModel
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                req.flash(
                    "error-mssg",
                    "This email is already registered as a user, please use another email"
                );
                return res.redirect('/admin/registerpage');
            }

            // Step 3: Check if the email exists in CustomerModel
            const existingCustomer = await CustomerModel.findOne({ email });
            if (existingCustomer) {
                req.flash(
                    "error-mssg",
                    "This email is already registered as a customer, please use another email"
                );
                return res.redirect('/admin/registerpage');
            }

            const hashpassword = await HashPassword(password)
            const role = await Role.findOne({ name: "admin" });

            const user = new AdminModel({
                name,
                password: hashpassword,
                email,
                phone,
            })

            if (role) {
                user.role = role._id
            }
            console.log(role, 'role');
            console.log(user, 'user');

            if (req.file) {
                user.image = req.file.path;
            }
            // console.log(req.file);


            await user.save()

            const tokenModel = new TokenModel({
                _userId: user._id,
                token: crypto.randomBytes(16).toString("hex"),
            });

            await tokenModel.save();

            const senderEmail = "swarnadebnath05@gmail.com";
            const senderPassword = "pqyi rqql xvdb mmqk";

            const transporter = helper.transport(senderEmail, senderPassword);

            const mailOptions = {
                from: senderEmail,
                to: user.email,
                subject: "Email Verification ",
                text: 'Hello ' + req.body.name + ',\n\n' + 'Please verify your account by clicking the link:' + `http://localhost:1456/admin/confirmation/${user.email}/${tokenModel.token}` + '\n\nThank You!\n'
            };
            helper.mailSender(req, res, transporter, mailOptions);


            if (user) {
                req.flash("success-mssg", "Registered successfully,A verification mail send to your registered mail id");
                return res.redirect('/admin/loginpage')
            } else {
                req.flash("error-mssg", "Internal Server Error");
                console.log(error);
                return res.redirect('/admin/registerpage')
            }

        } catch (error) {
            req.flash("error-mssg", "Error in creating user");
            return res.redirect('/admin/registerpage')

        }
    }


    // ...................................CONFIRMATION MAIL..................................


    async confirmation(req, res) {

        try {
            const token = await TokenModel.findOne({ token: req.params.token });

            if (!token) {
                console.log("token can not get");
                req.flash("error-mssg", "Verification link may be expired");
                return res.redirect("/admin/registerpage");
            }

            const user = await AdminModel.findOne({
                _id: token._userId,
                email: req.params.email,
            });
            if (!user) {
                req.flash("error-mssg", "User not found")
                res.redirect("/admin/registerpage")
            }
            if (user.isVerified) {
                req.flash("error-mssg", "user is already verified");
                res.redirect("/admin/registerpage")
            }
            user.isVerified = true;
            await user.save();

            if (user) {
                req.flash("success-mssg", "user verifed successFully,please login")
                res.redirect("/admin/loginpage")
            }

        } catch (error) {
            console.log(error);

        }
    }




    // ................................ADMIN LOGIN PAGE.................................


    async loginPage(req, res) {
        const successMessage = req.flash("success-mssg");
        const errorMessage = req.flash("error-mssg");
        res.render("loginPage", {
            role: req.admin?.role,
            successMessage,
            errorMessage,
        });

    }


    // ................................ADMIN LOGIN .................................


    async loginAdmin(req, res) {

        try {
            const { email, password } = req.body;

            //check user
            const user = await AdminModel.findOne({ email });

            if (!user) {
                console.log(`email is not registered`);
                req.flash("error-mssg", "email is not registered");
                return res.redirect('/admin/loginpage')
            }
            if (user.isVerified === false) {
                console.log(`user is not registered`);
                req.flash("error-mssg", "admin is not verified");
                return res.redirect('/admin/loginpage')
            }
            const matchpassword = await helper.ComparePassword(password, user.password);

            if (!matchpassword) {
                console.log(`wrong password`);
                req.flash("error-mssg", "wrong password");
                return res.redirect('/admin/loginpage')
            }

            const token = jwt.sign(
                {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    image: user.image,
                    role: user.role

                },
                process.env.ADMIN_SECRET_KEY,
                { expiresIn: "12h" }
            );
            if (token) {
                res.cookie('admin_token', token)
                req.flash("success-mssg", "Admin Login successfully");
                res.redirect('/admin/dashboard')
            }
            else {
                req.flash("error-mssg", "Admin Login unsuccessfull");
                return res.redirect('/admin/loginpage')


            }

        } catch (error) {
            console.log(error);

        }
    }


    // ......................ADMIN LOGOUT........................................


    async adminLogout(req, res) {
        res.clearCookie('admin_token')

        req.flash("success-mssg", 'successfully logout Please login')
        return res.redirect('/admin/loginpage')

    }


    // ....................................FORGET PASSWORD PAGE............................... 


    async forgetPasswordpPage(req, res) {

        try {
            const successMessage = req.flash("success-mssg");
            const errorMessage = req.flash("error-mssg");
            res.render("forgetPasswordPage", {
                title: "Forget Password",
                successMessage,
                errorMessage,
            });

        } catch (err) {
            console.log(err);

        }
    }


    // ....................................FORGET PASSWORD............................... 


    async forgetPassword(req, res) {

        try {

            // Validate the incoming request data using Joi
            const { error } = emailValidationSchema.validate(req.body);

            // If validation fails, return the error message
            if (error) {
                req.flash('error-mssg', error.details[0].message);
                return res.redirect('/admin/forget-passwordPage');
            }

            const { email } = req.body;
            if (!email) {
                console.log("Email is required");
                req.flash("error-mssg", 'email id is required')
                return res.status(400).json({ message: "Email is required" });
            }

            //check email exist or not
            const admin = await AdminModel.findOne({ email });
            if (!email) {
                console.log("Email is required");
                return res.status(400).json({ message: "Email is required" });
            }
            const token_data = await TokenModel.findOne({ _userId: admin._id })
            console.log('admin', admin, token_data);

            if (!admin) {
                console.log("wrong email");
                req.flash("error-mssg", 'wrong mail id')

            } else {

                const senderEmail = "swarnadebnath05@gmail.com";
                const senderPassword = "pqyi rqql xvdb mmqk";

                const transporter = helper.transport(senderEmail, senderPassword);

                const mailOptions = {
                    from: senderEmail,
                    to: admin.email,
                    subject: "Reset Your password",
                    text:
                        "Hello " +
                        admin.name +
                        ",\n\n" +
                        "Please reset your password by clicking the link: \nhttp://" +
                        "localhost:1456/admin" +
                        "/reset_passwordPage?email=" +
                        admin.email +
                        "\n\nThank You!\n",
                };

                helper.mailSender(req, res, transporter, mailOptions);
            }


            req.flash("success-mssg", "A verification mail send to your registered mail id for new password");
            res.redirect('/admin/forget-passwordPage')


        } catch (error) {
            console.log("error message", error.message);
            return res.status(500).json({ message: "Internal server error" });
        }
    }


    //............................................RESET PASSWORD PAGE.......................


    async resetPWpage(req, res) {

        try {
            // console.log("req query", req.query);
            const successMessage = req.flash("success-mssg");
            const errorMessage = req.flash("error-mssg");

            res.render("resetPasswordPage", {
                title: "Reset Password",
                data: req.admin,
                email: req.query.email,
                successMessage,
                errorMessage,
            });

        } catch (err) {
            console.log(err);
        }
    }


    //............................................RESET PASSWORD.......................


    async resetPassword(req, res) {

        try {

            const { email, newPassword } = req.body; // Use validated values

            // console.log("new pw", newPassword, email);

            // Validate the new password
            const { error } = passwordValidationSchema.validate({ password: newPassword });

            if (error) {
                // If validation fails, send the validation error message back to the user
                req.flash("error-mssg", error.details[0].message);
                return res.redirect("/admin/reset_passwordPage");  // Stay on the reset page
            }

            // //check email exist or not
            const admin = await AdminModel.findOne({ email });
            // console.log("user", admin);

            if (!admin) {
                req.flash("error-mssg", "user not found");
            }
            const hashed = await HashPassword(newPassword);
            const resetPW = await AdminModel.findByIdAndUpdate(admin._id, {
                password: hashed,
            });
            if (!resetPW) {
                req.flash("error-mssg", "Password Reset Not Successful");
                res.redirect("/admin/reset_passwordPage")
            } else {
                req.flash("success-mssg", "Password Reset Successfully,Please login!")
                res.redirect("/admin/loginpage")
            }
        } catch (error) {
            console.log(error.message);

        }
    }


    //...........................UPDATE PASSWORD.................................



    async updatePassword(req, res) {

        try {
            const user_id = req.admin.id;
            // console.log("id", user_id);

            const { password } = req.body;

            // Validate the new password
            const { error } = passwordValidationSchema.validate({ password });

            if (error) {
                // If validation fails, send the validation error message back to the user
                req.flash("error-mssg", error.details[0].message);
                return res.redirect("/admin/viewprofile");  // Stay on the change password page
            }


            //check userid exist ir not
            const data = await AdminModel.findOne({ _id: user_id });
            // console.log("data", data);

            if (data) {
                const newPassword = await HashPassword(password);
                const userData = await AdminModel.findByIdAndUpdate(
                    { _id: user_id },
                    {
                        $set: {
                            password: newPassword,
                        },
                    }
                );

                res.clearCookie("admin_token")
                req.flash("success-mssg", "Password updated successfully, Please login");
                res.redirect('/admin/loginpage')
            } else {
                console.log(error);
                req.flash("error-mssg", "An error occurred while updating password");
            }
        } catch (error) {
            req.flash("error-mssg", "An error occurred while updating password.");
            console.log(error);

        }
    }


}


module.exports = new AdminAuthenticationController()