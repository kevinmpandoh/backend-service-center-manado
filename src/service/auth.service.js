import User from "../model/user.model.js";
import { generateToken } from "../utils/jwt.js";
import { ResponseError } from "../utils/error.js";
import authValidation from "../validation/auth.validation.js";
import userRepository from "../repository/user.repository.js";
import { validate } from "../validation/validate.js";
import bcrypt from "bcryptjs";

const login = async (data) => {
  const { username, password } = validate(authValidation.login, data);

  const user = await User.findOne({ username });

  if (!user)
    throw new ResponseError(401, "Email / Password salah", {
      email_password: "Email / Password salah",
    });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    throw new ResponseError(401, "Email/ Password salah", {
      email_password: "Email / Password salah",
    });

  const token = generateToken({
    id: user._id,
    username: user.username,
    role: user.role,
  });

  return {
    token,
    user: {
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
      role: user.role,
    },
  };
};

const changePassword = async (id, data) => {
  const { oldPassword, newPassword } = validate(
    authValidation.changePasswordSchema,
    data
  );
  const user = await userRepository.findById(id);
  if (!user) throw new ResponseError(404, "Pengguna tidak ditemukan");

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match)
    throw new ResponseError(400, "Validasi Gagal", {
      oldPassword: "Password lama salah",
    });

  const hashed = await bcrypt.hash(newPassword, 10);
  await userRepository.updateById(id, { password: hashed });

  return { message: "Password berhasil diubah" };
};

export default {
  login,
  changePassword,
};
