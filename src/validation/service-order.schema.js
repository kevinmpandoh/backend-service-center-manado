// src/validation/service-order.schema.js
import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const createServiceOrderSchema = Joi.object({
  device: Joi.string().custom(objectId).required(),
  technician: Joi.string().custom(objectId).optional().allow(null),
  status: Joi.string().valid(
    "diterima",
    "diperbaiki",
    "selesai",
    "diambil",
    "batal"
  ),
  receivedAt: Joi.date().optional(),
  startedAt: Joi.date().optional(),
  completedAt: Joi.date().optional(),
  pickedUpAt: Joi.date().optional(),
  estimatedDoneAt: Joi.date().optional(),
  warrantyDuration: Joi.number().min(0).optional(),
  serviceNotes: Joi.string().allow(""),
  totalCost: Joi.number().min(0).optional(),
});

export const updateServiceOrderSchema = createServiceOrderSchema;
