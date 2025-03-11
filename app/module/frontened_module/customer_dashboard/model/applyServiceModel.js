const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'category', 
        required: true 
    },
    category_model_number: {
        type: String,
        required: true
    },
    product_issue: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['assign', 'pending', 'complete'],
        default: 'pending'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false 
    },
    assignedDate: { 
        type: Date, 
        default:null 
    }, 
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer',
        required: true,
    },
},
    {
        timestamps: true,
        versionKey: false,
    }
);


module.exports = mongoose.model('service', serviceSchema)