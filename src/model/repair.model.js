import mongoose from "mongoose";

const repairSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    sparePartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SparePart",
      required: true,
    },
    repairDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Repair = mongoose.model("Repair", repairSchema);
export default Repair;
