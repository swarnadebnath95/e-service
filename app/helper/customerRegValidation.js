const Joi = require('joi');

// Define the Joi validation schema
const customerRegValidationSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  password: Joi.string()
  .min(8) // Password should be at least 8 characters long
  .max(20) // Optional max length, can be adjusted
  .required() // Password is required
  .pattern(/^(?=.*[a-z])(?=.*\d)[a-zA-Z\d]{8,20}$/) // At least one letter, one number, and 8-20 characters
  .messages({
    'string.pattern.base': 'Password must be 8-20 characters long, contain at least one letter and one number, and consist of only letters and digits.', // Custom message for invalid password pattern
  }),
  address: Joi.string().min(3).max(30).required(),
});

module.exports = customerRegValidationSchema;