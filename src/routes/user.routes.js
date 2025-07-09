import express from "express";
import usernameserController from "../controller/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import userController from "../controller/user.controller.js";

const userRouter = express.Router();

userRouter.use(authenticate, authorize(["admin"]));

userRouter.get("/", userController.getAll);
userRouter.post("/", userController.create);
userRouter.put("/:id", userController.update);
userRouter.delete("/:id", userController.deleteUser);

export { userRouter };
