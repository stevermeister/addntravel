export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Destination {
  id?: string;
  name: string;
  description?: string;
  coordinates?: Coordinates;
  preferredSeason?: string;
  tags?: string[];
  daysRequired?: string;
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
