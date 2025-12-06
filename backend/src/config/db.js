import mongoose from "mongoose";
import { config } from "./config.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.dbUrl);
    console.log(`MongoDB connected successfuly`);
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};
