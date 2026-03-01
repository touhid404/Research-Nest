import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
dotenv.config();

/**
 * Transcription service using Groq's Whisper API.
 * Uses the same GROQ_API_KEY already configured for LLM completions.
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
const WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const MAX_CHUNK_SIZE = 24 * 1024 * 1024; // 24MB safety margin (Groq limit is 25MB)

/**
 * Transcribe an audio buffer using Groq Whisper.
 * @param {Buffer} audioBuffer - The audio file buffer
 * @param {string} fileName - Original file name (for MIME type detection)
 * @returns {Promise<string>} - Transcribed text
 */
export const transcribeAudio = async (audioBuffer, fileName = "recording.webm") => {
    if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not configured. Cannot transcribe audio.");
    }

    if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error("Empty audio buffer provided.");
    }

    console.log(`[Transcription] Starting transcription of ${(audioBuffer.length / 1024 / 1024).toFixed(2)}MB audio file...`);

    // If file is too large, we'd need chunking. For now, reject oversized files.
    if (audioBuffer.length > MAX_CHUNK_SIZE) {
        throw new Error(
            `Audio file is too large (${(audioBuffer.length / 1024 / 1024).toFixed(1)}MB). ` +
            `Maximum supported size is ${(MAX_CHUNK_SIZE / 1024 / 1024).toFixed(0)}MB. ` +
            `Try recording shorter sessions.`
        );
    }

    try {
        const formData = new FormData();
        formData.append("file", audioBuffer, {
            filename: fileName,
            contentType: getContentType(fileName),
        });
        formData.append("model", "whisper-large-v3-turbo");
        formData.append("language", "en");
        formData.append("response_format", "text");

        const response = await axios.post(WHISPER_URL, formData, {
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                ...formData.getHeaders(),
            },
            timeout: 120000, // 2 minutes timeout for transcription
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        const transcript = typeof response.data === "string"
            ? response.data.trim()
            : JSON.stringify(response.data);

        console.log(`[Transcription] Completed. Transcript length: ${transcript.length} chars`);
        return transcript;

    } catch (error) {
        const errorMsg = error.response?.data?.error?.message || error.message;
        console.error("[Transcription] Groq Whisper Error:", errorMsg);

        if (error.response?.status === 401) {
            throw new Error("Groq API authentication failed. Check your GROQ_API_KEY.");
        } else if (error.response?.status === 413) {
            throw new Error("Audio file is too large for the Groq Whisper API.");
        } else if (error.response?.status === 429) {
            throw new Error("Groq API rate limit exceeded. Please try again in a moment.");
        }

        throw new Error(`Transcription failed: ${errorMsg}`);
    }
};

/**
 * Get MIME content type from filename.
 */
function getContentType(fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const mimeMap = {
        webm: "audio/webm",
        mp3: "audio/mpeg",
        mp4: "audio/mp4",
        wav: "audio/wav",
        ogg: "audio/ogg",
        m4a: "audio/m4a",
        flac: "audio/flac",
    };
    return mimeMap[ext] || "audio/webm";
}
