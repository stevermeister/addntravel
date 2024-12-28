export type TripType = 'short' | 'medium' | 'long';

export interface TripPreferences {
    duration: number;
    season: string;
    types: string[];
    budget: number;
}

export interface AIDestinationSuggestion {
    name: string;
    country: string;
    description: string;
    dailyBudget: number;
    attractions: string[];
    bestTime: string;
}

export interface FormattedDestinationSuggestion {
    name: string;
    description: string;
    estimatedBudget: number;
    daysRequired: string;
    preferredSeason: string;
    tags: string[];
    imageUrl: string;
    status: 'suggestion';
    confidence: number;
}

export interface ValidationResult {
    isValid: boolean;
    reasons: {
        budget: string | null;
        season: string | null;
        types: string | null;
    };
}

export interface SeasonalActivityMap {
    [key: string]: string[];
}
