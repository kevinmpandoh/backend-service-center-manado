// src/route/payment.route.js
import { Router } from "express";
import multer from "multer";
import paymentController from "../controller/payment.controller.js";

const router = Router();

// Setup penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/payments"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.get("/", paymentController.findAll);
router.get("/:id", paymentController.findById);
router.get("/:id/receipt", paymentController.getReceipt);
router.post("/", upload.single("proofImage"), paymentController.create);
router.put("/:id", upload.single("proofImage"), paymentController.update);
router.delete("/:id", paymentController.remove);

export default router;
