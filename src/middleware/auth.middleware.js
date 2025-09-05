// middleware/authMiddleware.ts
import { verifyToken } from "../utils/jwt.js";
import { ResponseError } from "../utils/error.js";
import User from "../model/user.model.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) throw new ResponseError(401, "Unauthorized");
    const decoded = verifyToken(token);

    if (!decoded) {
      throw new ResponseError(401, "Token tidak valid.");
    }
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ResponseError(404, "Pengguna tidak ditemukan.");
    }

    // Simpan user ke request agar bisa diakses oleh controller selanjutnya
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (roles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      throw new ResponseError(403, "Pengguna tidak ditemukan.");
    }

    if (!roles.includes(user.role)) {
      throw new ResponseError(403, "Akses ditolak.");
    }

    next();
  };
};
