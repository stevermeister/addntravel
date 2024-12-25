import { touristicTags } from '../data/touristicTags';

/**
 * Get AI-powered tag suggestions based on location and existing tags
 * @param {string} location - The destination location
 * @param {string[]} existingTags - Currently selected tags
 * @param {Function} aiModelSessionFactory - Factory function to create AI model session
 * @returns {Promise<string[]>} Suggested tags
 */
export async function getSuggestedTags(location, existingTags = [], aiModelSessionFactory) {
    try {
        const session = aiModelSessionFactory ? 
            await aiModelSessionFactory() : 
            await ai.languageModel.create();

        const prompt = `Given a tourist destination "${location}" and these existing tags: [${existingTags.join(', ')}],
suggest 5 most relevant additional tags from this list: [${touristicTags.join(', ')}].
Return only the tag names separated by commas, nothing else.`;

        const response = await session.sendMessage(prompt);
        const suggestedTags = response.text.split(',').map(tag => tag.trim())
            .filter(tag => touristicTags.includes(tag))
            .filter(tag => !existingTags.includes(tag));

        return suggestedTags;
    } catch (error) {
        console.error('Error getting tag suggestions:', error);
        return [];
    }
}

/**
 * Check if a tag might be misspelled and suggest corrections
 * @param {string} input - The potentially misspelled tag
 * @param {Function} aiModelSessionFactory - Factory function to create AI model session
 * @returns {Promise<string|null>} Corrected tag or null if no correction needed
 */
export async function correctTagSpelling(input, aiModelSessionFactory) {
    try {
        const session = aiModelSessionFactory ? 
            await aiModelSessionFactory() : 
            await ai.languageModel.create();

        const prompt = `Is "${input}" a misspelling of any tag from this list: [${touristicTags.join(', ')}]?
If yes, return only the correct tag name. If no, return "NO_CORRECTION".
Consider common misspellings and typos.`;

        const response = await session.sendMessage(prompt);
        const suggestion = response.text.trim();
        
        return suggestion === 'NO_CORRECTION' ? null : suggestion;
    } catch (error) {
        console.error('Error correcting tag spelling:', error);
        return null;
    }
}

/**
 * Calculate Levenshtein distance between two strings
 * Helper function for local tag matching
 */
function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Get local tag suggestions without using AI
 * @param {string} input - Partial tag input
 * @returns {string[]} Matching tags
 */
export function getLocalTagSuggestions(input) {
    if (!input) return [];
    
    const normalizedInput = input.toLowerCase();
    
    // First try exact prefix matches
    const exactMatches = touristicTags.filter(tag => 
        tag.toLowerCase().startsWith(normalizedInput)
    );
    
    if (exactMatches.length > 0) {
        return exactMatches.slice(0, 5);
    }
    
    // If no exact matches, try fuzzy matching
    const fuzzyMatches = touristicTags
        .map(tag => ({
            tag,
            distance: levenshteinDistance(normalizedInput, tag.toLowerCase())
        }))
        .filter(({ distance }) => distance <= 3)
        .sort((a, b) => a.distance - b.distance)
        .map(({ tag }) => tag)
        .slice(0, 5);
        
    return fuzzyMatches;
}
