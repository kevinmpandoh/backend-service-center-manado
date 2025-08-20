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
    // serviceName: {
    //   type: String,
    //   required: function () {
    //     return this.type === "jasa";
    //   },
    // },
    serviceItem: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceItem" }, // wajib kalau type=SERVICE
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
      required: true,
      min: 0,
    },
    subtotal: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ServiceDetail", serviceDetailSchema);
