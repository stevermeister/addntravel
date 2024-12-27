/**
 * AI-based date parsing utilities
 */

/**
 * Parse a date period using AI
 */
export async function parseWithAI(input, aiModelSessionFactory) {
    try {
        // Create a session with Chrome's built-in AI feature or use provided factory
        const session = aiModelSessionFactory ? 
            await aiModelSessionFactory() : 
            await ai.languageModel.create();

        // Craft the prompt for the AI model
        const prompt = `Convert the following time period to minimum and maximum days.
            Input: "${input}"
            Format the response as JSON with min_days and max_days fields.
            Example: {"min_days": 7, "max_days": 14}`;

        // Get AI response
        const response = await session.generateText(prompt);
        
        try {
            const parsed = JSON.parse(response);
            if (
                typeof parsed.min_days === 'number' &&
                typeof parsed.max_days === 'number' &&
                parsed.min_days >= 0 &&
                parsed.max_days >= parsed.min_days
            ) {
                return parsed;
            }
        } catch (e) {
            console.warn('Failed to parse AI response:', e);
        }
    } catch (error) {
        console.warn('AI parsing failed:', error);
    }

    // Fallback to default values if AI parsing fails
    return { min_days: 0, max_days: 0 };
}
