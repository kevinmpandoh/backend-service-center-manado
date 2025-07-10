import Joi from "joi";

const deviceTypes = ["HP", "Laptop", "Tablet", "Lainnya"];

export const createDamageTypeSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Nama kerusakan wajib diisi",
  }),
  description: Joi.string().allow("").optional(),
  applicableTo: Joi.array()
    .items(Joi.string().valid(...deviceTypes))
    .optional()
    .messages({
      "any.only": "Tipe perangkat tidak valid",
    }),
});

export const updateDamageTypeSchema = Joi.object({
  name: Joi.string().optional().messages({
    "string.empty": "Nama kerusakan tidak boleh kosong",
  }),
  description: Joi.string().allow("").optional(),
  applicableTo: Joi.array()
    .items(Joi.string().valid(...deviceTypes))
    .optional(),
});
