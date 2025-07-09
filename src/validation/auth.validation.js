import Joi from "joi";

const login = Joi.object({
  username: Joi.string().required().messages({
    "string.empty": "Nama pengguna wajib diisi",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Kata sandi wajib diisi",
    "string.min": "Kata sandi minimal 6 karakter",
  }),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "string.empty": "Password lama wajib diisi",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.empty": "Password baru wajib diisi",
    "string.min": "Password baru minimal 6 karakter",
  }),
});

export default {
  login,
  changePasswordSchema,
};
