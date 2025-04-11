import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Member = mongoose.model("Member", memberSchema);
export default Member;
