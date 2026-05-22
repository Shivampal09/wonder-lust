
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";


// ================= DB CONNECT =================
async function main(){
    await mongoose.connect(MONGO_URL);
}

main()
.then(() => console.log("connected to DB"))
.catch((err) => console.log(err));

// ================= MIDDLEWARE =================
app.engine("ejs", ejsMate);          // sabse pehle
app.set("view engine","ejs");

app.set("views", path.join(__dirname,"views"));
app.set("layout", "layouts/boilerplate");

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method")); 
app.use(express.static(path.join(__dirname,"public")));

// ================= ROUTES =================

// root → redirect
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// index route
app.get("/listings", wrapAsync(async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/index", { listings });
}));

// new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

// create route
app.post("/listings", wrapAsync(async (req, res,next) => {
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }

        const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    })
);

//  EDIT route
app.get("/listings/:id/edit",wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", { listing });
}));

//  UPDATE route
app.put("/listings/:id", wrapAsync(async (req, res) => {
     if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//   DELETE route
  //   app.delete("/listings/:id", async (req, res) => {
    // let { id } = req.params;
     //await Listing.findByIdAndDelete(id);
     //res.redirect("/listings");
 //});
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));
// show route (IMPORTANT: neeche hona chahiye)
app.get("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show", { listing });
}));

app.get("/testListing", wrapAsync(async (req, res) => {
    let sampleListing = new Listing({
        title: "My new Villa",
        description: "by the beach",
        price: 15000,
        location: "Calangute, Goa",
        country: "India"
    });

    await sampleListing.save();
    console.log("sample was saved");
    res.send("successful testing");
}));


// Use a JavaScript Regular Expression instead of a string
app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
}); 
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
   // res.render("error.ejs",{message});
       res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});