const Joi = require('joi');

// Define the Joi validation schema
const createEmployeeValidationSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  category: Joi.string().required(),
});

module.exports = createEmployeeValidationSchema;