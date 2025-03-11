const Joi = require('joi');

// Define the Joi validation schema
const adminProfileValidationSchema = Joi.object({
     name: Joi.string().max(30).required() .max(30)
     .required()
     .pattern(/^\S+$/) // No spaces allowed
     .messages({
         'string.empty': 'Name is required.',
         'string.pattern.base': 'Name must not contain spaces.',
     }),
   
    description: Joi.string().required().messages({
        'string.empty': 'Description is required.',
    }),
    image: Joi.string().optional(),
    status: Joi.number().default(1),
});

module.exports = adminProfileValidationSchema;