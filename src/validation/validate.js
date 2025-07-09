import { ResponseError } from "../utils/error.js";

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = {};

    error.details.forEach((detail) => {
      const key = detail.path.join("."); // Mendapatkan nama field
      errors[key] = detail.message.replace(/['"]/g, ""); // Menghapus tanda kutip di error message
    });

    throw new ResponseError(400, "Validasi gagal", errors);
  }
  return value;
};

export { validate };
