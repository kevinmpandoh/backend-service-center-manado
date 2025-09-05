// src/model/service-order.model.js
import mongoose from "mongoose";

const serviceOrderSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true },
      phone: { type: String },
    },
    device: {
      category: {
        type: String,
        enum: ["HP", "Laptop", "Tablet", "Lain-lain"],
        required: true,
      },
      brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        required: true,
      },
      model: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeviceModel",
        required: true,
      },
      accessories: { type: String },
    },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
    status: {
      type: String,
      enum: [
        "diterima",
        "diperbaiki",
        "menunggu pembayaran",
        "siap diambil",
        "selesai",
        "batal",
      ],
      default: "diterima",
    },

    // Tingkat kerusakan

    damageIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "DamageType" }],
    damage: { type: mongoose.Schema.Types.ObjectId, ref: "DamageType" },

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
      endDate: Date, // tanggal akhir garansi
    },
    totalCost: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    isFullPaid: { type: Boolean, default: false },
    serviceDetails: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ServiceDetail" },
    ],
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
  },
  { timestamps: true }
);

export default mongoose.model("ServiceOrder", serviceOrderSchema);
