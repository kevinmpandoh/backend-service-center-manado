// src/validation/device.schema.js
import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const allowedTypes = ["HP", "Laptop", "Tablet", "Lainnya"];

export const createDeviceSchema = Joi.object({
  customer: Joi.string().custom(objectId).required(),
  type: Joi.string()
    .valid(...allowedTypes)
    .required(),
  brand: Joi.string().custom(objectId).required(),
  model: Joi.string().custom(objectId).required(),
  serialNumber: Joi.string().allow(""),
  damageIds: Joi.array().items(Joi.string().custom(objectId)),
  customDamageNote: Joi.string().allow(""),
  notes: Joi.string().allow(""),
});

export const updateDeviceSchema = Joi.object({
  type: Joi.string().valid(...allowedTypes),
  brand: Joi.string().custom(objectId),
  model: Joi.string().custom(objectId),
  serialNumber: Joi.string().allow(""),
  damageIds: Joi.array().items(Joi.string().custom(objectId)),
  customDamageNote: Joi.string().allow(""),
  notes: Joi.string().allow(""),
});
