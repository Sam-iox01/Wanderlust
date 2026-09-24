const Listing = require("../Model/listing.js");
const Review = require("../Model/review.js");
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('../schema.js');

module.exports = {
    isLoggedIn: (req, res, next) => {
        console.log(req.user);
        if (!req.isAuthenticated()) {
            req.session.redirectTo = req.originalUrl;
            req.flash("error", "You must be logged in to do that");
            return res.redirect("/login");
        }
        next();
    }
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.local.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;

    let listing = await Listing.findById(id);
    if (!listing.Owner._id.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the owner of the listing");
        return res.redirect(`/listings/${id}`);
    };
    next();
}

module.exports.validateListing = (req, res, next) => {

    console.log("REQ.BODY =", req.body);

    const { error } = listingSchema.validate(req.body);

    if (error) {

        const errMsg = error.details.map((el) => el.message).join(",");

        throw new ExpressError(400, errMsg);

    }

    next();
};
module.exports.validateReview = (req, res, next) => {
      let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isreviewAuthor = async (req, res, next) => {
    let { reviewId } = req.params;

    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect("back");
    }
    next();
};

  
