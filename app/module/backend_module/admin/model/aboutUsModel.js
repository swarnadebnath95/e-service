const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String, // Path to the uploaded image
      required: true,
    },
    status:{
        type:Number,
        default:1
    },
  },
  {
    timestamps: true,
    versionKey: false,
});


module.exports = mongoose.model('about', AboutSchema)