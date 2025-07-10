// src/validation/brand.validation.js
import Joi from "joi";

export const createBrandSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Nama brand wajib diisi",
  }),
  type: Joi.string()
    .valid("HP", "Laptop", "Tablet", "Lainnya")
    .required()
    .messages({
      "any.only":
        "Tipe harus salah satu dari: HP, Laptop, Tablet, atau Lainnya",
      "string.empty": "Tipe brand wajib diisi",
    }),
});

export const updateBrandSchema = Joi.object({
  name: Joi.string().optional().messages({
    "string.empty": "Nama brand tidak boleh kosong",
  }),
  type: Joi.string()
    .valid("HP", "Laptop", "Tablet", "Lainnya")
    .optional()
    .messages({
      "any.only":
        "Tipe harus salah satu dari: HP, Laptop, Tablet, atau Lainnya",
    }),
});
