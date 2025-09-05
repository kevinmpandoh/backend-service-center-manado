// src/validation/sparepart.schema.js
import Joi from "joi";

export const createServiceItemSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Nama sparepart wajib diisi",
  }),
  price: Joi.number().min(0).required().messages({
    "number.base": "Harga wajib berupa angka",
  }),
});

export const updateServiceItemSchema = Joi.object({
  name: Joi.string(),
  price: Joi.number().min(0),
});
