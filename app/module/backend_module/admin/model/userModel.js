const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
  
    isVerified: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      default: "", // Optional, users may not have an address initially
    },
    image: {
      type: String, // Store the image file name or path
      default: "", // Default to empty string if no image is uploaded
    },
    deletestatus: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("user", userSchema);
