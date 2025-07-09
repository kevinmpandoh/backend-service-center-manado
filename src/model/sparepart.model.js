// src/model/sparepart.model.js
import mongoose from "mongoose";

const sparepartSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: String,
    stock: { type: Number, default: 0 },
    buyPrice: Number,
    sellPrice: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Sparepart", sparepartSchema);
