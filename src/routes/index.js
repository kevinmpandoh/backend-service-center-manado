import express from "express";
import { authRouter } from "./auth.routes.js";
import { userRouter } from "./user.routes.js";
import brandRouter from "./brand.routes.js";

const router = express.Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/brands", brandRouter);

export default router;
