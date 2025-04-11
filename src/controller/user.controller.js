import User from "../model/user.model.js";

export const UserController = {
  async getAllUser(req, res, next) {
    try {
      const data = await User.find();
      res.status(200).json({
        status: "success",
        message: "Berhasil mendapatkan data user",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
