import { Destination } from '../types/destination';

export const defaultDestinations: Destination[] = [
  {
    id: 'kyoto-japan',
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
    createdAt: new Date().toISOString(),
  },
  {
    id: 'santorini-greece',
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
    createdAt: new Date().toISOString(),
  },
  {
    id: 'machu-picchu-peru',
    name: 'Machu Picchu, Peru',
    description:
      'Ancient Incan citadel set high in the Andes Mountains. A UNESCO World Heritage site offering breathtaking views and rich history. Best visited during the dry season for optimal hiking conditions.',
    daysRequired: {
      label: 'Extended Adventure',
      minDays: 4,
      maxDays: 6,
    },
    estimatedBudget: 2000,
    preferredSeasons: ['Winter', 'Fall'],
    tags: ['history', 'hiking', 'adventure', 'unesco', 'nature'],
    imageUrl:
      'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reykjavik-iceland',
    name: 'Reykjavik, Iceland',
    description:
      'Gateway to Icelands natural wonders. Experience the Northern Lights, geothermal spas, and dramatic landscapes. Perfect for nature lovers and adventure seekers.',
    daysRequired: {
      label: 'Week of Wonder',
      minDays: 6,
      maxDays: 8,
    },
    estimatedBudget: 3500,
    preferredSeasons: ['Winter'],
    tags: ['nature', 'adventure', 'northern-lights', 'hot-springs', 'photography'],
    imageUrl:
      'https://images.unsplash.com/photo-1504233529578-6d46baba6d34?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'safari-tanzania',
    name: 'Safari, Tanzania',
    description:
      'Witness the great migration in Serengeti National Park. Experience authentic African wildlife, stunning savannas, and Maasai culture. Ideal for wildlife photography and adventure.',
    daysRequired: {
      label: 'Safari Week',
      minDays: 7,
      maxDays: 10,
    },
    estimatedBudget: 4500,
    preferredSeasons: ['Summer', 'Fall'],
    tags: ['wildlife', 'safari', 'nature', 'photography', 'adventure'],
    imageUrl:
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
  },
];
