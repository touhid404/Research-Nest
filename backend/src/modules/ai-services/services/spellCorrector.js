import nspell from 'nspell';
import { generateCompletion } from '../../../lib/llmClient.js';
import Dictionary from 'simple-spellchecker';

let dictionaryEn = null;

// Initialize dictionary
Dictionary.getDictionary("en-US", function (err, result) {
    if (!err) {
        dictionaryEn = result;
    } else {
        console.warn("Failed to load US dictionary", err);
    }
});

/**
 * Service to spell correct text using either lightweight dictionary or LLM.
 * @param {object} params
 * @param {string} params.text - The text to correct
 * @param {string} params.lang - Language code (en, bn, etc)
 * @param {string} params.strategy - 'local' | 'llm'
 * @returns {Promise<object>} { correctedText, corrections }
 */
export const correctText = async ({ text, lang = 'en', strategy = 'local' }) => {

    // Strategy 1: Local (Dictionary based)
    if (strategy === 'local') {
        if (!dictionaryEn) {
            console.warn("Dictionary not ready yet.");
            return { correctedText: text, corrections: [] };
        }

        const words = text.split(/\s+/);
        const corrections = [];

        const correctedWords = words.map((word, index) => {
            // Remove punctuation roughly for checking
            const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
            if (cleanWord.length < 2) return word;

            const isMisspelled = !dictionaryEn.spellCheck(cleanWord);

            if (isMisspelled) {
                const suggestions = dictionaryEn.getSuggestions(cleanWord);
                if (suggestions.length > 0) {
                    const bestGuess = suggestions[0];
                    corrections.push({
                        original: cleanWord,
                        corrected: bestGuess,
                        index: index // Simple index, better usage would be character index
                    });
                    // Preserve punctuation? This is a simplistic replacement.
                    // Ideally we reconstruct preservation.
                    return word.replace(cleanWord, bestGuess);
                }
            }
            return word;
        });

        return {
            correctedText: correctedWords.join(" "),
            corrections
        };
    }

    // Strategy 2: LLM
    if (strategy === 'llm') {
        const prompt = `
        You are a spell checker. Correct the spelling and basic grammar of the following text.
        Return strictly JSON:
        {
          "correctedText": "string",
          "corrections": [
             { "original": "word", "corrected": "word", "reason": "spelling/grammar" }
          ]
        }
        
        Text: "${text}"
        `;

        try {
            const responseJson = await generateCompletion(prompt, "You are a helpful JSON-formatted spell checker.");
            let result;
            try {
                result = JSON.parse(responseJson);
            } catch (e) {
                const clean = responseJson.replace(/```json/g, "").replace(/```/g, "").trim();
                result = JSON.parse(clean);
            }
            return result;
        } catch (error) {
            console.error("LLM Spell check failed", error);
            // Fallback
            return { correctedText: text, corrections: [], error: "LLM Failed" };
        }
    }

    return { correctedText: text, corrections: [] };
};
