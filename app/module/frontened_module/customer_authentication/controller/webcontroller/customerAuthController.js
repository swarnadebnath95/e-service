const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const helper = require('../../../../../helper/helper')
const CustomerModel = require("../../model/customerModel");
const AdminModel = require("../../../../backend_module/admin/model/adminModel");
const UserModel = require("../../../../backend_module/admin/model/userModel");
const CustomerTokenModel = require('../../model/customertTokenModel')
const customerRegValidationSchema = require('../../../../../helper/customerRegValidation')
const { HashPassword } = require("../../../../../helper/helper");



class CustomerAuthenticationController {


    // ................................ADMIN REGISTRATION PAGE.................................


    async registrationPage(req, res) {
        const successMessage = req.flash("success-mssg");
        const errorMessage = req.flash("error-mssg");

        res.render('customerRegPage', {

            successMessage,
            errorMessage,

        });
    }


    // .................................ADMIN CREATE REGISTER..................................


    async registerCustomer(req, res) {

        try {
            // Validate the incoming request data using Joi
            const { error } = customerRegValidationSchema.validate(req.body);

            // If validation fails, return the error message
            if (error) {
                req.flash('error-mssg', error.details[0].message);
                return res.redirect('/frontened/registerpage');
            }
            const { name, email, password, address, phone } = req.body;

            if (!email) {
                console.log(`email is required`);
                req.flash("error-mssg", "Email is required");
                return res.redirect('/frontened/registerpage')
            }
            if (!password) {
                console.log(`password is required`);
                req.flash("error-mssg", "password required.");
                return res.redirect('/frontened/registerpage')
            }

            // Check if email is unique across all models
            const emailInCustomer = await CustomerModel.findOne({ email });
            const emailInUser = await UserModel.findOne({ email });
            const emailInAdmin = await AdminModel.findOne({ email });

            if (emailInCustomer || emailInUser || emailInAdmin) {
                req.flash("error-mssg", "This email is already registered another account, please try another.");
                return res.redirect("/frontened/registerpage");
            }

            const hashpassword = await HashPassword(password)

            const user = new CustomerModel({
                name,
                password: hashpassword,
                email,
                phone,
                address,
                isCustomer: true
            })

            await user.save()

            const tokenModel = new CustomerTokenModel({
                _customerId: user._id,
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
                text: 'Hello ' + req.body.name + ',\n\n' + 'Please verify your account by clicking the link:' + `http://localhost:1456/frontened/confirmation/${user.email}/${tokenModel.token}` + '\n\nThank You!\n'
            };
            helper.mailSender(req, res, transporter, mailOptions);


            req.flash("success-mssg", "Registered successfully! Please check your email to verify your account.");
            return res.redirect("/frontened/loginpage");

        } catch (error) {
            req.flash("error_mssg", "Internal Server Error");
            return res.redirect('/frontened/registerpage')

        }
    }


    // ...................................CONFIRMATION MAIL..................................


    async confirmation(req, res) {

        try {
            const token = await CustomerTokenModel.findOne({ token: req.params.token });

            if (!token) {
                console.log("token can not get");
                req.flash("error_mssg", "Verification link may be expired");
                return res.redirect("/frontened/registerpage");
            }

            const user = await CustomerModel.findOne({
                _id: token._customerId,
                email: req.params.email,
            });
            if (!user) {
                req.flash("error_mssg", "User not found")
                res.redirect("/frontened/registerpage")
            }
            if (user.isVerified) {
                req.flash("error_mssg", "user is already verified");
                res.redirect("/frontened/registerpage")
            }
            user.isVerified = true;
            await user.save();

            if (user) {
                req.flash("success_mssg", "user verifed successFully")
                res.redirect("/frontened/loginpage")
            }

        } catch (error) {
            console.log(error);

        }
    }




    // ................................ADMIN LOGIN PAGE.................................


    async loginPage(req, res) {
        const successMessage = req.flash("success-mssg");
        const errorMessage = req.flash("error-mssg");
        res.render('customerloginpage', {
            role: req.customer?.role,
            successMessage,
            errorMessage,

        })

    }


    // ................................ADMIN LOGIN .................................


    async loginCustomer(req, res) {
        try {
            const { email, password } = req.body;

            // Check if the user exists
            const user = await CustomerModel.findOne({ email });
            if (!user) {
                req.flash("error-mssg", "Email is not registered");
                console.log("Email is not registered");
                return res.redirect('/frontened/loginpage');
            }

            // Check if the user is verified
            if (!user.isVerified) {
                req.flash("error-mssg", "user is not verified");
                console.log("User is not verified");
                return res.redirect('/frontened/loginpage');
            }

            // Compare password
            const matchpassword = await helper.ComparePassword(password, user.password);
            if (!matchpassword) {
                req.flash("error-mssg", "wrong password");
                console.log("Wrong password");
                return res.redirect('/frontened/loginpage');
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address
                },
                process.env.CUSTOMER_SECRET_KEY,
                { expiresIn: "12h" }
            );

            console.log("Customer token:", token);

            if (token) {
                res.cookie('customer_token', token, { httpOnly: true });  // Ensure the token is stored in cookies
                req.flash("success_mssg", "Customer login successfully");
                return res.redirect('/frontened/dashboard');
            } else {
                return res.redirect('/frontened/loginpage');
            }
        } catch (error) {
            console.log("Error during login:", error);
            res.redirect('/frontened/loginpage');
        }
    }


    // ......................ADMIN LOGOUT........................................


    async customerLogout(req, res) {
        res.clearCookie('customer_token')
        req.flash('success_mssg', 'successfully logout')
        return res.redirect('/frontened/loginpage')

    }




}


module.exports = new CustomerAuthenticationController()