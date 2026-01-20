import { generateMeetingSummary } from "../../services/aiMeetingSummary.js";

export const summarizeMeeting = async (req, res) => {
    try {
        const { sourceType, content, metadata } = req.body;

        if (!sourceType || !content) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: sourceType and content are required."
            });
        }

        if (!['chat', 'yjs', 'text'].includes(sourceType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sourceType. Must be 'chat', 'yjs', or 'text'."
            });
        }

        const result = await generateMeetingSummary({ sourceType, content, metadata });

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Summarization Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate summary.",
            error: error.message
        });
    }
};
