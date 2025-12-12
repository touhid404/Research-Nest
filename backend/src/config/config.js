import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  dbUrl: process.env.DB_URL ,
  nodeEnv: process.env.NODE_ENV || "development",
  developmentFrontendURL: process.env.DEVELOPMENT_FRONTEND_URL || "http://localhost:5173",
  productionFrontendURL: process.env.PRODUCTION_FRONTEND_URL,
};
