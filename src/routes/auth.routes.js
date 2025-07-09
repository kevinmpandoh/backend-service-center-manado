import { Router } from "express";
import authController from "../controller/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/user-current", authenticate, authController.get);
authRouter.patch("/user-current", authenticate, authController.update);
authRouter.patch(
  "/change-password",
  authenticate,
  authController.changePassword
);

export { authRouter };
