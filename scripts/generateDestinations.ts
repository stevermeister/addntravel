import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Tag } from '../src/types/tag';

interface SimpleDestination {
  name: string;
  tags: Tag[];
  imageUrl: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const destinations: SimpleDestination[] = [
  // Famous Cities
  {
    name: "Paris, France",
    tags: ["city-break", "culture", "food-scene", "architecture", "art-gallery", "historical"],
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "Tokyo, Japan",
    tags: ["city-break", "modern", "food-scene", "culture", "shopping", "technology"],
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "New York City, USA",
    tags: ["city-break", "shopping", "culture", "food-scene", "art-gallery", "nightlife"],
    imageUrl: "https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1200&q=80"
  },
  // Natural Wonders
  {
    name: "Grand Canyon, USA",
    tags: ["nature", "hiking", "photography", "national-park", "adventure"],
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "Great Barrier Reef, Australia",
    tags: ["nature", "diving", "snorkeling", "marine-life", "beach"],
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
  },
  // Historical Sites
  {
    name: "Petra, Jordan",
    tags: ["historical", "archaeological", "unesco", "culture", "desert"],
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "Machu Picchu, Peru",
    tags: ["historical", "hiking", "archaeological", "unesco", "mountains"],
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
  },
  // Islands & Beaches
  {
    name: "Maldives",
    tags: ["beach", "luxury", "diving", "romantic", "island"],
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
  },
  {
    name: "Santorini, Greece",
    tags: ["island", "beach", "romantic", "luxury", "photography"],
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
  }
];

// Generate more destinations programmatically
const countries: string[] = [
  "Italy", "Spain", "Germany", "United Kingdom", "Thailand", "Vietnam", "Morocco", 
  "Egypt", "South Africa", "Brazil", "Mexico", "Canada", "India", "China", 
  "New Zealand", "Indonesia", "Turkey", "Greece", "Croatia", "Portugal"
];

const cities: string[] = [
  "Rome", "Barcelona", "Berlin", "London", "Bangkok", "Hanoi", "Marrakech",
  "Cairo", "Cape Town", "Rio de Janeiro", "Mexico City", "Vancouver", "Mumbai",
  "Beijing", "Auckland", "Bali", "Istanbul", "Athens", "Dubrovnik", "Lisbon"
];

const landmarks: string[] = [
  "Colosseum", "Sagrada Familia", "Brandenburg Gate", "Big Ben", "Grand Palace",
  "Ha Long Bay", "Hassan II Mosque", "Pyramids", "Table Mountain", "Christ the Redeemer",
  "Chichen Itza", "Niagara Falls", "Taj Mahal", "Great Wall", "Milford Sound",
  "Borobudur", "Hagia Sophia", "Parthenon", "Diocletian's Palace", "Belem Tower"
];

// Combine cities and countries
cities.forEach((city, index) => {
  destinations.push({
    name: `${city}, ${countries[index]}`,
    tags: ["city-break", "culture", "food-scene", 
           Math.random() > 0.5 ? "historical" : "modern",
           Math.random() > 0.5 ? "shopping" : "architecture",
           Math.random() > 0.5 ? "nightlife" : "art-gallery"],
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
  });
});

// Add landmarks
landmarks.forEach((landmark, index) => {
  destinations.push({
    name: `${landmark}, ${countries[index]}`,
    tags: ["historical", "culture", "photography",
           Math.random() > 0.5 ? "architecture" : "archaeological",
           Math.random() > 0.5 ? "unesco" : "heritage-site"],
    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
  });
});

// Write to file
const destinationsPath = path.join(__dirname, '../src/data/destinations.ts');
const content = `import { Tag } from '../types/tag';

interface SimpleDestination {
  name: string;
  tags: Tag[];
  imageUrl: string;
}

export const destinations: SimpleDestination[] = ${JSON.stringify(destinations, null, 2)};`;
fs.writeFileSync(destinationsPath, content);
console.log('Generated destinations file successfully!');
