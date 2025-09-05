// src/validation/customer.schema.js
import Joi from "joi";

export const createCustomerSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Nama pelanggan wajib diisi",
  }),
  phone: Joi.string().required().messages({
    "string.empty": "Nomor HP wajib diisi",
  }),
});

export const updateCustomerSchema = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.string().optional(),
});
