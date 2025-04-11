import User from "../model/user.model.js";
import { generateToken } from "../utils/jwt.js";
import { ResponseError } from "../utils/response.error.js";
import { authValidation } from "../validation/auth.validation.js";
import bcrypt from "bcryptjs";

export const AuthController = {
  async login(req, res, next) {
    try {
      const { username, password } = validate(authValidation.login, req.body);

      const user = await User.findOne({ username });

      if (!user) throw new ResponseError(401, "Email / Password salah");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new ResponseError(401, "Email/ Password salah");

      const token = generateToken({
        id: user._id,
        username: user.username,
        role: user.role,
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // hanya secure di production
        sameSite: "none", // cross domain
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
      });

      res.json({
        status: "Success",
        message: "Login berhasil",
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  },
};
