// src/validation/device-model.schema.js
import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const createDeviceModelSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Nama model perangkat wajib diisi",
  }),
  brandId: Joi.string().custom(objectId).optional().messages({
    "any.invalid": "ID brand tidak valid",
    "string.empty": "Brand wajib dipilih",
  }),
  brandName: Joi.string().optional(), // kalau isi manual
  type: Joi.string().valid("HP", "Laptop", "Tablet", "Jam").required(),
});

export const updateDeviceModelSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    "string.empty": "Nama model tidak boleh kosong",
  }),
  brandId: Joi.string().custom(objectId).optional().messages({
    "any.invalid": "ID brand tidak valid",
  }),
  brandName: Joi.string().optional(),
  type: Joi.string().valid("HP", "Laptop", "Tablet", "Jam").optional(),
});
