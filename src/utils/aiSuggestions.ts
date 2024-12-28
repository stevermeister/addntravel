import {
    TripPreferences,
    AIDestinationSuggestion,
    FormattedDestinationSuggestion,
    ValidationResult
} from '../types/ai';

/**
 * Parses the AI response into structured destination data
 */
function parseAIResponse(response: string): FormattedDestinationSuggestion[] {
    try {
        // Remove any markdown formatting if present
        const jsonStr = response.replace(/```json\n?|\n?```/g, '');
        const suggestions = JSON.parse(jsonStr) as AIDestinationSuggestion[];
        
        return suggestions.map(suggestion => ({
            name: `${suggestion.name}, ${suggestion.country}`,
            description: suggestion.description,
            estimatedBudget: suggestion.dailyBudget * 7,
            daysRequired: '5-7',
            preferredSeason: suggestion.bestTime.toLowerCase(),
            tags: suggestion.attractions.slice(0, 3),
            imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(suggestion.name)}`,
            status: 'suggestion' as const,
            confidence: calculateConfidence(suggestion)
        }));
    } catch (error) {
        console.error('Error parsing AI response:', error);
        return [];
    }
}

/**
 * Calculates a confidence score for the suggestion
 */
function calculateConfidence(suggestion: AIDestinationSuggestion): number {
    let score = 1.0;
    
    // Reduce confidence if key information is missing
    if (!suggestion.description) score -= 0.2;
    if (!suggestion.attractions || suggestion.attractions.length === 0) score -= 0.2;
    if (!suggestion.bestTime) score -= 0.1;
    
    return Math.max(0, score);
}

/**
 * Main function to get AI-powered destination suggestions
 */
export async function getSuggestedDestinations(): Promise<FormattedDestinationSuggestion[]> {
    try {
        // In a real implementation, this would call the Gemini API
        // For now, we'll return mock data
        const mockResponse = {
            suggestions: [
                {
                    name: "Kyoto",
                    country: "Japan",
                    description: "Perfect for cultural immersion and spring cherry blossoms",
                    dailyBudget: 150,
                    attractions: ["Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Kinkaku-ji"],
                    bestTime: "Spring"
                },
                {
                    name: "Barcelona",
                    country: "Spain",
                    description: "Ideal blend of culture, cuisine, and coastal beauty",
                    dailyBudget: 120,
                    attractions: ["Sagrada Familia", "Park Güell", "Gothic Quarter"],
                    bestTime: "Spring"
                },
                {
                    name: "Vancouver",
                    country: "Canada",
                    description: "Gateway to outdoor adventures and urban experiences",
                    dailyBudget: 140,
                    attractions: ["Stanley Park", "Grouse Mountain", "Granville Island"],
                    bestTime: "Summer"
                }
            ]
        };

        // Parse and format the suggestions
        return parseAIResponse(JSON.stringify(mockResponse.suggestions));
    } catch (error) {
        console.error('Error getting AI suggestions:', error);
        return [];
    }
}

/**
 * Validates if a suggestion matches user preferences
 */
export function validateSuggestion(
    suggestion: FormattedDestinationSuggestion,
    preferences: TripPreferences
): ValidationResult {
    const { budget, season, types } = preferences;
    
    // Check if suggestion matches basic criteria
    const matchesBudget = suggestion.estimatedBudget <= budget;
    const matchesSeason = !season || suggestion.preferredSeason === season;
    const matchesTypes = types.length === 0 || 
        suggestion.tags.some(tag => types.includes(tag));
    
    return {
        isValid: matchesBudget && matchesSeason && matchesTypes,
        reasons: {
            budget: matchesBudget ? null : 'Over budget',
            season: matchesSeason ? null : 'Wrong season',
            types: matchesTypes ? null : 'Different activities'
        }
    };
}
