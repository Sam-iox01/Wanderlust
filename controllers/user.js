const User = require('../Model/user.js');

module.exports.renderSignUpForm =  (req, res) => {
    res.render("user/signup");
}

module.exports.singUp = async (req, res, next) => {
    try {
        let { username, email, password } = req.body.user;
        let user = new User({ username, email });
        let registeredUser = await User.register(user, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            };
            req.flash("success", "Welcome to Wanderlust");
            return res.redirect("/listings");

        });
    }
    catch (e) {
        req.flash("error", e.message);
        return res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("user/login.ejs");
};

module.exports.login = async (req, res) => {

    req.flash("success", "Welcome to Wanderlust");

    res.redirect(req.session.redirectUrl || "/listings");

};

module.exports.logout =async (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You have logged out successfully!");
        res.redirect("/listings");
    });
};