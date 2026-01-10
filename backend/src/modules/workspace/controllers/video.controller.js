import { generateVideoTokenService } from "../services/video.service.js";

// ============== VIDEO CONTROLLERS ==============

export const getVideoToken = async (req, res) => {
    try {
        const { userId, userName } = req.body;

        const result = await generateVideoTokenService({ userId, userName });

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        res.status(200).json({ success: true, ...result.data });
    } catch (error) {
        console.error("Failed to create Stream Video token:", error);
        res.status(500).json({ success: false, message: "Failed to create Stream token" });
    }
};
