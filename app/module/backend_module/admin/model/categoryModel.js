const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
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

// Ensure a case-insensitive unique index
CategorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

module.exports = mongoose.model('category', CategorySchema)