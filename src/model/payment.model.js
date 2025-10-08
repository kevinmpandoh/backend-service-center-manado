// src/model/payment.model.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    serviceOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceOrder",
      required: true,
    },
    // amount: { type: Number, required: true },
    method: { type: String, enum: ["cash", "transfer"], required: true },
    amount: { type: Number, required: true },
    paymentProof: { type: String }, // simpan URL Cloudinary kalau transfer
    isDownPayment: { type: Boolean, default: false },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
