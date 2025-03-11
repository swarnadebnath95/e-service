const Joi = require('joi');

// Define the Joi validation schema
const customerProfileValidationSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  address:  Joi.string().min(3).max(30).required(),
});

module.exports = customerProfileValidationSchema;