import { Destination } from '../types/destination';

export const defaultDestinations: Destination[] = [
    {
        id: '1',
        name: "Kyoto, Japan",
        description: "Ancient temples, traditional gardens, and cultural experiences",
        daysRequired: {
            label: "Weeklong Escape",
            minDays: 7,
            maxDays: 10
        },
        estimatedBudget: 3000,
        preferredSeasons: ["spring"],
        tags: ["culture", "history", "temples"],
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        name: "Santorini, Greece",
        description: "Beautiful white-washed buildings and stunning Mediterranean views",
        daysRequired: {
            label: "Short Getaway",
            minDays: 5,
            maxDays: 7
        },
        estimatedBudget: 2500,
        preferredSeasons: ["summer"],
        tags: ["beach", "romantic", "islands"],
        imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e",
        createdAt: new Date().toISOString()
    },
    {
        id: '3',
        name: "Banff National Park, Canada",
        description: "Pristine wilderness, mountain lakes, and outdoor adventures",
        daysRequired: {
            label: "Leisure Week",
            minDays: 7,
            maxDays: 14
        },
        estimatedBudget: 2000,
        preferredSeasons: ["summer"],
        tags: ["nature", "hiking", "mountains"],
        imageUrl: "https://images.unsplash.com/photo-1513273216459-54c4833d6b4c",
        createdAt: new Date().toISOString()
    },
    {
        id: '4',
        name: "Machu Picchu, Peru",
        description: "Ancient Incan citadel set high in the Andes Mountains",
        daysRequired: {
            label: "Short Getaway",
            minDays: 4,
            maxDays: 5
        },
        estimatedBudget: 1800,
        preferredSeasons: ["winter"],
        tags: ["history", "hiking", "culture"],
        imageUrl: "https://images.unsplash.com/photo-1526392060635-9d6019884377",
        createdAt: new Date().toISOString()
    },
    {
        id: '5',
        name: "Maldives",
        description: "Tropical paradise with overwater bungalows and crystal-clear waters",
        daysRequired: {
            label: "Weeklong Escape",
            minDays: 7,
            maxDays: 10
        },
        estimatedBudget: 4000,
        preferredSeasons: ["winter"],
        tags: ["beach", "luxury", "romantic"],
        imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8",
        createdAt: new Date().toISOString()
    },
    {
        id: '6',
        name: "Swiss Alps",
        description: "Stunning mountain scenery and world-class skiing",
        daysRequired: {
            label: "Leisure Week",
            minDays: 7,
            maxDays: 14
        },
        estimatedBudget: 3500,
        preferredSeasons: ["winter"],
        tags: ["skiing", "mountains", "nature"],
        imageUrl: "https://images.unsplash.com/photo-1531310197839-ccf54634509e",
        createdAt: new Date().toISOString()
    }
];
