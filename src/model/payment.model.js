// src/model/payment.model.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    serviceOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceOrder",
      required: true,
    },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["cash", "transfer"], default: "cash" },
    proofImage: String, // URL/file path to proof (jika transfer)
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
