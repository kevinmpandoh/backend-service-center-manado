// src/route/brand.route.js
import { Router } from "express";
import * as brandController from "../controller/brand.controller.js";

const router = Router();

router.post("/", brandController.create);
router.get("/", brandController.getAll);
router.get("/:id", brandController.getById);
router.put("/:id", brandController.update);
router.delete("/:id", brandController.remove);

export default router;
