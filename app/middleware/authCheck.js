const jwt = require('jsonwebtoken')
const Role = require('../module/backend_module/role/model/role.model')

const adminAuth = (req, res, next) => {
    if (req.cookies && req.cookies.admin_token) {
        jwt.verify(req.cookies.admin_token, process.env.ADMIN_SECRET_KEY, (err, data) => {
            if (!err) {
                req.admin = data;
                next()
            } else {
                req.flash("error_msg", "you need to login first!!");
                res.redirect('/admin/loginpage');
            }

        })
    }
    else {
        console.log("admin cookie data not found");
        req.flash("error_msg", "you need to login first!!");
        res.redirect('/admin/loginpage');
    }
}

const adminRolePermissionCheck = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const role = await Role.findOne({ _id: req.admin.role });
        if (!role || !role.permissions.includes(requiredPermission)) {
              req.flash("error_msg", "Forbidden: No Permission");
           res.redirect("/admin/loginpage");
      }
      next();
    } catch (error) {
        res.redirect("/admin/loginpage");
    }
  };
};

const userAuth = (req, res, next) => {
    if (req.cookies && req.cookies.user_token) {
        jwt.verify(req.cookies.user_token, process.env.USER_SECRET_KEY, (err, data) => {
            if (!err) {
                req.user = data;
                next();
            } else {
                console.error("JWT verification failed:", err.message);
                req.flash("error_msg", "You need to log in first!");
                return res.redirect('/user/loginpage');
            }
        });
    } else {
        console.log("No user_token cookie found.");
        req.flash("error_msg", "You need to log in first!");
        return res.redirect('/user/loginpage');
    }
};

const userRolePermissionCheck = (requiredPermission) => {
    return async (req, res, next) => {
      try {
        const role = await Role.findOne({ _id: req.user.role });
        
        // If the role is not found or permissions don't include the required permission
        if (!role || !role.permissions.includes(requiredPermission)) {
          req.flash("error_msg", "Forbidden: No Permission");
          return res.redirect("/user/loginpage"); // Ensure that after redirect we return to avoid calling next()
        }
  
        // If the role has the required permission, proceed to the next middleware
        next();
      } catch (error) {
        // In case of an error, redirect to the login page
        return res.redirect("/user/loginpage"); // Ensure that after redirect we return to avoid calling next()
      }
    };
  };
  




const customerAuth = (req, res, next) => {
    // Check if the token is present in the cookies
    if (req.cookies && req.cookies.customer_token) {
        // Verify the token using the secret key
        jwt.verify(req.cookies.customer_token, process.env.CUSTOMER_SECRET_KEY, (err, decoded) => {
            if (err) {
                console.error("JWT verification failed:", err.message);
                req.flash("error_msg", "Your session has expired, please log in again.");
                return res.redirect('/frontened/loginpage');
            }
            // Attach the decoded user data to the request object
            req.customer = decoded;  // This will store the customer info in req.customer
            // console.log("Decoded user data:", req.customer);
            next();  // Proceed to the next middleware or route handler
        });
    } else {
        console.log("No customer_token cookie found.");
        req.flash("error_msg", "You need to log in first!");
        return res.redirect('/frontened/loginpage');
    }
};






module.exports = {
  adminAuth,
  userAuth,
  customerAuth,
  adminRolePermissionCheck,
  userRolePermissionCheck,
};