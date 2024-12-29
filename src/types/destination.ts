export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TravelPeriod {
  label: string;
  minDays: number;
  maxDays: number;
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  coordinates?: Coordinates;
  preferredSeasons: string[];
  tags: string[];
  daysRequired: TravelPeriod | string;
  min_days?: number;
  max_days?: number;
  estimatedBudget: number;
  budget?: number;
  imageUrl: string;
  visitDate?: string;
  createdAt: string;
  type?: string;
}

export interface WishlistData {
  version: string;
  exportDate: string;
  destinations: Destination[];
  lastUpdated: string;
}
