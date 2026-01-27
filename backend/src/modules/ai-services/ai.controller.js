import { generateMeetingSummary } from "./services/aiMeetingSummary.js";
import { correctText } from "./services/spellCorrector.js";
import { enhanceDescription as enhanceDescriptionService } from "./services/aiDescriptionEnhancer.js";


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

export const enhanceDescription = async (req, res) => {
    try {
        const { title, researchTopic, description, context, tone } = req.body;

        const result = await enhanceDescriptionService({
            title,
            researchTopic,
            description,
            context,
            tone
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Enhance Description Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to enhance content.",
        });
    }
};


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

export const parsePdfFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded."
            });
        }

        const pdfBuffer = req.file.buffer;

        // Dynamically import to avoid circular dependency issues if any, though not expected here
        const { parsePdf } = await import("./services/pdfParser.js");

        const result = await parsePdf(pdfBuffer);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("PDF Parse Controller Error:", error);
        res.status(500).json({
            success: false,
            message: `Failed to parse PDF: ${error.message}`,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
