// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     uid:{
//       type: String,
//       required: true,
//       unique: true,
//     },
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },
//     profileImage: {
//       type: String,
//       default: "",
//     },
//     bio: {
//       type: String,
//       default: "",
//       maxlength: 200,
//     },
//     gender: {
//       type: String,
//       default: "",
//     },
//     age: {
//       type: Number,
//       default: null,
//     },
//     lifestylePreferences: {
//       type: String,
//       default:""
//     },
//     role: {
//       type: String,
//       enum: ["user", "admin"],
//       default: "user",
//     },
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);

// export default User;

// Demo purpose only, not in use
