// src/model/service-detail.model.js
import mongoose from "mongoose";

const serviceDetailSchema = new mongoose.Schema(
  {
    serviceOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceOrder",
      required: true,
    },
    type: { type: String, enum: ["jasa", "sparepart"], required: true },
    item: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ServiceDetail", serviceDetailSchema);
