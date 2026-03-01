import { generateMeetingSummary } from "./services/aiMeetingSummary.js";
import { correctText } from "./services/spellCorrector.js";
import { enhanceDescription as enhanceDescriptionService } from "./services/aiDescriptionEnhancer.js";
import { transcribeAudio } from "./services/transcriptionService.js";
import Meeting from "../../models/meeting.model.js";


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

/**
 * Transcribe meeting audio and generate AI summary.
 * Accepts multipart audio file + meetingId.
 * Pipeline: audio → Whisper transcription → LLM summary → save to Meeting doc.
 */
export const transcribeAndSummarize = async (req, res) => {
    try {
        const { meetingId, recordedBy, recordedByName } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No audio file uploaded."
            });
        }

        if (!meetingId) {
            return res.status(400).json({
                success: false,
                message: "meetingId is required."
            });
        }

        // Find the meeting
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found."
            });
        }

        // Update recordedBy if provided
        if (recordedBy) meeting.recordedBy = recordedBy;
        if (recordedByName) meeting.recordedByName = recordedByName;

        // Mark as processing
        meeting.recordingStatus = "processing";
        await meeting.save();

        // Emit socket event for real-time UI update
        const io = req.app.get("io");
        if (io) {
            io.to(`workspace:${meeting.workspaceId}`).emit("meeting:updated", meeting.toObject());
        }

        // Return immediate response to prevent timeouts (especially for Render's 30s limit)
        res.status(202).json({
            success: true,
            message: "Meeting recording received and is now processing in the background.",
            data: { meetingId: meeting._id, status: "processing" }
        });

        // Background Processing Block
        // We use a self-invoking async function to handle the long-running tasks
        (async () => {
            try {
                // Step 1: Transcribe audio
                console.log(`[Meeting ${meetingId}] Background: Starting transcription...`);
                const transcript = await transcribeAudio(
                    req.file.buffer,
                    req.file.originalname || "recording.webm"
                );

                if (!transcript || transcript.length < 10) {
                    meeting.recordingStatus = "failed";
                    await meeting.save();
                    if (io) io.to(`workspace:${meeting.workspaceId}`).emit("meeting:updated", meeting.toObject());
                    return;
                }

                // Step 2: Generate summary from transcript
                console.log(`[Meeting ${meetingId}] Background: Generating summary...`);
                const summaryResult = await generateMeetingSummary({
                    sourceType: "text",
                    content: transcript,
                    metadata: {
                        meetingTitle: meeting.title,
                        meetingDescription: meeting.description,
                    }
                });

                // Step 3: Save results
                meeting.transcript = transcript;
                meeting.summary = summaryResult;
                meeting.summaryGeneratedAt = new Date();
                meeting.recordingStatus = "completed";
                await meeting.save();

                console.log(`[Meeting ${meetingId}] Background: Processing complete.`);

                // Emit final update via socket
                if (io) {
                    io.to(`workspace:${meeting.workspaceId}`).emit("meeting:updated", meeting.toObject());
                }
            } catch (processingError) {
                console.error(`[Meeting ${meetingId}] Background Processing Error:`, processingError);
                meeting.recordingStatus = "failed";
                await meeting.save();
                if (io) {
                    io.to(`workspace:${meeting.workspaceId}`).emit("meeting:updated", meeting.toObject());
                }
            }
        })();

    } catch (error) {
        console.error("Transcribe & Summarize Entry Error:", error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: error.message || "Failed to initiate background processing.",
            });
        }
    }
};

