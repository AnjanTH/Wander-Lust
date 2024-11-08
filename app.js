const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejs_mate=require("ejs-mate");
const wrapAsync=require("./utils/wrapasync");
const ExpressError=require("./utils/expressError");

// Database connection
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
    console.log("connected to db");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs',ejs_mate);
// Use method override for PUT and DELETE requests
app.use(methodOverride("_method"));

// Body parser middleware to handle form submissions
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"/public")));
app.get("/", (req, res) => {
    res.send("working fine");
});

// Route to get all listings
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
});

// Route to create new listing page
app.get("/listings/new", (req, res) => {
    res.render("./listings/new.ejs");
});

// Route to get a specific listing by ID
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", { listing });
});

// Route to handle new listing form submission
app.post("/listings", wrapAsync (async (req, res,next) => {
 
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
 
   
}));

// Edit route to get the listing for editing
app.get("/listings/:id/edit", wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
}));

// Update route to handle listing updates
app.put("/listings/:id",wrapAsync( async (req, res) => {
    // let { id } = req.params;
    // await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    // res.redirect("/listings");
    let { id } = req.params;
    const updatedListing = req.body.listing;

    
    if (updatedListing.image) {
        updatedListing.image = { url: updatedListing.image }; 
    }

    await Listing.findByIdAndUpdate(id, { ...updatedListing });
    res.redirect(`/listings`);
}));

// Route to delete a listing by ID
app.delete("/listings/:id", wrapAsync( async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id); 
    res.redirect("/listings");
}));

app.all("*",(req,res,next)=>{
next(new ExpressError(404,"page not found "));
});
app.use((err,req,res,next)=>{
    let {status=404,message="somethong went wrong"}=err;
    // res.status(404).send(message);
    res.render("./listings/error.ejs",{message});
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});
