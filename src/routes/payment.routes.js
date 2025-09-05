// src/route/payment.route.js
import { Router } from "express";
import paymentController from "../controller/payment.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/", paymentController.findAll);
router.post("/upload", upload.single("proofImage"), paymentController.upload);
router.get("/:id", paymentController.findById);
router.get("/:orderId", paymentController.findById);
router.get("/:id/receipt", paymentController.getReceipt);
router.post(
  "/:orderId/dp",
  upload.single("proofImage"),
  paymentController.addPaymentDP
);
router.post(
  "/:orderId/final",
  upload.single("proofImage"),
  paymentController.addPaymentFinal
);
router.put("/:id", upload.single("proofImage"), paymentController.update);
router.delete("/:id", paymentController.remove);

export default router;
