// import mongoose from "mongoose";
// import { config } from "./config.js";

// export const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(config.dbUrl);
//     console.log(`MongoDB connected successfuly`);
//   } catch (error) {
//     console.log("MongoDB connection error:", error);
//   }
// };


import mongoose from "mongoose";
import { config } from "./config.js";

export const connectDB = async () => {
  try {
    const dbUrl =
      config.dbEnv === "local"
        ? config.localDbUrl
        : config.cloudDbUrl;

    if (!dbUrl) {
      throw new Error("Database URL is missing");
    }

    await mongoose.connect(dbUrl);

    console.log(
      `MongoDB connected successfully (${config.dbEnv.toUpperCase()})`
    );
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

