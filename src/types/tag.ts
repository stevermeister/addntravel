export type Tag = string;

export interface TagSuggestion {
  tag: Tag;
  confidence: number;
}

export type PopularTag =
  | 'culture'
  | 'food-scene'
  | 'photography'
  | 'architecture'
  | 'historical'
  | 'nature'
  | 'shopping'
  | 'nightlife'
  | 'art-gallery'
  | 'local-cuisine';
