const Joi = require('joi');

// Define Joi validation schema

const createticketvalidateService = Joi.object({

    name: Joi.string()
        .min(3)
        .max(50)
        .trim()
        .required()
        .messages({
            "string.base": "Name must be a string",
            "string.empty": "Name is required",
            "string.min": "Name must be at least 3 characters long",
            "string.max": "Name must not exceed 50 characters",
            "any.required": "Name is required",
        }),

    email: Joi.string()
        .email()
        .lowercase()
        .required()
        .messages({
            "string.email": "Please provide a valid email address",
            "any.required": "Email is required",
        }),

    phone: Joi.string()
        .pattern(/^[6-9]\d{9}$/) // Ensure the phone starts with 6-9 and is followed by 9 digits
        .required()               // Ensure the phone is provided
        .messages({
            "string.pattern.base": "Please provide a valid 10-digit phone number starting with 6-9",
            "any.required": "Phone number is required",
        }),

    category: Joi.string().required(),

    category_model_number: Joi.string()
        .min(3)
        .max(20)
        .required()
        .messages({
            "string.min": "Category model number must be at least 3 characters",
            "string.max": "Category model number must not exceed 20 characters",
            "any.required": "Category model number is required",
        }),

    product_issue: Joi.string()
        .min(5)
        .max(500)
        .required()
        .messages({
            "string.min": "Product issue must be at least 5 characters long",
            "string.max": "Product issue must not exceed 500 characters",
            "any.required": "Product issue is required",
        }),
        
    address: Joi.string()
        .min(3)
        .max(200)
        .required()
        .messages({
            "string.min": "Address must be at least  characters",
            "string.max": "Address must not exceed 200 characters",
            "any.required": "Address is required",
        }),

    date: Joi.date().required()

});



module.exports = createticketvalidateService 
