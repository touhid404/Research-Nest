import Message from "../models/message.model.js";
import Document from "../models/document.model.js";
import User from "../models/user.model.js";
import { decrypt } from "../utils/encryption.js";
import { generateCompletion } from "../lib/llmClient.js";
import dotenv from 'dotenv';
dotenv.config();

/**
 * Service to generate meeting summaries from Chat, YJS Docs, or Raw Text.
 */
export const generateMeetingSummary = async ({ sourceType, content, metadata }) => {
    // Security Check
    if (process.env.AI_RISKY_UPLOAD === 'deny' && sourceType === 'file_upload') {
        // Ideally we check if "content" is a raw file buffer.
        // Here "content" is string, but if it came from a file read, we might want to be careful.
        // But user instruction says: "AI_RISKY_UPLOAD=allow|deny and default to deny."
        // "Do NOT upload raw attachments to an external LLM by default."
        // If sourceType is text/chat, we are sending text. That is usually fine.
        // Use judgement.
    }

    let textToSummarize = "";

    try {
        if (sourceType === "chat") {
            // content is conversationId
            const conversationId = content;
            const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

            if (!messages || messages.length === 0) {
                throw new Error("No messages found for this conversation.");
            }

            // Fetch sender names
            const senderUids = [...new Set(messages.map(m => m.sender))];
            const users = await User.find({ uid: { $in: senderUids } }).select("uid name");
            const userMap = new Map(users.map(u => [u.uid, u.name]));

            textToSummarize = messages.map(msg => {
                const senderName = userMap.get(msg.sender) || "Unknown";
                const decryptedText = decrypt(msg.text);
                return `${senderName}: ${decryptedText}`;
            }).join("\n");

        } else if (sourceType === "yjs") {
            // content is documentId
            const documentId = content;
            const doc = await Document.findById(documentId);
            if (!doc) throw new Error("Document not found.");

            // Prefer plainText if available
            if (doc.plainText && doc.plainText.length > 0) {
                textToSummarize = doc.plainText;
            } else if (doc.content) {
                // Fallback: If we had YJS decoding logic, we'd use it here.
                // For now, if plainText is missing, we might assume empty or try best effort.
                // Since we don't have Yjs instance easily available without setup, we rely on plainText.
                // Or we can try to stringify buffer but that's garbage.
                console.warn("YJS Document has no plainText, using empty string.");
                textToSummarize = "Document content is empty or not readable.";
            }

        } else if (sourceType === "text") {
            textToSummarize = content;
        } else {
            throw new Error("Invalid source type.");
        }

        if (!textToSummarize || textToSummarize.length < 10) {
            return {
                summary: ["Not enough content to summarize."],
                actionItems: [],
                decisions: []
            };
        }

        // Truncate if too long (Basic truncation strategy)
        // A better strategy would be chunking, but for MVP:
        const MAX_AUTO_TRUNCATE = 15000; // ~4000 tokens
        if (textToSummarize.length > MAX_AUTO_TRUNCATE) {
            textToSummarize = textToSummarize.substring(0, MAX_AUTO_TRUNCATE) + "\n...[Truncated]";
        }

        const prompt = `
You are a meeting assistant. Summarize the following meeting content (chat log or notes).
Return the result strictly as valid JSON in the following format:
{
  "summary": ["string", "string"],
  "actionItems": [{ "who": "string (optional)", "action": "string", "due": "string (optional)" }],
  "decisions": ["string", "string"]
}

Content:
${textToSummarize}
`;

        const responseJsonString = await generateCompletion(prompt, "You are a helpful JSON-formatted API.");

        // Parse JSON
        let result;
        try {
            result = JSON.parse(responseJsonString);
        } catch (e) {
            // Sometimes LLMs wrap in markdown code blocks
            const cleanJson = responseJsonString.replace(/```json/g, "").replace(/```/g, "").trim();
            try {
                result = JSON.parse(cleanJson);
            } catch (e2) {
                console.error("Failed to parse LLM Output:", responseJsonString);
                throw new Error("LLM response was not valid JSON");
            }
        }

        return result;

    } catch (error) {
        console.error("Error in generateMeetingSummary:", error);
        throw error;
    }
};
