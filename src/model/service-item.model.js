// src/modules/services/serviceItem.model.js
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ServiceItem", schema);
