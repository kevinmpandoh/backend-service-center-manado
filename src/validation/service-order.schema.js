// src/validation/service-order.schema.js
import e from "express";
import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const allowedTypes = ["HP", "Laptop", "Tablet", "Lainnya"];

export const createServiceOrderSchema = Joi.object({
  customer: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
  }).required(),
  device: Joi.object({
    type: Joi.string()
      .valid(...allowedTypes)
      .required(),
    brand: Joi.string().custom(objectId).required(),
    model: Joi.string().custom(objectId).required(),
    customDamageNote: Joi.string().allow(""),
    completeness: Joi.string().default("Lengkap"),
  }).required(),

  damageIds: Joi.array().items(Joi.string().custom(objectId)).required(),
  damageLevel: Joi.string()
    .valid("Ringan", "Sedang", "Berat")
    .default("Ringan")
    .required(),
  estimatedCost: Joi.number().min(0).required(),
  estimatedTime: Joi.string().required(),
  notes: Joi.string().allow(""),
  serviceNotes: Joi.string().allow(""),

  payment: Joi.object({
    type: Joi.string().valid("DP", "FULL").required(),
    method: Joi.string().valid("CASH", "TRANSFER").required(),
    amount: Joi.number().required(),
  }).optional(),
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

export const addDetailSchema = Joi.object({
  description: Joi.string().required(),
  sparepart: Joi.string().allow(""),
  qty: Joi.number().integer().min(1).default(1),
  price: Joi.number().min(0).required(),
});

export const updateServiceOrderSchema = createServiceOrderSchema;

export const updateWarrantySchema = Joi.object({
  warrantyPeriod: Joi.string().required(),
  warrantyNote: Joi.string().allow(""),
});
