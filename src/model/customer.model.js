import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nama pelanggan wajib diisi"],
    },
    phone: {
      type: String,
      required: [true, "Nomor HP wajib diisi"],
    },
    email: String,
    address: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
