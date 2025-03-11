const UserModel = require('../../../admin/model/userModel')
const { HashPassword, ComparePassword } = require('../../../../../helper/helper')
const passwordValidation=require('../../../../../helper/passwordValidation')
const jwt = require("jsonwebtoken");
const crypto = require("crypto");



class UserAuthenticationController {


    // ....................................USER LOGIN PAGE.................................


    async userLoginPage(req, res) {
        try {
            const successMsg = req.flash("success-mssg");
            const errorMsg = req.flash("error-mssg");
            console.log("successMessage",successMsg)
            console.log("errorMessage",errorMsg)
            res.render("userLoginPage", {
                successMsg,
                errorMsg,
            })
        } catch (error) {
            console.log(error);

        }

    }


    // ....................................USER LOGIN.................................


    async loginUser(req, res) {
        try {
            const { email, password } = req.body;
    
            // Check if email is provided
            if (!email) {
                console.log("Email is required");
                req.flash("error-mssg", "Email is required");
                return res.redirect('/user/loginPage');
            }
    
            // Check if password is provided
            if (!password) {
                console.log("Password is required");
                req.flash("error-mssg", "Password is required");
                return res.redirect('/user/loginPage');
            }
    
            // Check if email exists in the database
            const existingEmail = await UserModel.findOne({ email });
            if (!existingEmail) {
                console.log("Email not found");
                req.flash("error-mssg", "Email not registered");
                return res.redirect('/user/loginPage');
            }
    
            // Check if the password matches
            const matchPassword = await ComparePassword(password, existingEmail.password);
            if (!matchPassword) {
                console.log("Wrong password");
                req.flash("error-mssg", "Wrong password");
                return res.redirect('/user/loginPage');
            }
    
            // Create JWT token
            const token = jwt.sign({
                id: existingEmail._id,
                name: existingEmail.name,
                email: existingEmail.email
            }, process.env.USER_SECRET_KEY, { expiresIn: '12h' });
    
            res.cookie('user_token', token, {
                httpOnly: true,
                secure: false,
                maxAge: 12 * 60 * 60 * 1000, // 12 hours
            });
    
            // Successful login
            req.flash("success-mssg", "User Login successful");
            return res.redirect('/user/dashboard');
    
        } catch (error) {
            console.error("Login error:", error.message);
            req.flash("error-mssg", "An error occurred during login");
            return res.redirect('/user/loginPage');
        }
    }
    
    




    // ......................USER LOGOUT........................................


    async userLogout(req, res) {
        res.clearCookie('user_token')
        req.flash('success_mssg', 'successfully logout')
        return res.redirect('/user/loginpage')

    }


    // ....................................USER UPDATE PASSWORD.................................


    async updatePassword(req, res) {

        try {
            const user_id = req.user.id;
            console.log("id", user_id);

             // Validate the incoming request data using Joi
             const { error } = passwordValidation.validate(req.body);

             // If validation fails, return the error message
             if (error) {
                 req.flash('error-mssg', error.details[0].message);
                 return res.redirect('/user/dashboard');
             }

            const { password } = req.body;
            console.log("Password received:", password);

            //check userid exist ir not
            const data = await UserModel.findOne({ _id: user_id });
            // console.log("data", data);

            if (data) {
                const newPassword = await HashPassword(password);
                const userData = await UserModel.findByIdAndUpdate(
                    { _id: user_id },
                    {
                        $set: {
                            password: newPassword,
                        },
                    }
                );

                res.clearCookie("user_token")
                req.flash('success_mssg', 'password updated successfully,please login!')
                res.redirect('/user/dashboard')
            } else {
                console.log(error);

            }
        } catch (error) {
            console.log(error);

        }
    }



}


module.exports = new UserAuthenticationController()