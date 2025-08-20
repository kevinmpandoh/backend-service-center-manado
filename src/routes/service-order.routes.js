// src/route/service-order.route.js
import { Router } from "express";
import * as controller from "../controller/service-order.controller.js";
import * as detailServiceController from "../controller/service-detail.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import paymentController from "../controller/payment.controller.js";

const router = Router();
router.use(authenticate);

router.post("/", authorize(["teknisi"]), controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

router.patch("/:id/start", authorize(["teknisi"]), controller.startWork);
router.post(
  "/:id/details",
  authorize(["teknisi"]),
  detailServiceController.create
);

// PUT /api/service-orders/:id/warranty
router.put("/:id/warranty", authorize(["teknisi"]), controller.updateWarranty);
router.post(
  "/:id/complete",
  authorize(["teknisi"]),
  controller.markAsCompleted
);
router.post(
  "/:orderId/payments",
  authorize(["teknisi"]),
  upload.single("photo"),
  paymentController.create
);
router.patch("/:id/pickup", authorize(["teknisi"]), controller.markAsPickedUp);

export default router;
