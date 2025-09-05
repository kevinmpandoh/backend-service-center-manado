import express from "express";
import dashboardController from "../controller/dashboard.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/teknisi", authorize(["teknisi"]), dashboardController.technician);
router.get("/sparepart", dashboardController.sparepart);
router.get("/admin", dashboardController.admin);

export default router;
