const Joi = require('joi');

// Define the Joi validation schema
const userProfileValidationSchema = Joi.object({
    address: Joi.string().min(3).max(30).required(),
    image: Joi.string().optional(),
});

module.exports = userProfileValidationSchema;