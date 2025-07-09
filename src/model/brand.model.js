// src/model/brand.model.js
import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ["HP", "Laptop", "Tablet", "Lainnya"],
    required: true,
  },
});

export default mongoose.model("Brand", brandSchema);
