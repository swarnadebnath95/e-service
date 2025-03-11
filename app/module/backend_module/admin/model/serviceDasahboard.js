const mongoose = require('mongoose');

const ServiceDashboardSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
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


module.exports = mongoose.model('serviceDashboard', ServiceDashboardSchema)