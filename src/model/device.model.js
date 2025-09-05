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

    // Kelengkapan hp misalnya charger, dus, dll
    completeness: {
      type: String,
      default: "Lengkap",
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
