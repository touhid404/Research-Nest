import { generateCompletion } from "../../../lib/llmClient.js";

/**
 * Enhances/Suggests fields for a research post/proposal using AI.
 * @param {Object} params
 * @param {string} [params.title] - Current title
 * @param {string} [params.researchTopic] - Current research topic
 * @param {string} [params.description] - Current description/abstract
 * @param {string} [params.context='post'] - Context: post | proposal | research-idea
 * @param {string} [params.tone='academic'] - Tone: academic | professional
 * @returns {Promise<Object>} - { enhancedDescription, suggestedTitle, suggestedTopic, changesSummary }
 */
export const enhanceDescription = async ({ title, researchTopic, description, context = 'post', tone = 'academic' }) => {
    // Check if at least one meaningful field is provided
    const hasTitle = title && title.trim().length > 3;
    const hasTopic = researchTopic && researchTopic.trim().length > 3;
    const hasDesc = description && description.trim().length > 10;

    if (!hasTitle && !hasTopic && !hasDesc) {
        throw new Error("Please provide at least a title, topic, or a short description to get suggestions.");
    }

    const systemInstruction = `
You are an expert academic writing assistant and research consultant.
Your goal is to refine and suggest content for research proposals and posts.

Context: This is for a ${context}.
Requested Tone: ${tone}.

Tasks:
1. Refine the given "title" to be more professional, impactful, and academically sound. If no title is provided, generate a compelling one based on the description/topic.
2. Refine the given "researchTopic" or suggest a more precise academic category if the provided one is too broad.
3. Refine the "description" for clarity, grammar, and academic flow. If the description is missing or very short, expand it into a professional abstract/summary based on the title and topic.

Guidelines:
- Maintain factual integrity; do not invent data but you can expand on themes.
- Use formal, sophisticated, and professional language suitable for a global research platform.
- Avoid marketing fluff; focus on scholarly value.
- Output the result strictly as a JSON object with these fields:
  1. "suggestedTitle": The refined/suggested title.
  2. "suggestedTopic": The refined/suggested research topic or domain.
  3. "enhancedDescription": The improved and potentially expanded description (STRICT MAXIMUM 900 CHARACTERS).
  4. "changesSummary": An array of strings summarizing your improvements (e.g., "Refined title for clarity", "Expanded abstract based on keywords").
    `.trim();

    const prompt = `
Current Data:
Title: ${title || "N/A"}
Research Topic: ${researchTopic || "N/A"}
Description: ${description || "N/A"}

Please provide suggested refinements for all three fields. Ensure the "enhancedDescription" is concise and does not exceed 900 characters.
    `.trim();

    try {
        const response = await generateCompletion(prompt, systemInstruction);

        let parsedResult;
        try {
            parsedResult = JSON.parse(response);
        } catch (e) {
            try {
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsedResult = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error("No JSON found");
                }
            } catch (innerError) {
                parsedResult = {
                    enhancedDescription: response.replace(/```json|```/g, "").trim(),
                    suggestedTitle: title,
                    suggestedTopic: researchTopic,
                    changesSummary: ["Direct extraction from AI output"]
                };
            }
        }

        // Truncate if LLM exceeds limit just in case
        if (parsedResult.enhancedDescription && parsedResult.enhancedDescription.length > 900) {
            parsedResult.enhancedDescription = parsedResult.enhancedDescription.substring(0, 897) + "...";
        }

        // Ensure we have reasonable defaults if AI missed a field
        return {
            suggestedTitle: parsedResult.suggestedTitle || title,
            suggestedTopic: parsedResult.suggestedTopic || researchTopic,
            enhancedDescription: parsedResult.enhancedDescription || description,
            changesSummary: parsedResult.changesSummary || ["Improved research metadata"]
        };
    } catch (error) {
        console.error("AI Research Enhancer Error:", error);

        // Minimal fallback for server errors
        return {
            suggestedTitle: title,
            suggestedTopic: researchTopic,
            enhancedDescription: description,
            changesSummary: ["AI service temporarily unavailable. Using original content."]
        };
    }
};
