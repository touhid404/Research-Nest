import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Support for pdf-parse v2.4.5+
const { PDFParse } = require("pdf-parse");

import { generateCompletion } from "../../../lib/llmClient.js";

/**
 * Extracts text from a PDF buffer and uses AI to parse research paper details.
 * @param {Buffer} pdfBuffer - The buffer of the uploaded PDF file.
 * @returns {Promise<Object>} - The parsed paper details.
 */
export const parsePdf = async (pdfBuffer) => {
    try {
        // 1. Extract text from PDF
        if (typeof PDFParse !== 'function') {
            throw new Error("PDFParse class not found in pdf-parse library.");
        }

        // Ensure buffer
        if (!Buffer.isBuffer(pdfBuffer) && !(pdfBuffer instanceof Uint8Array)) {
            throw new Error("Input is not a valid Buffer or Uint8Array.");
        }

        // Initialize parser
        const parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });

        // Extract text
        const result = await parser.getText();
        const text = result.text;

        if (!text) {
            throw new Error("Extracted text is empty. The PDF might be image-only or encrypted.");
        }

        // Truncate text if too long to avoid token limits (keep first ~15000 chars)
        const truncatedText = text.substring(0, 15000);

        // 2. Prepare AI Prompt
        const systemInstruction = `
You are an expert academic librarian and bibliographic parser.
Your task is to extract meadata from the beginning text of a research paper.
You must return the result in strictly valid JSON format.
Do not include any explanation or markdown formatting (like \`\`\`json). Just the raw JSON object.

Extract the following fields:
- title: The full title of the paper.
- abstract: The abstract or description of the paper.
- publicationDate: The publication date if found (YYYY-MM-DD format), otherwise empty string.
- publicationName: The name of the journal, conference, or publication venue.
- doi: The Digital Object Identifier (DOI) if found.
- coAuthors: A comma-separated string of author names (excluding the main author if you can't distinguish, otherwise just list all).
- researchDomain: The primary field of study (e.g., Computer Science, Biology, etc.).
- tags: A comma-separated string of relevant keywords or tags (max 5).

If a field cannot be found, leave it as an empty string.
        `.trim();

        const prompt = `
Here is the beginning text of a research paper:

${truncatedText}

...

Please extract the metadata as JSON.
        `.trim();

        // 3. Call AI
        const completion = await generateCompletion(prompt, systemInstruction);

        // 4. Parse JSON
        let parsedData = {};
        try {
            // Remove markdown code blocks if present
            const cleanJson = completion.replace(/```json/g, "").replace(/```/g, "").trim();
            parsedData = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse AI response as JSON:", completion);
            // Attempt to recover partial JSON or fallback
            const jsonMatch = completion.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    parsedData = JSON.parse(jsonMatch[0]);
                } catch (err) {
                    throw new Error("AI response was not valid JSON.");
                }
            } else {
                throw new Error("AI response was not valid JSON.");
            }
        }

        return parsedData;

    } catch (error) {
        console.error("PDF Parsing Error:", error);
        throw new Error("Failed to parse PDF: " + error.message);
    }
};
