const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema ,reviewSchema } = require("./schema.js");

module.exports.issLoggedin = (req, res, next)=>{
    if (!req.isAuthenticated()) {
        req.flash("error","you must me logged-in before creating listings");
        return res.redirect("/users/login");
    }
   next();    
};

module.exports.issOwner = async(req, res, next) =>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.crrUser._id)) {
        req.flash("error","You are not the owner of the Listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.velidateListing = (req, res, next)=> {
    let { error } = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
}

module.exports.velidateReview = (req, res, next)=> {
    let { error } = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg)
    } else{
        next();
    }
}