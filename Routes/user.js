const express = require("express");
const router = express.Router({});
const User = require("../Model/user.js");
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require("passport");
const { saveRedirectUrl } = require("./middleware.js");
const userController = require('../controllers/user.js');

router.route("/signup")
    .get(userController.renderSignUpForm)
    .post(wrapAsync(userController.singUp));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate("local",
        {
            failureFlash: true,
            failureRedirect: "/login"
        }),
        wrapAsync(userController.login))


router.get("/logout", wrapAsync(userController.logout));

module.exports = router; 
