import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    photoURL: {
      type: String,
      default: "https://api.dicebear.com/7.x/adventurer/svg",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 200,
    },
    gender: {
      type: String,
      default: "",
    },
    occupation: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "researcher"],
      default: "researcher", // changed default role
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    researchInterests: {
      type: [String],
      default: [],
    },
    links: {
      personalWebsite: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      googleScholar: { type: String, default: "" },
      github: { type: String, default: "" },
      other: [{ name: String, url: String }],
    },
  },
  { 
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
