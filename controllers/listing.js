const Listing = require('../Model/listing.js');
const { listingSchema } = require('../schema.js');
const ExpressError = require('../utils/ExpressError.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const mapBoxToken = process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapBoxToken });



module.exports.index = async (req, res) => {
    const listingVariables = await Listing.find({});
    res.render("listing/index.ejs", { listingVariables });
};

module.exports.newform =  async (req, res) => {
    console.log(req.user);
    res.render("listing/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews",
        populate:{
            path: "author",
        },
    })
    .populate("Owner");
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    };

    if (!Array.isArray(listing.Geometry?.coordinates) || listing.Geometry.coordinates.length !== 2) {
        const response = await geoCodingClient.forwardGeocode({
            query: `${listing.location}, ${listing.country}`,
            limit: 1
        }).send();
        const geometry = response.body.features[0]?.geometry;

        if (geometry) {
            listing.Geometry = geometry;
            await listing.save();
        }
    }

    console.log(listing);
    res.render("listing/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
   let response = await geoCodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1
})
  .send();

    if (!req.file) {
        throw new ExpressError(400, "Please select an image to upload.");
    }

    const { path: url, filename } = req.file;
    console.log("Cloudinary upload:", { url, filename });
    req.body.listing.image = { url, filename };
    const listing = new Listing(req.body.listing);
    listing.image = { url, filename };
    listing.Geometry = response.body.features[0].geometry;
    listing.Owner = req.user._id;
    let savedListing = await listing.save();
    console.log("Saved listing:", savedListing);
    req.flash("success", "New listing created!");
    res.redirect("/listings");


};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    let originalImageURL = listing.image.url;
    originalImageURL = originalImageURL.replace("/upload", "/upload/w_300,h_250,");
    res.render("listing/edit.ejs", { listing , originalImageURL});
};

module.exports.updateListing =async (req, res) => {
    let result = listingSchema.validate(req.body);
    if (result.error) {
        throw new ExpressError(400, result.error);
    }
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true });
    if(typeof req.file !== "undefined") {  
     const { path: url, filename } = req.file;
     listing.image = { url, filename };
     await listing.save();
    };

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};
