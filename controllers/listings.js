const Listing = require("../models/listing.js");
module.exports.index = async (req, res) => {
   const listings = await Listing.find({}); 
    res.render("listings/index.ejs", { listings }); 
};
module.exports.renderNewForm =(req, res) => {
   
    res.render("listings/new.ejs");
};
// Show listings
module.exports.showlisting=(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate:{
            path:"author",
        },
    })
    .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!"); 
        return res.redirect("/listings"); 
    }
    console.log("LISTING =", listing);
    console.log("OWNER =", listing.owner);
    res.render("listings/show.ejs", { listing });
});
    // Create listings
module.exports.createlisting = (async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
   
    const newListing = new Listing(req.body.listing);
    console.log(req.user);
     newListing.owner = req.user._id;
     newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings"); 
});

      // edit listing
module.exports.rendereditForm = (async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    
    let originalImageUrl = listing.image?.url || listing.image?.Url; 
    
    if (originalImageUrl) {
        
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    } else {
        
        originalImageUrl = "https://via.placeholder.com/100"; 
    }
    
    res.render("listings/edit.ejs", { listing, originalImageUrl });
});


// update listings
module.exports.updatelisting = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    const { title, description, price, location, country }
     = req.body.listing;
    listing = await Listing.findByIdAndUpdate(
        id, 
        { title, description, price, location, country }, 
        { runValidators: true, new: true }
    );
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        
        listing.image = { url, filename };
        await listing.save();
    }
    else if (req.body.listing.image && typeof 
        req.body.listing.image === "string" && 
        req.body.listing.image.trim() !== "") {
        listing.image = { url: req.body.listing.image,
             filename: "listingimage" };
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};
   // Delete listings
    module.exports.destroylisting = (async (req, res) => {
            let { id } = req.params;
            let listing = await Listing.findById(id);
             if (!listing) {
                req.flash("error", "Listing does not exist!");
                return res.redirect("/listings");
            }
            let deletedListing = await Listing.findByIdAndDelete(id);
            console.log("Deleted Successfully:", deletedListing);
            req.flash("success", "Listing Deleted!");
            res.redirect("/listings");
        });