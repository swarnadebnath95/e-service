const Joi = require('joi');

// Define the Joi validation schema
const createEmployeeUpdateValidationSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
});

module.exports = createEmployeeUpdateValidationSchema;