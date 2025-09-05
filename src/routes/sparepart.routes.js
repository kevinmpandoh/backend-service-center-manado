// src/route/sparepart.route.js
import { Router } from "express";
import * as controller from "../controller/sparepart.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate);

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/used", controller.getSparepartsUsage);
router.get("/used/export", controller.exportUsedSparepartsController);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
