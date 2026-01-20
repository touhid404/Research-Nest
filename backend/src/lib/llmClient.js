import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}) : null;

export const generateCompletion = async (prompt, systemInstruction = "You are a helpful assistant.") => {
    if (!openai) {
        console.warn("OpenAI API key not found. Returning mock response.");
        // Mock response for testing without keys or if provider is missing
        return JSON.stringify({
            summary: [
                "This is a mock summary point 1.",
                "This is a mock summary point 2.",
                "The LLM provider is not configured."
            ],
            actionItems: [
                { who: "User", action: "Configure API Key", due: "ASAP" }
            ],
            decisions: [
                "Used mock response due to missing API key."
            ]
        });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost effective
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("LLM Error:", error);
        throw new Error("Failed to generate completion from LLM provider.");
    }
};
