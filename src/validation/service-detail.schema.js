// src/validation/service-detail.schema.js
import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const createServiceDetailSchema = Joi.object({
  type: Joi.string().valid("jasa", "sparepart").required(),
  // Kalau jasa: bisa pilih serviceItem dari DB atau isi manual
  serviceItem: Joi.string().when("type", {
    is: "jasa",
    then: Joi.allow("").optional(),
    otherwise: Joi.forbidden(),
  }),

  customServiceName: Joi.string().when("type", {
    is: "jasa",
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),

  customPrice: Joi.number().when("type", {
    is: "jasa",
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),

  sparepart: Joi.string().when("type", {
    is: "sparepart",
    then: Joi.string().custom(objectId).required().messages({
      "any.invalid": "ID sparepart tidak valid",
    }),
    otherwise: Joi.forbidden(),
  }),
  quantity: Joi.number()
    .min(1)
    .when("type", { is: "sparepart", then: Joi.required() }),
});

export const updateServiceDetailSchema = Joi.object({
  // type tidak bisa diubah
  quantity: Joi.number().min(1),

  // Update jasa
  serviceItem: Joi.string(),
  customServiceName: Joi.string(),
  customPrice: Joi.number(),

  // Update sparepart
  sparepart: Joi.string(),
});
