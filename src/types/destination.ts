export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TravelPeriod {
  label: string;
  explanation: string;
  minDays: number;
  maxDays: number;
}

export interface Destination {
  id?: string;
  name: string;
  description?: string;
  coordinates?: Coordinates;
  preferredSeasons?: string[];
  tags?: string[];
  daysRequired?: TravelPeriod;
  estimatedBudget?: number;
  imageUrl?: string;
  visitDate?: string;
  createdAt?: string;
}

export interface WishlistData {
  version: string;
  exportDate: string;
  destinations: Destination[];
  lastUpdated: string;
}
