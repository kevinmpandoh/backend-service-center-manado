import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    type: {
      type: String,
      enum: ["HP", "Laptop", "Tablet", "Lainnya"],
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
    serialNumber: {
      type: String,
      default: "",
    },
    damageIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "DamageType" }],
    customDamageNote: String,
    notes: {
      type: String,
      default: "", // Keluhan pelanggan
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Device = mongoose.model("Device", deviceSchema);
export default Device;
