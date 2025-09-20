import Joi from "joi";

export const createDevicechema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  brandId: Joi.string().optional(), // kalau pilih brand dari DB
  brandName: Joi.string().optional(), // kalau isi manual
  type: Joi.string().valid("HP", "Laptop", "Tablet", "Jam").required(),
});

export const updateDeviceSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  brandId: Joi.string().optional(),
  brandName: Joi.string().optional(),
  type: Joi.string().valid("HP", "Laptop", "Tablet", "Jam").optional(),
});
