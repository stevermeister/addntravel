/**
 * Parses a free-form text description of a time period into minimum and maximum days.
 * Uses Chrome's built-in AI model to handle various formats and potential misspellings.
 * 
 * @param {string} input - The time period description (e.g., "2 weeks", "1-2 months", "around 5 days")
 * @returns {Promise<{min_days: number, max_days: number}>} The parsed minimum and maximum days
 */
export async function parseDatePeriod(input) {
    if (!input) return { min_days: 0, max_days: 0 };

    try {
        // Create a session with Chrome's built-in AI feature
        const session = await ai.languageModel.create();

        // Craft the prompt for the AI model
        const prompt = `Convert the following time period to minimum and maximum days.
        OUTPUT in a format (keep all the quotes) {"min_days": "X", "max_days": "Y"}.
        Use these conversion rules:
        - For weeks multiply by 7
        - For months multiply by 30
        - For years multiply by 365
        
        Examples:
        - "2-3 days" -> {"min_days": "2", "max_days": "3"}
        - "1 week" -> {"min_days": "7", "max_days": "7"}
        - "2-3 weeks" -> {"min_days": "14", "max_days": "21"}
        - "1-2 months" -> {"min_days": "30", "max_days": "60"}
        - "around 5 days" -> {"min_days": "4", "max_days": "6"}
        - "2 years" -> {"min_days": "730", "max_days": "730"}
        - "1-2 years" -> {"min_days": "365", "max_days": "730"}
        
        INPUT: ${input}`;

        // Get and parse the AI response
        const result = await session.prompt(prompt);
        const parsed = JSON.parse(result);
        
        // Validate the parsed numbers
        const min_days = parseInt(parsed.min_days);
        const max_days = parseInt(parsed.max_days);
        
        if (isNaN(min_days) || isNaN(max_days)) {
            throw new Error('Invalid number format in AI response');
        }
        
        return { min_days, max_days };
    } catch (error) {
        console.error('Error parsing date period:', error);
        return { min_days: 0, max_days: 0 };
    }
}
