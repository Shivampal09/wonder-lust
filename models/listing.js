const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,

    image: {
        filename: {
            type: String,
            default: "listingimage"   // ✅ required hata diya
        },
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b",
            set: (v) =>
                v === ""
                    ? "https://images.unsplash.com/photo-1774594604892-5d30af6fc2ca?w=600&auto=format&fit=crop&q=60"
                    : v,
        }
    },

    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;