import db from './wishlistDB';

const processDestination = (dest) => {
  // Format days required
  let daysRequired = dest.duration;
  if (dest.duration.includes('-')) {
    daysRequired = `${dest.duration} days`;
  } else if (parseInt(dest.duration) >= 30) {
    const months = Math.floor(parseInt(dest.duration) / 30);
    daysRequired = `${months} ${months === 1 ? 'month' : 'months'}`;
  } else {
    daysRequired = `${dest.duration} days`;
  }

  return {
    name: dest.name,
    description: dest.description,
    estimatedBudget: dest.budget || 0,
    preferredSeason: dest.season[0] || 'any',
    daysRequired,
    tags: [...new Set(dest.tags)], // Remove duplicates
    imageUrl: '', // Will be handled by the fallback system
  };
};

export const seedDatabase = async (destinations) => {
  try {
    // Clear existing data
    await db.clearDatabase();
    
    // Process and add new destinations
    const processedDestinations = destinations.map(processDestination);
    await db.destinations.bulkAdd(processedDestinations);
    
    console.log(`Successfully added ${processedDestinations.length} destinations`);
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};

// Sample destinations data
export const initialDestinations = [
  {
    name: "Paris",
    duration: "5-7",
    season: ["spring", "autumn"],
    description: "Experience the magic of the City of Light with its iconic landmarks and culinary delights",
    budget: 2000,
    tags: ["europe", "culture", "city-break", "romance"]
  },
  {
    name: "Tokyo",
    duration: "10-14",
    season: ["spring", "autumn"],
    description: "Immerse yourself in Japan's unique blend of tradition and innovation",
    budget: 3000,
    tags: ["asia", "culture", "food", "technology"]
  },
  {
    name: "Bali",
    duration: "14",
    season: ["summer"],
    description: "Discover tropical paradise with pristine beaches and rich cultural heritage",
    budget: 2500,
    tags: ["asia", "beach", "culture", "relaxation"]
  },
  {
    name: "New Zealand",
    duration: "21",
    season: ["summer"],
    description: "Adventure through stunning landscapes from mountains to beaches",
    budget: 4500,
    tags: ["nature", "adventure", "hiking", "scenic"]
  },
  {
    name: "Iceland",
    duration: "7-10",
    season: ["summer", "winter"],
    description: "Witness the northern lights and explore dramatic landscapes",
    budget: 3500,
    tags: ["nature", "adventure", "photography"]
  },
  {
    name: "Maldives",
    duration: "7",
    season: ["winter"],
    description: "Relax in overwater villas surrounded by crystal clear waters",
    budget: 5000,
    tags: ["luxury", "beach", "romantic", "relaxation"]
  },
  {
    name: "Safari in Tanzania",
    duration: "10",
    season: ["summer"],
    description: "Experience the great migration and spot the Big Five",
    budget: 6000,
    tags: ["wildlife", "adventure", "nature", "photography"]
  },
  {
    name: "Greek Islands",
    duration: "14",
    season: ["summer"],
    description: "Island hop through crystal waters and ancient history",
    budget: 3000,
    tags: ["europe", "beach", "culture", "island-hopping"]
  },
  {
    name: "Peru",
    duration: "12",
    season: ["winter"],
    description: "Explore Machu Picchu and ancient Incan culture",
    budget: 3500,
    tags: ["culture", "history", "hiking", "adventure"]
  },
  {
    name: "Dubai",
    duration: "5",
    season: ["winter"],
    description: "Experience luxury and modernity in the desert",
    budget: 4000,
    tags: ["luxury", "shopping", "modern", "desert"]
  },
  {
    name: "Costa Rica",
    duration: "10",
    season: ["winter"],
    description: "Adventure through rainforests and pristine beaches",
    budget: 2500,
    tags: ["nature", "adventure", "wildlife", "beach"]
  },
  {
    name: "Swiss Alps",
    duration: "7",
    season: ["winter"],
    description: "Ski world-class slopes and enjoy mountain views",
    budget: 3500,
    tags: ["winter-sports", "nature", "luxury"]
  }
];
