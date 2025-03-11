const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
   
    service: {
        type: String, // E.g., name of the service
        required: true,
    },
    image: {
        type: String, // E.g., name of the service
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    review: {
        type: String,
        required: true,
    },
    approved: {
        type: Boolean,
        default: false, // Review will be initially disapproved
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Review", ReviewSchema);
