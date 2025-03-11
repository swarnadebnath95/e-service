const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false, // Mark notifications as unread by default
    },
    date: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model('Notification', notificationSchema);
