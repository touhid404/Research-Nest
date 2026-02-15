import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  dbEnv: process.env.DB_ENV || "local",
  localDbUrl: process.env.MONGO_LOCAL_URL,
  cloudDbUrl: process.env.MONGO_CLOUD_URL,
  developmentFrontendURL: process.env.DEVELOPMENT_FRONTEND_URL || "http://localhost:5173",
  productionFrontendURL: process.env.PRODUCTION_FRONTEND_URL,
  streamVideoApiKey: process.env.STREAM_API_KEY,
  streamVideoSecret: process.env.STREAM_API_SECRET,
  nodeEnv: process.env.NODE_ENV || "development",
  pingUrl: process.env.PING_URL ,
  fbServiceKey: process.env.FB_SERVICE_KEY,
};
