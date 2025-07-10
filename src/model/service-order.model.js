// src/model/service-order.model.js
import mongoose from "mongoose";

const serviceOrderSchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
    status: {
      type: String,
      enum: ["diterima", "diperbaiki", "selesai", "diambil", "batal"],
      default: "diterima",
    },
    receivedAt: Date,
    startedAt: Date,
    completedAt: Date,
    pickedUpAt: Date,
    estimatedDoneAt: Date, // estimasi selesai
    warrantyDuration: Number, // dalam hari
    warrantyExpiredAt: Date,
    serviceNotes: String,
    totalCost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("ServiceOrder", serviceOrderSchema);
