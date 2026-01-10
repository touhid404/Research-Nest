import { StreamChat } from "stream-chat";
import { StreamClient } from "@stream-io/node-sdk";
import { config } from "../config/config.js";

const apiKey = config.streamVideoApiKey;
const apiSecret = config.streamVideoSecret;

if (!apiKey || !apiSecret) {
  console.error("STREAM_API_KEY or STREAM_API_SECRET is missing");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret); // will be used for chat features
export const streamClient = new StreamClient(apiKey, apiSecret); // will be used for video calls

export const upsertStreamUser = async (userData) => {
  try {
    await chatClient.upsertUser(userData);
    console.log("Stream user upserted successfully");
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUser(userId);
    console.log("Stream user deleted successfully");
  } catch (error) {
    console.error("Error deleting the Stream user:", error);
  }
};
