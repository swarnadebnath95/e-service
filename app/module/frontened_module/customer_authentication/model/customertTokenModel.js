const mongoose = require('mongoose');

const customertokenSchema = new mongoose.Schema({
    _customerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Customer",
    },
    token: {
        type: String,
        required: true,
    },
    expiredAt: {
        type: Date,
        default: () => Date.now() + 60 * 1000,
        index: { expires: "20m" },
    },
});

const CustomerTokenModel = mongoose.model('customertoken', customertokenSchema);
module.exports = CustomerTokenModel;