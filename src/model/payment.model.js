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
    method: { type: String, enum: ["CASH", "TRANSFER"], default: "CASH" },
    type: {
      type: String,
      enum: ["DP", "FULL"],
      default: "FULL",
    },
    proofImage: String, // URL/file path to proof (jika transfer)
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PAID",
    },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
