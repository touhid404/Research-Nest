import { generateCompletion } from "../../../lib/llmClient.js";

/**
 * Enhances a description using AI for academic/professional tone.
 * @param {Object} params
 * @param {string} params.description - The original text to enhance
 * @param {string} [params.context='post'] - Context: post | proposal | research-idea
 * @param {string} [params.tone='academic'] - Tone: academic | professional
 * @returns {Promise<Object>} - { enhancedDescription, changesSummary }
 */
export const enhanceDescription = async ({ description, context = 'post', tone = 'academic' }) => {
    if (!description || description.trim().length < 20) {
        throw new Error("Description is too short to enhance. Minimum 20 characters required.");
    }

    const systemInstruction = `
You are an academic writing assistant.
Improve the clarity, grammar, and academic tone of the given description.
Context: This is for a ${context}.
Requested Tone: ${tone}.

Guidelines:
- Do not change the meaning, facts, or technical terminology.
- Avoid marketing or exaggerated language.
- Maintain a formal and professional structure.
- Improve sentence flow and coherence.
- Output the result as a JSON object with two fields:
  1. "enhancedDescription": The improved text.
  2. "changesSummary": An array of strings summarizing the improvements made (e.g., "Improved academic tone", "Refined sentence structure").
    `.trim();

    const prompt = `Please enhance the following description:\n\n${description}`;

    try {
        const response = await generateCompletion(prompt, systemInstruction);

        let parsedResult;
        try {
            // Try direct parse first
            parsedResult = JSON.parse(response);
        } catch (e) {
            // Robust parsing: extract content between ```json and ``` or { and }
            try {
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsedResult = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error("No JSON found in response");
                }
            } catch (innerError) {
                // Last resort fallback
                parsedResult = {
                    enhancedDescription: response.replace(/```json|```/g, "").trim(),
                    changesSummary: ["Improved clarity and professionalism (Parsed from raw output)"]
                };
            }
        }

        // If enhancedDescription is missing (e.g. mock response), handle it
        if (!parsedResult.enhancedDescription && parsedResult.summary) {
            return {
                enhancedDescription: description,
                changesSummary: ["Mock response: Configure API key for real enhancement."]
            };
        }

        return parsedResult;
    } catch (error) {
        console.error("AI Description Enhancer Error:", error);

        // Basic rule-based fallback for "Grammar-only enhancement"
        const basicAcademicEnhancement = (text) => {
            return text
                .replace(/\bi want to\b/gi, "This research aims to")
                .replace(/\bi will\b/gi, "The project will")
                .replace(/\bgood\b/gi, "advantageous")
                .replace(/\bbad\b/gi, "suboptimal")
                .replace(/\ba lot\b/gi, "considerably")
                .replace(/\breally\b/gi, "significantly")
                .replace(/\bstuff\b/gi, "elements")
                .replace(/\bthink\b/gi, "postulate")
                .replace(/\bi feel\b/gi, "it is observed")
                .trim();
        };

        const fallbackText = basicAcademicEnhancement(description);
        const isModified = fallbackText !== description;

        return {
            enhancedDescription: fallbackText,
            changesSummary: [
                "Grammar-only enhancement (Fallback)",
                isModified ? "Applied basic academic terminology" : "Checked for common informalisms",
                "LLM service temporarily unavailable (Quota reached)"
            ]
        };
    }
};
