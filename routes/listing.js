const express = require('express');
const router = express.Router();
const Listing = require('../models/listing.js');
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { issLoggedin , issOwner ,velidateListing } = require("../middleware.js");

//Listings
//All listings
router.get("/",wrapAsync( async(req,res)=>{
    // await Listing.deleteMany({title:"test"});
    let allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}))

//Search listings
router.post("/search",wrapAsync( async(req,res)=>{
    let Listings = req.body;
    if (Listings.price !== "Any" ) {
        Listings.price = parseInt(Listings.price);
    }
    console.log(Listings);
    let query = {};
    if (Listings.item !== "All") {
        query.item = Listings.item;
    }
    if (Listings.price !== "Any" ) {
        query.price = { $lte: Listings.price };
    }

    let allListings = await Listing.find(query);
    res.render("listings/index.ejs", { allListings });
}))

//Show listings
router.get("/:id", wrapAsync( async(req,res)=>{
    let { id } = req.params;
    let listing =  await Listing.findById(id).populate("reviews");
    let user = await User.findById(listing.owner);
    if(!listing){
        req.flash("error","Listing dose not Exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{ listing: listing, user: user });
}))

//New listings
router.get("/new/add", issLoggedin ,(req,res)=>{
    res.render("listings/new.ejs");
})

router.post("/", issLoggedin , velidateListing, wrapAsync( async(req,res)=>{
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success","New listing created!");
    res.redirect("/listings");
}))

//Edit listings
router.get("/:id/edit", issLoggedin, issOwner ,wrapAsync( async(req,res)=>{
    let { id } = req.params;
    let listing =  await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing dose not Exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{ listing });
}))

router.put("/:id", issLoggedin, issOwner , velidateListing ,wrapAsync( async(req,res)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing , status : true });
    req.flash("success","listing Updated!");
    res.redirect(`/listings/${id}`);
}))

//delete listings
router.delete("/:id", issLoggedin, issOwner ,wrapAsync( async(req,res)=>{
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","listing Deleted!");
    res.redirect("/listings");
}))

module.exports = router;