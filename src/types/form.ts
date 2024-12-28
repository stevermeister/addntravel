export interface FormData {
  destinationName: string;
  description: string;
  estimatedBudget: string;
  preferredSeason: string;
  daysRequired: string;
  min_days: number;
  max_days: number;
  tags: string;
  imageUrl: string;
  destinationSelected: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface ImageSearchResult {
  link: string;
  title: string;
  image: {
    contextLink: string;
    thumbnailLink: string;
  };
}

export interface TagSuggestion {
  tag: string;
  confidence: number;
}
