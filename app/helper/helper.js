const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')


const HashPassword = async (password) => {

    try {
        return await bcrypt.hash(password, 10)
    } catch (error) {
        console.log(error);
    }
}

const ComparePassword = async (password, saltpassword) => {

    try {
        return await bcrypt.compare(password, saltpassword)
    } catch (error) {
        console.log(error);
    }
}

const transport = (senderEmail, password) => {
    var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: senderEmail,
            pass: password,
        }
    });
    return transporter
};

const mailSender = (req, res, trans, mailoptions) => {
    trans.sendMail(mailoptions, (err) => {
        if (err) {
            console.log("Technical Issue", err);
            req.flash("message", "Error occured in mail sending");
        } else {
            req.flash("message", "A Verfication Email Sent To Your Mail ID.... Please Verify By Click The Link.... It Will Expire By 24 Hrs...")
           
        }
    })
}


module.exports = {
    HashPassword,
    ComparePassword,
    transport,
    mailSender
}
