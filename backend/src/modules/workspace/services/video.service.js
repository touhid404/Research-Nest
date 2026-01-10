import { streamClient } from "../../../lib/stream.js";
import { config } from "../../../config/config.js";

// ============== VIDEO SERVICES ==============

export const generateVideoTokenService = async ({ userId, userName }) => {
    if (!config.streamVideoApiKey || !config.streamVideoSecret) {
        return { error: "Stream credentials are not configured on the server", status: 500 };
    }

    if (!userId) {
        return { error: "userId is required", status: 400 };
    }

    // Generate token using the shared streamClient
    const token = streamClient.generateUserToken({ user_id: userId, name: userName || "Guest" });

    return {
        data: {
            apiKey: config.streamVideoApiKey,
            token,
        }
    };
};
