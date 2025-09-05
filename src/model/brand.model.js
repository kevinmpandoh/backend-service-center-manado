// src/model/brand.model.js
import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["HP", "Laptop", "Tablet", "Jam"],
    required: true,
  },
});

brandSchema.index({ name: 1, type: 1 }, { unique: true });

export default mongoose.model("Brand", brandSchema);
