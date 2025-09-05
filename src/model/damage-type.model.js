// src/model/damage-type.model.js
import mongoose from "mongoose";

const damageTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  applicableTo: { type: [String], default: [] }, // e.g. ["HP", "Laptop"],
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  // Harga perbaikan untuk jenis kerusakan ini
});

export default mongoose.model("DamageType", damageTypeSchema);
