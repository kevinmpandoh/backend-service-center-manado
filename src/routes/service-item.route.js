// src/route/sparepart.route.js
import { Router } from "express";
import * as controller from "../controller/service-item.controller.js";

const router = Router();

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
