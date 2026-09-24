const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../Model/listing.js');
const methodOvrride = require('method-override');
const { isLoggedIn, isOwner, validateListing } = require("./middleware.js");
const listingController = require('../controllers/listing.js');
const multer = require('multer');
const { storage } = require('../cloudconfig.js');
const upload = multer({ storage });



router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));    

// New Route
router.get("/new", isLoggedIn, listingController.newform);

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isOwner, isLoggedIn,upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.deleteListing));





module.exports = router;
