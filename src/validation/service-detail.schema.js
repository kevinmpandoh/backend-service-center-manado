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
  serviceOrder: Joi.string().custom(objectId).required(),
  type: Joi.string().valid("jasa", "sparepart").required(),
  serviceName: Joi.string().when("type", {
    is: "jasa",
    then: Joi.string().required().messages({
      "string.empty": "Nama layanan wajib diisi",
    }),
    otherwise: Joi.forbidden(),
  }),
  sparepart: Joi.string().when("type", {
    is: "sparepart",
    then: Joi.string().custom(objectId).required().messages({
      "any.invalid": "ID sparepart tidak valid",
    }),
    otherwise: Joi.forbidden(),
  }),
  quantity: Joi.number().min(1).default(1),
  price: Joi.number().min(0).required().messages({
    "number.base": "Harga wajib berupa angka",
  }),
});

export const updateServiceDetailSchema = Joi.object({
  type: Joi.string().valid("jasa", "sparepart"),
  item: Joi.string(),
  quantity: Joi.number().min(1),
  price: Joi.number().min(0),
});
