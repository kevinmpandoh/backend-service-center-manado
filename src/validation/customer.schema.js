// src/validation/customer.schema.js
import Joi from "joi";

export const createCustomerSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Nama pelanggan wajib diisi",
  }),
  phone: Joi.string().required().messages({
    "string.empty": "Nomor HP wajib diisi",
  }),
  email: Joi.string().email().allow("").messages({
    "string.email": "Format email tidak valid",
  }),
  address: Joi.string().allow(""),
});

export const updateCustomerSchema = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.string().optional(),
  email: Joi.string().email().allow(""),
  address: Joi.string().allow(""),
});
