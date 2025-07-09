// src/model/device-model.model.js
import mongoose from "mongoose";

const deviceModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
});

export default mongoose.model("DeviceModel", deviceModelSchema);
