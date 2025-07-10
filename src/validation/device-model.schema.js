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
  brand: Joi.string().custom(objectId).required().messages({
    "any.invalid": "ID brand tidak valid",
    "string.empty": "Brand wajib dipilih",
  }),
});

export const updateDeviceModelSchema = Joi.object({
  name: Joi.string().optional().messages({
    "string.empty": "Nama model tidak boleh kosong",
  }),
  brand: Joi.string().custom(objectId).optional().messages({
    "any.invalid": "ID brand tidak valid",
  }),
});
