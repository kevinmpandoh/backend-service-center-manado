import authService from "../service/auth.service.js";
import userService from "../service/user.service.js";

const login = async (req, res, next) => {
  try {
    const token = await authService.login(req.body);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // hanya secure di production
      sameSite: "none", // cross domain
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });
    res.json({
      status: "success",
      message: "Login berhasil",
      token,
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });
    res.status(200).json({ status: "success", message: "Logout berhasil" });
  } catch (error) {
    next(error);
  }
};

const get = async (req, res, next) => {
  try {
    const username = req.user.username;
    const result = await userService.get(username);

    res.status(200).json({
      message: "Success",
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const id = req.user._id; // 🔑 ambil user dari middleware
    const updatedUser = await userService.update(id, req.body);

    res.json({
      status: "Success",
      message: "Profil berhasil diperbarui",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const id = req.user._id;
    await authService.changePassword(id, req.body);

    res.json({
      status: "Success",
      message: "Password berhasil diperbarui",
    });
  } catch (err) {
    next(err);
  }
};

export default {
  login,
  logout,
  get,
  update,
  changePassword,
};
