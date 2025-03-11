const Joi = require('joi');

// Define the Joi validation schema
const adminProfileValidationSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  image: Joi.string().optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
});

module.exports = adminProfileValidationSchema;