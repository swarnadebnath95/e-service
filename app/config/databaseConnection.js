const mongoose = require('mongoose')

const databaseConnection = async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log(`database connected successfully`);
    } catch (error) {
        console.log(error);
    }
}

module.exports = databaseConnection