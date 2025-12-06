import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  dbUrl: process.env.DB_URL ,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || "development",
};
