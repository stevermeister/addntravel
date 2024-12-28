import { Tag } from '../types/tag';

interface SimpleDestination {
    name: string;
    tags: Tag[];
    imageUrl: string;
}

export const destinations: SimpleDestination[] = [
    {
        "name": "Paris, France",
        "tags": [
            "city-break",
            "culture",
            "food-scene",
            "architecture",
            "art-gallery",
            "historical"
        ],
        "imageUrl": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "name": "Tokyo, Japan",
        "tags": [
            "city-break",
            "modern",
            "food-scene",
            "culture",
            "shopping",
            "technology"
        ],
        "imageUrl": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "name": "New York City, USA",
        "tags": [
            "city-break",
            "shopping",
            "culture",
            "food-scene",
            "art-gallery",
            "nightlife"
        ],
        "imageUrl": "https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "name": "Grand Canyon, USA",
        "tags": [
            "nature",
            "hiking",
            "photography",
            "national-park",
            "adventure"
        ],
        "imageUrl": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "name": "Great Barrier Reef, Australia",
        "tags": [
            "nature",
            "diving",
            "snorkeling",
            "marine-life",
            "beach"
        ],
        "imageUrl": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "name": "Petra, Jordan",
        "tags": [
            "historical",
            "archaeological",
            "unesco",
            "culture",
            "desert"
        ],
        "imageUrl": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "name": "Machu Picchu, Peru",
        "tags": [
            "historical",
            "hiking",
            "archaeological",
            "unesco",
            "mountains"
        ],
        "imageUrl": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "name": "Maldives",
        "tags": [
            "beach",
            "luxury",
            "diving",
            "romantic",
            "island"
        ],
        "imageUrl": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "name": "Santorini, Greece",
        "tags": [
            "island",
            "beach",
            "romantic",
            "luxury",
            "photography"
        ],
        "imageUrl": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "name": "Cape Town, South Africa",
        "tags": [
            "city-break",
            "culture",
            "beach",
            "wine-tasting",
            "nature"
        ],
        "imageUrl": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "name": "Ha Long Bay, Vietnam",
        "tags": [
            "nature",
            "cruise",
            "photography",
            "unesco",
            "kayaking"
        ],
        "imageUrl": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "name": "Dubrovnik, Croatia",
        "tags": [
            "historical",
            "coastal",
            "culture",
            "photography",
            "beach"
        ],
        "imageUrl": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "name": "Amalfi Coast, Italy",
        "tags": [
            "coastal",
            "scenic-drive",
            "food-scene",
            "romantic",
            "luxury"
        ],
        "imageUrl": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
    }
];
