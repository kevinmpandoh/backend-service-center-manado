// middleware/authMiddleware.ts
import { verifyToken } from "../utils/jwt.js";
import { ResponseError } from "../utils/response.error.js";
import User from "../model/user.model.js";

export const authenticate = async () => {
  try {
    const token = req.cookies.token;

    if (!token) throw new ResponseError(401, "Unauthorized");

    const decoded = verifyToken(token);

    if (!decoded) {
      throw new ResponseError(404, "Unauthorized - Invalid Token");
    }

    let user = await User.findById(decoded.id);

    req.body.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.body.user) {
      throw new ResponseError(403, "No User Found");
    }
    if (!roles.includes(req.body.user.role)) {
      throw new ResponseError(403, "Access denied");
    }

    next();
  };
};
