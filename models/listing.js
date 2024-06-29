const mongoose = require('mongoose');
const Review = require('./review');
const User = require("./user");
const Schema = mongoose.Schema;

const listningSchema = new Schema({
    item : {
        type : String,
        require : true,
    },
    description : String,
    image : {
        type : String,
        default : "https://static.asianpaints.com/content/dam/asian_paints/blog/wood/benefits-of-wooden-furniture/image-1-asian-paints-m.jpeg",
        set: (v) => v === "" ? "https://static.asianpaints.com/content/dam/asian_paints/blog/wood/benefits-of-wooden-furniture/image-1-asian-paints-m.jpeg" : v,
    },
    price : Number,
    status : {
        type : Boolean,
        default : true,
    },
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review"
        }
    ],
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
});

listningSchema.post("findOneAndDelete", async (listing) => {
    if(listing){
        await Review.deleteMany({_id : {$in: listing.reviews} });
    }
})

const Listing = mongoose.model("Listing",listningSchema);
module.exports = Listing;

