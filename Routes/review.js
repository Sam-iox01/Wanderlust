const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('../schema.js');
const Reviews = require('../Model/review.js');
const methodOvrride = require('method-override');
const Listing = require('../Model/listing.js');
const reviewController = require('../controllers/reviews.js');

const { isLoggedIn, isOwner, validateReview, isreviewAuthor } = require("./middleware.js");
// Reviews 
// POST route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.postReviews));

// Delete Review
router.delete("/:reviewId", isLoggedIn, isreviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;

