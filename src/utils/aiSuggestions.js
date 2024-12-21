// AI Suggestion Types
const TripTypes = {
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long'
};

const SeasonalActivities = {
  spring: ['hiking', 'sightseeing', 'cultural tours', 'photography'],
  summer: ['beach', 'water sports', 'hiking', 'festivals'],
  fall: ['hiking', 'food tours', 'cultural events', 'photography'],
  winter: ['skiing', 'winter sports', 'holiday markets', 'northern lights']
};

/**
 * Formats user preferences into a natural language prompt
 */
function formatPrompt(preferences) {
  const { duration, season, types, budget } = preferences;
  
  let tripType = TripTypes.MEDIUM;
  if (duration <= 3) tripType = TripTypes.SHORT;
  if (duration >= 8) tripType = TripTypes.LONG;

  const activities = types.length > 0 ? types : SeasonalActivities[season] || [];
  
  return `As a travel expert, suggest 3 destinations for a ${duration}-day trip during ${season} 
    with a budget of $${budget}. The traveler is interested in ${activities.join(', ')}.
    For each destination, provide:
    - Name and country
    - Why it's perfect for this duration
    - Estimated daily budget
    - Must-see attractions
    - Best time to visit
    Format as JSON with properties: name, country, description, dailyBudget, attractions, bestTime`;
}

/**
 * Parses the AI response into structured destination data
 */
function parseAIResponse(response) {
  try {
    // Remove any markdown formatting if present
    const jsonStr = response.replace(/```json\n?|\n?```/g, '');
    const suggestions = JSON.parse(jsonStr);
    
    return suggestions.map(suggestion => ({
      name: `${suggestion.name}, ${suggestion.country}`,
      description: suggestion.description,
      estimatedBudget: suggestion.dailyBudget * 7,
      daysRequired: '5-7',
      preferredSeason: suggestion.bestTime.toLowerCase(),
      tags: suggestion.attractions.slice(0, 3),
      imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(suggestion.name)}`,
      status: 'suggestion',
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
function calculateConfidence(suggestion) {
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
export async function getSuggestedDestinations(preferences) {
  try {
    // Format the prompt for the AI model
    const prompt = formatPrompt(preferences);
    
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
export function validateSuggestion(suggestion, preferences) {
  const { budget, duration, season, types } = preferences;
  
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
