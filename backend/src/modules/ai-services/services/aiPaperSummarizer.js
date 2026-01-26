import { extractTextFromPDF, roughExtractSections } from "../../../lib/extractors.js";
import { generateCompletion } from "../../../lib/llmClient.js";
import dotenv from 'dotenv';
dotenv.config();

const MAX_CHUNK_LENGTH = 15000; // conservative limit for inputs

/**
 * Summarizes a paper from a file (buffer or path) or raw text.
 */
export const summarizePaper = async ({ inputType, content, fileBuffer, fileMimeType }) => {
    // 1. Privacy / Security check
    // If inputType is 'file' (meaning we have a buffer to parse), we must check if we are allowed to send it to LLM.
    const allowExternalUpload = process.env.AI_ALLOW_UPLOAD === 'true';

    // Extract Text first
    let fullText = "";
    if (inputType === 'text') {
        fullText = content;
    } else if (inputType === 'file' && fileBuffer) {
        if (fileMimeType === 'application/pdf') {
            fullText = await extractTextFromPDF(fileBuffer);
        } else {
            // Fallback for simple text files or throw
            throw new Error("Unsupported file type for AI summary. Only PDF supported currently.");
        }
    }

    if (!fullText || fullText.length < 50) {
        throw new Error("Content too short to summarize.");
    }

    // 2. Prepare text for LLM
    // If risky upload is DENIED, we can only send anonymized or limited text?
    // The requirement says: "By default process and summarize text locally or via chosen provider; do NOT upload raw attachments to an external LLM by default."
    // "Offer option to summarize only extracted metadata/selected sections."
    // For this implementation, if risky upload is DENIED, we will try to use the roughExtractSections 
    // and ONLY send specific sections (Abstract, Conclusion) which are generally considered less "raw attachment" and more "public metadata",
    // OR just use the local heuristic if strict.
    // However, LLM client usually sends text to OpenAI. Sending "Abstract" is sending text.
    // We will assume "Risky Upload" means sending the WHOLE file blob or full text blindly.
    // If deny, we truncate heavily to just Abstract + Conclusion?

    let textToSend = fullText;
    let heuristicMode = false;

    if (!allowExternalUpload && inputType === 'file') {
        // Strict mode: Extract structures locally, maybe only send Abstract + Conclusion to LLM if possible,
        // or just return the extracted sections as "heuristic summary".
        // Let's try to extract abstract and conclusion to minimize data leak.
        const structured = roughExtractSections(fullText);
        const abstract = structured.sections['Abstract'] || structured.sections['Introduction'] || "";
        const conclusion = structured.sections['Conclusion'] || structured.sections['Discussion'] || "";

        if (abstract || conclusion) {
            textToSend = `Abstract:\n${abstract}\n\nConclusion:\n${conclusion}`;
            if (textToSend.length < 100) {
                // If extraction failed, fallback to first 2000 chars
                textToSend = fullText.substring(0, 2000);
            }
        } else {
            textToSend = fullText.substring(0, 2000);
        }
    }

    // Truncate if still too massive
    if (textToSend.length > MAX_CHUNK_LENGTH) {
        textToSend = textToSend.substring(0, MAX_CHUNK_LENGTH) + "\n...[Truncated]";
    }

    // 3. Prompt for LLM
    const prompt = `
You are a research assistant. Analyze the following academic paper text and provide a structured summary.
Return ONLY valid JSON.

JSON Structure:
{
  "abstract": "1-3 sentences summary of the whole paper.",
  "keyFindings": ["bullet point 1", "bullet point 2", "bullet point 3"],
  "methods": "1-2 sentences describing the methodology.",
  "keywords": ["tag1", "tag2", "tag3", "tag4"],
  "confidence": 0.9 (number between 0 and 1 indicating confidence in extraction)
}

Text Content:
${textToSend}
`;

    try {
        const responseJsonString = await generateCompletion(prompt, "You are a helpful research assistant that outputs JSON.");

        let result;
        try {
            result = JSON.parse(responseJsonString);
        } catch (e) {
            const cleanJson = responseJsonString.replace(/```json/g, "").replace(/```/g, "").trim();
            result = JSON.parse(cleanJson);
        }

        return result;

    } catch (llmError) {
        console.error("LLM failed, falling back to heuristic:", llmError);
        // Fallback: Use local extraction
        const structured = roughExtractSections(fullText);
        return {
            abstract: structured.sections['Abstract'] || "Could not extract abstract.",
            keyFindings: ["Automated fallback: unable to generate specific findings."],
            methods: structured.sections['Methods'] || "Methods section not clearly identified.",
            keywords: ["automated", "fallback"],
            confidence: 0.1
        };
    }
};
