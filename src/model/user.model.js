import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "owner", "tenant"],
      default: "teknisi",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
