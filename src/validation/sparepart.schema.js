// src/validation/sparepart.schema.js
import Joi from "joi";

export const createSparepartSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Nama sparepart wajib diisi",
  }),
  brand: Joi.string().allow(""),
  stock: Joi.number().min(0).default(0),
  buyPrice: Joi.number().min(0).required().messages({
    "number.base": "Harga beli wajib berupa angka",
  }),
  sellPrice: Joi.number().min(0).required().messages({
    "number.base": "Harga jual wajib berupa angka",
  }),
});

export const updateSparepartSchema = Joi.object({
  name: Joi.string(),
  brand: Joi.string().allow(""),
  stock: Joi.number().min(0),
  buyPrice: Joi.number().min(0),
  sellPrice: Joi.number().min(0),
});
