import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { userRouter } from "./user.routes.js";
import brandRouter from "./brand.routes.js";
import deviceModelRouter from "./device-model.routes.js";
import damageTypeRouter from "./damage-type.routes.js";
import customerRouter from "./customer.routes.js";
import deviceRouter from "./device.routes.js";
import serviceOrderRouter from "./service-order.routes.js";

const router = Router();

router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/brands", brandRouter);
router.use("/device-models", deviceModelRouter);
router.use("/damage-types", damageTypeRouter);
router.use("/customers", customerRouter);
router.use("/devices", deviceRouter);
router.use("/service-orders", serviceOrderRouter);

export default router;
