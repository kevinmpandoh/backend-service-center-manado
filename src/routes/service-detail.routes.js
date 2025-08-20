// src/route/service-detail.route.js
import { Router } from "express";
import * as controller from "../controller/service-detail.controller.js";

const router = Router();

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/:serviceOrderId", controller.getByServiceOrderId);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
