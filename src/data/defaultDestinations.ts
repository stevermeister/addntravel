import { Destination } from '../types/destination';

export const defaultDestinations: Destination[] = [
  {
    name: 'Kyoto, Japan',
    description:
      'Ancient temples, traditional gardens, and cultural experiences. Known for its stunning cherry blossoms in spring, historic geisha district of Gion, and numerous UNESCO World Heritage sites including the famous Kinkaku-ji (Golden Pavilion).',
    daysRequired: {
      label: 'Weeklong Escape',
      minDays: 5,
      maxDays: 7,
    },
    estimatedBudget: 3000,
    preferredSeasons: ['Spring'],
    tags: ['culture', 'history', 'temples', 'food-scene', 'nature'],
    imageUrl:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Santorini, Greece',
    description:
      'Beautiful white-washed buildings and stunning Mediterranean views. Famous for its dramatic sunsets in Oia, volcanic beaches, and excellent wineries. Perfect for romantic getaways and photography enthusiasts.',
    daysRequired: {
      label: 'Short Getaway',
      minDays: 3,
      maxDays: 5,
    },
    estimatedBudget: 2500,
    preferredSeasons: ['Summer', 'Spring', 'Fall'],
    tags: ['beach', 'romantic', 'islands', 'food-scene', 'photography'],
    imageUrl:
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Banff National Park, Canada',
    description:
      'Pristine wilderness, turquoise mountain lakes, and outdoor adventures. Home to the iconic Lake Louise and Moraine Lake. Perfect for hiking, wildlife viewing, and winter sports.',
    daysRequired: {
      label: 'Leisure Week',
      minDays: 7,
      maxDays: 9,
    },
    estimatedBudget: 2000,
    preferredSeasons: ['Summer', 'Winter'],
    tags: ['nature', 'hiking', 'mountains', 'photography', 'wildlife'],
    imageUrl:
      'https://images.unsplash.com/photo-1513273216459-54c4833d6b4c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Machu Picchu, Peru',
    description:
      'Ancient Incan citadel set high in the Andes Mountains. This UNESCO World Heritage site offers stunning archaeological ruins, mountain vistas, and a glimpse into ancient Incan civilization.',
    daysRequired: {
      label: 'Short Getaway',
      minDays: 3,
      maxDays: 5,
    },
    estimatedBudget: 1800,
    preferredSeasons: ['Winter', 'Fall'],
    tags: ['history', 'hiking', 'mountains', 'archaeology', 'culture'],
    imageUrl:
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Maldives',
    description:
      'Paradise islands with crystal clear waters and overwater bungalows. Perfect for snorkeling, diving, and ultimate relaxation. Known for its luxury resorts, marine life, and pristine beaches.',
    daysRequired: {
      label: 'Weeklong Escape',
      minDays: 5,
      maxDays: 7,
    },
    estimatedBudget: 4000,
    preferredSeasons: ['Winter', 'Spring'],
    tags: ['beach', 'luxury', 'romantic', 'water-sports', 'nature'],
    imageUrl:
      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80',
  },
];
