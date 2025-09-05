// src/model/service-detail.model.js
import mongoose from "mongoose";

const serviceDetailSchema = new mongoose.Schema(
  {
    serviceOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceOrder",
      required: true,
    },
    type: {
      type: String,
      enum: ["jasa", "sparepart"],
      required: true,
    },

    serviceItem: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceItem" }, // wajib kalau type=SERVICE
    customServiceName: String,
    customPrice: Number,

    sparepart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sparepart",
      required: function () {
        return this.type === "sparepart";
      },
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    price: {
      type: Number,

      min: 0,
    },
    subtotal: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ServiceDetail", serviceDetailSchema);
