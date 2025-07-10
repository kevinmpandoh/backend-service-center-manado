// src/model/damage-type.model.js
import mongoose from "mongoose";

const damageTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  applicableTo: { type: [String], default: [] }, // e.g. ["HP", "Laptop"]
});

export default mongoose.model("DamageType", damageTypeSchema);
