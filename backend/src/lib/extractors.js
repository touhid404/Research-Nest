import pdf from 'pdf-parse/lib/pdf-parse.js';
import fs from 'fs';
// We might add mammoth for docx later if needed, but for now pdf-parse is sufficient.

/**
 * Extracts text from a PDF buffer or file path.
 * @param {Buffer|string} input - The file buffer or path to the file.
 * @returns {Promise<string>} - Extracted text.
 */
export const extractTextFromPDF = async (input) => {
    try {
        let dataBuffer = input;
        if (typeof input === 'string') {
            if (fs.existsSync(input)) {
                dataBuffer = fs.readFileSync(input);
            } else {
                throw new Error("File not found at path: " + input);
            }
        }

        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error("Error extracting PDF text:", error);
        throw new Error("Failed to extract text from PDF: " + error.message);
    }
};

/**
 * Extracts metadata (title, potential authors) and key sections roughly.
 * This can be used for heuristic fallback.
 * @param {string} text - Full extracted text.
 * @returns {object} - Structured rough content.
 */
export const roughExtractSections = (text) => {
    // Simple heuristic splitting
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Guess title (usually first non-empty line or largest text if we had layout info, but here just first few lines)
    const titleCandidates = lines.slice(0, 3).join(" ");

    // Try to find sections
    const headings = ['Abstract', 'Introduction', 'Methods', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'References'];
    const sections = {};

    let currentSection = 'Header';
    sections[currentSection] = [];

    lines.forEach(line => {
        const upper = line.toUpperCase().replace(/[^A-Z]/g, "");
        // Check if line looks like a standard heading
        const matchedHeading = headings.find(h => {
            const hUpper = h.toUpperCase();
            return upper === hUpper || upper === `1${hUpper}` || upper === `I${hUpper}`; // 1. INTRODUCTION or I. INTRODUCTION
        });

        if (matchedHeading) {
            currentSection = matchedHeading;
            sections[currentSection] = [];
        } else {
            if (!sections[currentSection]) sections[currentSection] = [];
            sections[currentSection].push(line);
        }
    });

    return {
        titleCandidates,
        sections: Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, v.join("\n")]))
    };
};
