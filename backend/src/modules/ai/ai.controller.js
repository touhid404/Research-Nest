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

import { correctText } from "../../services/spellCorrector.js";

export const spellCorrect = async (req, res) => {
    try {
        const { text, lang, strategy } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Text is required."
            });
        }

        const result = await correctText({ text, lang, strategy });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Spell Check Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to correct text.",
            error: error.message
        });
    }
};
