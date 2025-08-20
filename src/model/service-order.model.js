// src/model/service-order.model.js
import mongoose from "mongoose";

const serviceOrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
    status: {
      type: String,
      enum: [
        "diterima",
        "diperbaiki",
        "menunggu_pembayaran",
        "siap_diambil",
        "diambil",
        "batal",
      ],
      default: "diterima",
    },

    // Tingkat kerusakan
    damageLevel: {
      type: String,
      enum: ["Ringan", "Sedang", "Berat"],
      default: "Ringan",
    },
    damageIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "DamageType" }],
    customDamageNote: {
      type: String,
      default: "", // Catatan kerusakan khusus dari pelanggan
    },
    notes: {
      type: String,
      default: "", // Keluhan pelanggan
    },

    estimatedCost: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedTime: {
      type: String, // dalam menit
      required: true,
    },

    receivedAt: Date,
    startedAt: Date,
    completedAt: Date,
    pickedUpAt: Date,
    warranty: {
      duration: Number, // misalnya 3
      unit: {
        type: String,
        enum: ["hari", "bulan", "tahun"],
        default: "bulan",
      },
    },

    serviceNotes: String,
    totalCost: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    isFullPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("ServiceOrder", serviceOrderSchema);
