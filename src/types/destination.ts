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
  id?: string;
  name: string;
  description: string;
  estimatedBudget: number;
  preferredSeasons: string[];
  daysRequired: TravelPeriod | string;
  tags: string[];
  createdAt: string;
  imageUrl: string;
  coordinates?: { lat: number; lng: number } | null;
  min_days?: number;
  max_days?: number;
  budget?: number;
  visitDate?: string;
  type?: string;
}

export interface WishlistData {
  version: string;
  exportDate: string;
  destinations: Destination[];
  lastUpdated: string;
}
