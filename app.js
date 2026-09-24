if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./Model/listing.js');
const path = require('path');
const methodOvrride = require('method-override');
const ejsmate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('./schema.js');
const Reviews = require('./Model/review.js');
const listingRouter = require('./Routes/listing.js');
const reviewRouter = require("./Routes/review");
const userRouter = require("./Routes/user.js");
const flash = require("connect-flash");
const session = require("express-session");
const User = require("./Model/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const { MongoStore } = require('connect-mongo');


const dburl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("Connected to MongoDB");
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });
}).catch((err) => {
    console.error("Error connecting to MongoDB", err);
    process.exitCode = 1;
});

async function main() {
    await mongoose.connect(dburl);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOvrride('_method'));
app.engine('ejs', ejsmate);
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
    mongoUrl : dburl,
   crypto : {
    secret : process.env.SECRET
   },
   touchAfter : 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err)
});

const sesseionConfig = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.get('/', (req, res) => {
    res.send("Hello World");
});



app.use(session(sesseionConfig));
app.use(flash());

// Initialize the passpport and session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    console.log(res.locals.success);
    console.log(res.locals.error);
    next();

});

app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
         email: "student@gmail.com",
         username: "delta-Student",
     });
     let registeredUser = await User.register(fakeUser, "Helloworld");
     res.send(registeredUser);
   
   
});

// routes:-
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.all("/*spalt", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("listing/error.ejs", { err });

});


