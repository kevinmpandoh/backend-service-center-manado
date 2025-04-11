import Joi from "joi";

export const authValidation = {
  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
    }),
  }),
};
