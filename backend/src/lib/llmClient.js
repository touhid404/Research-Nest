import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * llmClient.js
 * Supports Groq (q) and xAI Grok (k).
 * Automatically detects the provider based on the API key prefix:
 * - 'gsk_' -> Groq
 * - 'xai-' -> xAI (Grok)
 */

// Check for multiple possible environment variable names to be helpful
const RAW_KEY = process.env.GROQ_API_KEY || process.env.GROK_API_KEY || process.env.XAI_API_KEY;

export const generateCompletion = async (
    prompt,
    systemInstruction = "You are a helpful academic assistant."
) => {
    if (!RAW_KEY) {
        console.warn("No LLM API key found. Returning mock response.");
        return JSON.stringify({
            summary: ["AI provider not configured. Please add GROQ_API_KEY to your .env file."],
            actionItems: [{ who: "User", action: "Add API Key", due: "ASAP" }],
            decisions: ["Fallback to mock."]
        });
    }

    // Detect provider by searching for signatures in the key string
    // This helps even if the user accidentally prefixed it (e.g., "xai-gsk_...")
    const cleanKey = RAW_KEY.trim();
    const isGsk = cleanKey.includes("gsk_");
    const isXai = cleanKey.includes("xai-") && !isGsk; // xAI keys start with xai-, Groq with gsk_

    const providerName = isXai ? "xAI (Grok)" : "Groq";

    // Extract the actual key if it's double-prefixed (e.g., "xai-gsk_..." -> "gsk_...")
    let API_KEY = cleanKey;
    if (isGsk && cleanKey.startsWith("xai-gsk_")) {
        API_KEY = cleanKey.replace("xai-", "");
    }

    // Base URLs
    const baseURL = isXai
        ? "https://api.x.ai/v1/chat/completions"
        : "https://api.groq.com/openai/v1/chat/completions";

    // Default models
    // For Groq, llama-3.3-70b-versatile is the best current free-tier model
    const model = isXai ? "grok-beta" : "llama-3.3-70b-versatile";

    try {
        console.log(`[LLM] Calling ${providerName} with model ${model}...`);

        const response = await axios.post(
            baseURL,
            {
                model: model,
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: prompt }
                ],
                temperature: 0.3
            },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 25000 // 25s timeout for Grok which can be slow
            }
        );

        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            throw new Error(`Invalid response structure from ${providerName}`);
        }

        return response.data.choices[0].message.content;

    } catch (error) {
        const errorData = error.response?.data;
        console.error(`${providerName} LLM Error:`, errorData || error.message);

        // Provide more specific error messages to help user debug
        if (error.response?.status === 401) {
            throw new Error(`Authentication failed for ${providerName}. Please check your API key.`);
        } else if (error.response?.status === 429) {
            throw new Error(`${providerName} API quota exceeded or rate limited.`);
        }

        throw new Error(`Failed to generate completion from ${providerName}: ${error.message}`);
    }
};
