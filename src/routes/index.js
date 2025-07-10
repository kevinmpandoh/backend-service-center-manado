import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { userRouter } from "./user.routes.js";
import brandRouter from "./brand.routes.js";
import deviceModelRouter from "./device-model.routes.js";
import damageTypeRouter from "./damage-type.routes.js";

const router = Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/brands", brandRouter);
router.use("/device-models", deviceModelRouter);
router.use("/damage-types", damageTypeRouter);

export default router;
