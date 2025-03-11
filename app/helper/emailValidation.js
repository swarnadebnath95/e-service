const Joi = require('joi');

// Define the Joi validation schema
const emailValidationSchema = Joi.object({

  email: Joi.string().email().required(),
});

module.exports = emailValidationSchema;