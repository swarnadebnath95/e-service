const express = require("express");
const dotEnv = require("dotenv");
const bodyParser = require("body-parser");
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer')
const cookieParser = require("cookie-parser")
const cors = require("cors");
const path = require('path')
const MongodbConnection = require("./app/config/databaseConnection");

const app = express()
dotEnv.config()
MongodbConnection()

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use(
  session({
    cookie: {
      maxAge: 60000, // 1 minute for debugging
      httpOnly: true,
      secure: false, // Set to 'true' if using https (for production)
    },
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash())

app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", [
    path.join(__dirname, "views", "backend_views", "admin_authenticationViews"),
    path.join(__dirname, "views", "backend_views", "admin_dashboardViews"),
    path.join(__dirname, "views", "backend_views", "user_authenticationViews"),
    path.join(__dirname, "views", "backend_views", "user_dashboardViews"),
    path.join(__dirname, "views", "frontened_views"),
    path.join(__dirname, "views", "frontenedAuthentication_views"),
    path.join(__dirname, "views"),
]);


const adminAuthRoute = require('./app/routes/backendRoute/adminRoute/adminAuthenticationRoute')
app.use('/admin', adminAuthRoute)

const adminDashboardRoute = require('./app/routes/backendRoute/adminRoute/adminDashboardRoute')
app.use('/admin', adminDashboardRoute)

const userAuthRoute = require('./app/routes/backendRoute/userRoute/userAutheticationRoute')
app.use('/user', userAuthRoute)

const userDashboardRoute = require('./app/routes/backendRoute/userRoute/userDashboardRoute')
app.use('/user', userDashboardRoute)


const customerRoute = require('./app/routes/frontenedRoute/customerDashboardRoute')
app.use('/frontened', customerRoute)

const customerAuthRoute = require('./app/routes/frontenedRoute/customerAuthRoute')
app.use('/frontened', customerAuthRoute)

const roleRouter = require("./app/routes/backendRoute/role/role.routes");
app.use('/role',roleRouter)


const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`);

})