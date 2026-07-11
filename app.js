if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport"); 
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Routes Require
const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const user = require("./models/user.js");

// Database URL setting (wanderlust ki jagah tripvista kar diya)
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/tripvista";

mongoose.connection.once("open", async () => {
    console.log("Connected Database:", mongoose.connection.name);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
});
// DATABASE CONNECTION
mongoose.connect(dbUrl)
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log("DB Connection Error:", err);
    });
   //EJS & MIDDLEWARE SETUP
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now() +7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
};
app.use(session(sessionOptions));
app.use(flash());

app.get("/", (req, res)=>{
    res.send("hi, i am root");
})
//passport Authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    
    next();
});
//Route
app.get("/", (req, res) => {
    res.redirect("/listings");
});
 // Demo user
app.get("/demouser", async(req, res)=>{
    let fakeuser = new user({
        email:"student@gmail.com",
        username: "delta-student"
    });
     let registeredUser = await User.register(fakeuser, "helloworld");
    res.send(registeredUser);
}); 
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});
app.listen(8080, () => {
    console.log("server is listening to port 8080");
});

