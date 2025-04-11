import mongoose from "mongoose";

const sparePartSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const SparePart = mongoose.model("SparePart", sparePartSchema);
export default SparePart;
