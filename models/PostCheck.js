import mongoose from "mongoose";

const PostCheckSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      unique: true,
    },
    tags: {
      type: Array,
      default: [],
      unique: false,
    },
    isVerifyEdit: {
      type: Boolean,
      default: false,
      unique: false,
    },
    comment: {
      type: String,
      default: "",
      unique: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PostCheck", PostCheckSchema);
