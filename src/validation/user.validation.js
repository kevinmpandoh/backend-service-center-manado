import Joi from "joi";

const createUserSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Nama wajib diisi",
  }),
  username: Joi.string().min(3).required().messages({
    "string.empty": "Username wajib diisi",
    "string.min": "Username minimal 3 karakter",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password wajib diisi",
    "string.min": "Password minimal 6 karakter",
  }),
  role: Joi.string().valid("admin", "teknisi", "sparepart").required(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  username: Joi.string().min(3).optional(),
  role: Joi.string().valid("admin", "teknisi", "sparepart").optional(),
});

export default {
  createUserSchema,
  updateUserSchema,
};
